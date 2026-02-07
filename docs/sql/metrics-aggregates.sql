-- ============================================================================
-- Metrics Continuous Aggregates for TimescaleDB
-- ============================================================================
-- Run this script against your TimescaleDB instance to add metrics aggregates.
-- These aggregates query the existing `logs` table for METRIC_* event types.
--
-- Prerequisites:
-- - TimescaleDB extension enabled
-- - `logs` hypertable exists (from Phase 1 Logging implementation)
--
-- Usage:
--   psql $TIMESCALE_URI -f metrics-aggregates.sql
-- ============================================================================

-- Daily metrics aggregate (includes app_id for multi-app ecosystem)
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  app_id,
  event_type,
  metadata->>'method' AS method,
  metadata->>'signupSource' AS signup_source,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT fingerprint) AS unique_devices,
  COUNT(DISTINCT ip_address) AS unique_ips
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, app_id, event_type, method, signup_source
WITH NO DATA;

-- Refresh policy: refresh daily (window must cover at least 2 buckets)
SELECT add_continuous_aggregate_policy('metrics_daily',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- Weekly metrics aggregate (for WAU) - includes app_id
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_weekly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 week', created_at) AS bucket,
  app_id,
  event_type,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, app_id, event_type
WITH NO DATA;

SELECT add_continuous_aggregate_policy('metrics_weekly',
  start_offset => INTERVAL '3 weeks',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 week',
  if_not_exists => TRUE
);

-- Monthly metrics aggregate (for MAU) - includes app_id
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_monthly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 month', created_at) AS bucket,
  app_id,
  event_type,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, app_id, event_type
WITH NO DATA;

SELECT add_continuous_aggregate_policy('metrics_monthly',
  start_offset => INTERVAL '3 months',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 month',
  if_not_exists => TRUE
);

-- Cross-app aggregate for parent dashboard (ax-admin)
-- Summarizes all apps' metrics for ecosystem-wide overview
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_daily_all_apps
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  event_type,
  COUNT(*) AS total_count,
  COUNT(DISTINCT app_id) AS unique_apps,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT ip_address) AS unique_ips
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, event_type
WITH NO DATA;

SELECT add_continuous_aggregate_policy('metrics_daily_all_apps',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- ============================================================================
-- Initial data refresh (run once after creating aggregates)
-- ============================================================================
-- Uncomment and run these if you have existing data:
-- CALL refresh_continuous_aggregate('metrics_daily', NULL, NOW());
-- CALL refresh_continuous_aggregate('metrics_weekly', NULL, NOW());
-- CALL refresh_continuous_aggregate('metrics_monthly', NULL, NOW());
-- CALL refresh_continuous_aggregate('metrics_daily_all_apps', NULL, NOW());

-- ============================================================================
-- Verification queries
-- ============================================================================
-- SELECT * FROM timescaledb_information.continuous_aggregates;
-- SELECT * FROM metrics_daily LIMIT 10;
