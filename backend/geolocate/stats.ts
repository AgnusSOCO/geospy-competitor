import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = SQLDatabase.named("geolocate");

export interface StatsResponse {
  totalAnalyses: number;
  averageConfidence: number;
  averageProcessingTime: number;
  countryDistribution: Array<{
    country: string;
    count: number;
  }>;
  analysisTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

// Retrieves analytics and statistics about geolocation analyses.
export const getStats = api<void, StatsResponse>(
  { expose: true, method: "GET", path: "/stats" },
  async () => {
    const totalResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM analysis_history
    `;

    const avgConfidenceResult = await db.queryRow<{ avg: number }>`
      SELECT AVG(confidence) as avg FROM analysis_history
    `;

    const avgProcessingTimeResult = await db.queryRow<{ avg: number }>`
      SELECT AVG(processing_time) as avg FROM analysis_history
    `;

    const countryDistribution = await db.queryAll<{ country: string; count: number }>`
      SELECT 
        location->>'country' as country,
        COUNT(*) as count
      FROM analysis_history 
      GROUP BY location->>'country'
      ORDER BY count DESC
      LIMIT 10
    `;

    const analysisTypeDistribution = await db.queryAll<{ type: string; count: number }>`
      SELECT 
        analysis_type as type,
        COUNT(*) as count
      FROM analysis_history 
      GROUP BY analysis_type
      ORDER BY count DESC
    `;

    const recentActivity = await db.queryAll<{ date: string; count: number }>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM analysis_history 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      totalAnalyses: totalResult?.count || 0,
      averageConfidence: Math.round(avgConfidenceResult?.avg || 0),
      averageProcessingTime: Math.round(avgProcessingTimeResult?.avg || 0),
      countryDistribution,
      analysisTypeDistribution,
      recentActivity
    };
  }
);
