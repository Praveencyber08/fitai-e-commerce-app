-- Session tokens for cookie-based auth (Aurora DSQL: no foreign keys).

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_sessions_user ON sessions(user_id);
COMMIT;
