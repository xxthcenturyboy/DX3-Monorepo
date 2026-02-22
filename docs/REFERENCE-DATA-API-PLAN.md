# IANA TLD and Disposable Email Domains Service Plan

**Source:** Reference Data API planning session  
**Status:** Implemented

## Overview

Reference Data service in ax-infrastructure with packages/api (libs + apps). API uses key/secret auth per app. Worker runs daily cron sync. dx3 app APIs call the Reference Data API with app-specific credentials.

## Architecture

- **Reference Data API** – Express app: `GET /check/domain/:domain`, `GET /sync-status`, `POST /admin/keys`
- **Reference Data Worker** – Daily sync at 02:00 UTC (IANA TLDs + disposable domains)
- **Lookup:** In-memory `Set<string>`; fallback to PostgreSQL when cache empty
- **Refresh:** Worker publishes to Redis `ref-data:sync-complete`; API subscribes and reloads

## dx3 Integration

- `ReferenceDataApiClient` in `packages/api/libs/reference-data-client/`
- `EmailUtil.validateAsync()` and `isDisposableDomainAsync()` use API when `REFERENCE_DATA_API_URL` + key + secret configured
- Auth services (login, signup, sendOtp) use `validateAsync()`

## Env Vars

**ax-infrastructure:** `REFERENCE_DATA_SUPER_ADMIN_KEY`, `REFERENCE_DATA_SUPER_ADMIN_SECRET`  
**dx3 (integration):** `REFERENCE_DATA_API_URL`, `REFERENCE_DATA_API_KEY`, `REFERENCE_DATA_API_SECRET`
