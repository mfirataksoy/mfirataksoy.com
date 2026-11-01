-- Chat widget storage (was Netlify Blobs). Ids start with the time, so they sort oldest to newest.
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

-- Rate-limit counters: one row per rule and time window.
CREATE TABLE counters (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
