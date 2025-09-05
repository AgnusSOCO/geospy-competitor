CREATE TABLE analysis_history (
  id TEXT PRIMARY KEY,
  image_hash TEXT NOT NULL,
  location JSONB NOT NULL,
  confidence INTEGER NOT NULL,
  analysis_type TEXT NOT NULL,
  processing_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at DESC);
CREATE INDEX idx_analysis_history_image_hash ON analysis_history(image_hash);
