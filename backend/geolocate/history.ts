import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("geolocate", {
  migrations: "./migrations",
});

export interface AnalysisHistoryItem {
  id: string;
  imageHash: string;
  location: {
    country: string;
    region?: string;
    city?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  confidence: number;
  analysisType: string;
  createdAt: Date;
  processingTime: number;
}

export interface GetHistoryResponse {
  analyses: AnalysisHistoryItem[];
  total: number;
}

// Retrieves the analysis history with pagination.
export const getHistory = api<{ limit?: number; offset?: number }, GetHistoryResponse>(
  { expose: true, method: "GET", path: "/history" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const analyses = await db.queryAll<AnalysisHistoryItem>`
      SELECT 
        id,
        image_hash as "imageHash",
        location,
        confidence,
        analysis_type as "analysisType",
        created_at as "createdAt",
        processing_time as "processingTime"
      FROM analysis_history 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM analysis_history
    `;

    return {
      analyses,
      total: totalResult?.count || 0
    };
  }
);

// Saves an analysis to the history.
export const saveAnalysis = api<{
  imageHash: string;
  location: any;
  confidence: number;
  analysisType: string;
  processingTime: number;
}, { id: string }>(
  { expose: true, method: "POST", path: "/history" },
  async (req) => {
    const id = require('crypto').randomUUID();
    
    await db.exec`
      INSERT INTO analysis_history (
        id, image_hash, location, confidence, analysis_type, processing_time, created_at
      ) VALUES (
        ${id}, ${req.imageHash}, ${JSON.stringify(req.location)}, 
        ${req.confidence}, ${req.analysisType}, ${req.processingTime}, NOW()
      )
    `;

    return { id };
  }
);
