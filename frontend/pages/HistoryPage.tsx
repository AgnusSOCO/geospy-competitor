import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, MapPin, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import backend from '~backend/client';

export function HistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => backend.geolocate.getHistory({ limit: 100 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground">Loading your previous analyses...</p>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <History className="h-8 w-8" />
          Analysis History
        </h1>
        <p className="text-muted-foreground">
          View your previous geolocation analyses
        </p>
      </div>

      {history?.analyses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No History Yet</h3>
            <p className="text-muted-foreground">
              Your analysis history will appear here once you start analyzing images
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {history?.total} total analyses
            </p>
          </div>
          
          <div className="grid gap-4">
            {history?.analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {analysis.location.city ? 
                          `${analysis.location.city}, ${analysis.location.country}` : 
                          analysis.location.country
                        }
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {analysis.processingTime}ms
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={analysis.confidence >= 70 ? "default" : "secondary"}>
                        <Target className="h-3 w-3 mr-1" />
                        {analysis.confidence}%
                      </Badge>
                      <Badge variant="outline">
                        {analysis.analysisType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Coordinates:</span><br />
                        {analysis.location.coordinates.latitude.toFixed(4)}, {analysis.location.coordinates.longitude.toFixed(4)}
                      </div>
                      {analysis.location.region && (
                        <div>
                          <span className="font-medium">Region:</span><br />
                          {analysis.location.region}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
