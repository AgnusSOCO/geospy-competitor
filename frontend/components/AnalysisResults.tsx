import React from 'react';
import { MapPin, Target, Clock, Eye, Brain, Building, Trees, Car, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { GeolocationResult } from '~backend/geolocate/analyze';

interface AnalysisResultsProps {
  result: GeolocationResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 80) return "default";
    if (confidence >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Main Location Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                {result.location.city ? 
                  `${result.location.city}, ${result.location.country}` : 
                  result.location.country
                }
              </CardTitle>
              <CardDescription className="text-base">
                {result.location.region && `${result.location.region} • `}
                {result.coordinates.latitude.toFixed(4)}, {result.coordinates.longitude.toFixed(4)}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getConfidenceVariant(result.confidence)} className="text-sm">
                <Target className="h-3 w-3 mr-1" />
                {result.confidence}% Confidence
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {result.metadata.processingTime}ms
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.location.address && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                <p>{result.location.address}</p>
              </div>
            )}
            
            {result.location.landmarks && result.location.landmarks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Landmarks</h4>
                <div className="flex flex-wrap gap-2">
                  {result.location.landmarks.map((landmark, index) => (
                    <Badge key={index} variant="outline">
                      {landmark}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence Level</span>
                <span className="font-medium">{result.confidence}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getConfidenceColor(result.confidence)}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Clues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Clues Analysis
          </CardTitle>
          <CardDescription>
            Key visual indicators used to determine the location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.visualClues.architecture && result.visualClues.architecture.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Architecture</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.visualClues.architecture.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.visualClues.vegetation && result.visualClues.vegetation.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trees className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vegetation</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.visualClues.vegetation.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.visualClues.signage && result.visualClues.signage.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Signage</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.visualClues.signage.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.visualClues.vehicles && result.visualClues.vehicles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vehicles</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.visualClues.vehicles.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.visualClues.infrastructure && result.visualClues.infrastructure.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Infrastructure</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.visualClues.infrastructure.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.visualClues.culturalIndicators && result.visualClues.culturalIndicators.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cultural Indicators</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.visualClues.culturalIndicators.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.visualClues.weather && (
              <div className="space-y-2">
                <span className="font-medium">Weather</span>
                <Badge variant="secondary">{result.visualClues.weather}</Badge>
              </div>
            )}

            {result.visualClues.timeOfDay && (
              <div className="space-y-2">
                <span className="font-medium">Time of Day</span>
                <Badge variant="secondary">{result.visualClues.timeOfDay}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reasoning Steps */}
      {result.reasoning && result.reasoning.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Analysis Reasoning
            </CardTitle>
            <CardDescription>
              Step-by-step reasoning process used to determine the location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.reasoning.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Analysis Type</span>
              <p className="font-medium capitalize">{result.metadata.analysisType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Processing Time</span>
              <p className="font-medium">{result.metadata.processingTime}ms</p>
            </div>
            <div>
              <span className="text-muted-foreground">Image Hash</span>
              <p className="font-medium font-mono text-xs">{result.metadata.imageHash.slice(0, 8)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
