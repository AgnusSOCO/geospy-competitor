import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Bucket } from "encore.dev/storage/objects";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import * as crypto from "crypto";

const openAIKey = secret("OpenAIKey");
const openai = createOpenAI({ apiKey: openAIKey() });

const imageUploads = new Bucket("image-uploads", {
  public: true,
});

export interface AnalyzeImageRequest {
  imageUrl?: string;
  imageData?: string; // base64 encoded image
  analysisType?: "quick" | "detailed" | "expert";
  includeConfidence?: boolean;
  includeReasoningSteps?: boolean;
}

export interface GeolocationResult {
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number; // radius in meters
  };
  location: {
    country: string;
    region?: string;
    city?: string;
    address?: string;
    landmarks?: string[];
  };
  confidence: number; // 0-100
  reasoning?: string[];
  visualClues: {
    architecture?: string[];
    vegetation?: string[];
    signage?: string[];
    vehicles?: string[];
    infrastructure?: string[];
    weather?: string;
    timeOfDay?: string;
    culturalIndicators?: string[];
  };
  metadata: {
    analysisType: string;
    processingTime: number;
    imageHash: string;
  };
}

const geolocationSchema = z.object({
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
  }),
  location: z.object({
    country: z.string(),
    region: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    landmarks: z.array(z.string()).optional(),
  }),
  confidence: z.number().min(0).max(100),
  reasoning: z.array(z.string()).optional(),
  visualClues: z.object({
    architecture: z.array(z.string()).optional(),
    vegetation: z.array(z.string()).optional(),
    signage: z.array(z.string()).optional(),
    vehicles: z.array(z.string()).optional(),
    infrastructure: z.array(z.string()).optional(),
    weather: z.string().optional(),
    timeOfDay: z.string().optional(),
    culturalIndicators: z.array(z.string()).optional(),
  }),
});

function isValidBase64(str: string): boolean {
  try {
    // Check if the string is valid base64
    const decoded = Buffer.from(str, 'base64');
    const reencoded = decoded.toString('base64');
    
    // Check if re-encoding gives the same result (accounting for padding)
    const normalizedInput = str.replace(/\s/g, '');
    const normalizedReencoded = reencoded.replace(/\s/g, '');
    
    return normalizedInput === normalizedReencoded && decoded.length > 0;
  } catch {
    return false;
  }
}

function getImageMimeType(buffer: Buffer): string {
  // Check for common image file signatures
  if (buffer.length >= 8) {
    // PNG signature
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    }
    // JPEG signature
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg';
    }
    // GIF signature
    if (buffer.toString('ascii', 0, 3) === 'GIF') {
      return 'image/gif';
    }
    // WebP signature
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return 'image/webp';
    }
  }
  
  // Default to JPEG if we can't determine the type
  return 'image/jpeg';
}

// Analyzes an image to determine its geographic location using AI.
export const analyze = api<AnalyzeImageRequest, GeolocationResult>(
  { expose: true, method: "POST", path: "/analyze" },
  async (req) => {
    const startTime = Date.now();
    
    if (!req.imageUrl && !req.imageData) {
      throw APIError.invalidArgument("Either imageUrl or imageData must be provided");
    }

    let imageUrl = req.imageUrl;
    let imageHash = "";

    // If base64 image data is provided, upload it to object storage
    if (req.imageData) {
      try {
        // Clean the base64 string (remove any whitespace)
        const cleanBase64 = req.imageData.replace(/\s/g, '');
        
        // Validate base64 format
        if (!isValidBase64(cleanBase64)) {
          throw APIError.invalidArgument("Invalid base64 format");
        }
        
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        
        // Check if the buffer is not empty and has reasonable size
        if (imageBuffer.length === 0) {
          throw APIError.invalidArgument("Empty image data");
        }
        
        if (imageBuffer.length > 50 * 1024 * 1024) { // 50MB limit
          throw APIError.invalidArgument("Image too large (max 50MB)");
        }
        
        // Verify it looks like an image file
        const mimeType = getImageMimeType(imageBuffer);
        const extension = mimeType.split('/')[1] || 'jpg';
        
        imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
        const fileName = `${imageHash}.${extension}`;
        
        await imageUploads.upload(fileName, imageBuffer, {
          contentType: mimeType
        });
        
        imageUrl = imageUploads.publicUrl(fileName);
      } catch (error) {
        if (error instanceof Error && error.message.includes('APIError')) {
          throw error;
        }
        throw APIError.invalidArgument(`Invalid base64 image data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (req.imageUrl) {
      imageHash = crypto.createHash('sha256').update(req.imageUrl).digest('hex');
    }

    const analysisType = req.analysisType || "detailed";
    const includeConfidence = req.includeConfidence !== false;
    const includeReasoningSteps = req.includeReasoningSteps !== false;

    const systemPrompt = getSystemPrompt(analysisType, includeConfidence, includeReasoningSteps);

    try {
      // Check if OpenAI key is available
      const apiKey = openAIKey();
      if (!apiKey || apiKey.trim() === '') {
        throw APIError.internal("OpenAI API key not configured. Please set the OpenAI API key in the Infrastructure tab.");
      }

      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: geolocationSchema,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and provide a detailed geolocation analysis."
              },
              {
                type: "image",
                image: imageUrl!
              }
            ]
          }
        ],
        temperature: 0.3,
        maxRetries: 2,
      });

      const processingTime = Date.now() - startTime;

      return {
        ...result.object,
        metadata: {
          analysisType,
          processingTime,
          imageHash
        }
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      
      // Handle specific OpenAI errors
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw APIError.internal("OpenAI API key is invalid or not configured. Please check your API key configuration.");
        }
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw APIError.resourceExhausted("OpenAI API quota exceeded or rate limit hit. Please try again later.");
        }
        if (error.message.includes('model') || error.message.includes('gpt-4o')) {
          throw APIError.internal("OpenAI model not available. The API key may not have access to GPT-4o.");
        }
        if (error.message.includes('image')) {
          throw APIError.invalidArgument("Image could not be processed by the AI model. Please try a different image.");
        }
      }
      
      throw APIError.internal(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

function getSystemPrompt(analysisType: string, includeConfidence: boolean, includeReasoningSteps: boolean): string {
  const basePrompt = `You are an expert geolocation analyst with decades of experience in visual intelligence and geographic analysis. Your task is to analyze images and determine their most likely geographic location with high precision.

ANALYSIS FRAMEWORK:
1. VISUAL CLUES ANALYSIS
   - Architecture: Building styles, construction materials, roof types, window designs
   - Signage: Languages, scripts, fonts, commercial signs, street signs, license plates
   - Vegetation: Plant species, climate indicators, seasonal markers
   - Infrastructure: Road types, utility poles, street lighting, public transport
   - Vehicles: Car models, license plate formats, driving side indicators
   - Cultural Indicators: Clothing styles, business types, urban planning patterns
   - Environmental: Weather patterns, lighting conditions, seasonal indicators

2. GEOGRAPHIC REASONING
   - Climate zone assessment based on vegetation and weather
   - Cultural region identification through architectural and social markers
   - Economic development level indicators
   - Regional transportation and infrastructure patterns
   - Language and script analysis from visible text

3. PRECISION TECHNIQUES
   - Cross-reference multiple visual indicators
   - Eliminate impossible locations through contradiction analysis
   - Use landmark recognition when available
   - Apply statistical geographic knowledge
   - Consider photographic metadata implications

CONFIDENCE SCORING:
- 90-100%: Multiple definitive indicators, landmark recognition, or unique identifying features
- 70-89%: Strong regional indicators with consistent cultural/geographic markers
- 50-69%: General regional identification with some uncertainty
- 30-49%: Broad geographic area with limited specific indicators
- 10-29%: Very general location based on basic climate/development indicators
- 0-9%: Insufficient information for reliable geolocation

IMPORTANT CONSTRAINTS:
- You must always provide valid coordinates (latitude between -90 and 90, longitude between -180 and 180)
- You must always provide a country name
- If specific location cannot be determined, provide your best educated guess based on available visual evidence
- Confidence scores should reflect the actual certainty of your analysis`;

  const analysisSpecificPrompts = {
    quick: `
QUICK ANALYSIS MODE:
Focus on the most obvious and definitive visual indicators. Provide rapid assessment based on:
- Immediately recognizable landmarks or distinctive features
- Clear language/script indicators
- Obvious climate and vegetation patterns
- Distinctive architectural styles`,

    detailed: `
DETAILED ANALYSIS MODE:
Conduct comprehensive analysis of all available visual information:
- Systematic examination of all visual clue categories
- Cross-validation of indicators
- Regional narrowing through elimination
- Cultural pattern recognition
- Infrastructure analysis`,

    expert: `
EXPERT ANALYSIS MODE:
Apply maximum analytical depth and specialized knowledge:
- Advanced architectural history and regional variations
- Detailed vegetation and climate pattern analysis
- Linguistic and cultural anthropology insights
- Historical context and temporal indicators
- Micro-geographic pattern recognition
- Socioeconomic development indicators
- Urban planning and infrastructure evolution patterns`
  };

  let prompt = basePrompt + "\n\n" + analysisSpecificPrompts[analysisType as keyof typeof analysisSpecificPrompts];

  if (includeReasoningSteps) {
    prompt += `\n\nREASONING DOCUMENTATION:
Document your analytical process step-by-step, showing how you arrived at your conclusion through logical deduction and evidence evaluation.`;
  }

  if (includeConfidence) {
    prompt += `\n\nCONFIDENCE ASSESSMENT:
Provide honest confidence scoring based on the strength and consistency of available evidence. Lower confidence is acceptable when evidence is limited.`;
  }

  prompt += `\n\nIMPORTANT: Always provide your best estimate even with limited information. Use geographic and statistical knowledge to make educated assessments when direct visual evidence is insufficient.`;

  return prompt;
}
