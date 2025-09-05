import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, Link as LinkIcon, MapPin, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from '../components/ImageUpload';
import { AnalysisResults } from '../components/AnalysisResults';
import backend from '~backend/client';
import type { AnalyzeImageRequest, GeolocationResult } from '~backend/geolocate/analyze';

export function AnalyzePage() {
  const [analysisConfig, setAnalysisConfig] = useState<{
    analysisType: 'quick' | 'detailed' | 'expert';
    includeConfidence: boolean;
    includeReasoningSteps: boolean;
  }>({
    analysisType: 'detailed',
    includeConfidence: true,
    includeReasoningSteps: true,
  });
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('upload');
  
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (request: AnalyzeImageRequest) => {
      return await backend.geolocate.analyze(request);
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = async () => {
    if (!imageUrl && !imageData) {
      toast({
        title: "No Image Provided",
        description: "Please upload an image or provide a URL.",
        variant: "destructive",
      });
      return;
    }

    const request: AnalyzeImageRequest = {
      ...analysisConfig,
      ...(imageData ? { imageData } : { imageUrl }),
    };

    try {
      await analyzeMutation.mutateAsync(request);
      toast({
        title: "Analysis Complete",
        description: "Image has been successfully analyzed.",
      });
    } catch (error) {
      // Error handling is done in onError
    }
  };

  const handleImageUpload = (base64Data: string) => {
    setImageData(base64Data);
    setCurrentTab('upload');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Image Geolocation Analysis</h1>
        <p className="text-muted-foreground">
          Upload an image or provide a URL to discover its geographic location
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Image Input</span>
              </CardTitle>
              <CardDescription>
                Choose how to provide your image for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <ImageUpload onImageUpload={handleImageUpload} />
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <div className="flex space-x-2">
                      <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Analysis Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how the analysis should be performed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="analysisType">Analysis Type</Label>
                <Select
                  value={analysisConfig.analysisType}
                  onValueChange={(value: 'quick' | 'detailed' | 'expert') =>
                    setAnalysisConfig({ ...analysisConfig, analysisType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick - Fast basic analysis</SelectItem>
                    <SelectItem value="detailed">Detailed - Comprehensive analysis</SelectItem>
                    <SelectItem value="expert">Expert - Maximum depth analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Confidence Score</Label>
                  <p className="text-sm text-muted-foreground">
                    Show confidence level for the analysis
                  </p>
                </div>
                <Switch
                  checked={analysisConfig.includeConfidence}
                  onCheckedChange={(checked) =>
                    setAnalysisConfig({ ...analysisConfig, includeConfidence: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Reasoning Steps</Label>
                  <p className="text-sm text-muted-foreground">
                    Show detailed reasoning process
                  </p>
                </div>
                <Switch
                  checked={analysisConfig.includeReasoningSteps}
                  onCheckedChange={(checked) =>
                    setAnalysisConfig({ ...analysisConfig, includeReasoningSteps: checked })
                  }
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || (!imageUrl && !imageData)}
                className="w-full"
                size="lg"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Analyze Location
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {analyzeMutation.data ? (
            <AnalysisResults result={analyzeMutation.data} />
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground">
                  Upload an image and configure your analysis settings to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
