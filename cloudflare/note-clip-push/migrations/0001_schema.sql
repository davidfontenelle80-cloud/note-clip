CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  fire_at INTEGER NOT NULL,
  fired INTEGER NOT NULL DEFAULT 0,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_subscription_source
  ON reminders (subscription_id, source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders (fired, fire_at);
CREATE INDEX IF NOT EXISTS idx_reminders_source ON reminders (source_type, source_id);
