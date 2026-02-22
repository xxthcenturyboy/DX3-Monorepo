# Configuration
DB_NAME := dx-app
DB_USER := pguser
REDIS_CONTAINER := redis-dx3
REDIS_PORT := 6379

# Container IDs
API_CONTAINER_ID := $(shell docker compose ps -q api-node-22-dx3)
CONTAINER_PG := $(shell docker compose ps -q postgres)
POSTGRES_SEED_FILE := pg-seed.dump

################### API ###################
## start docker shell
api-shell:
	docker exec -it ${API_CONTAINER_ID} sh -c "/bin/bash"

## start api in watch mode
api-watch:
	docker exec -it ${API_CONTAINER_ID} pnpm --filter @dx3/api-app watch

## start api in nodemon
api-start:
	docker exec -it ${API_CONTAINER_ID} pnpm --filter @dx3/api-app start:dev

## run e2e tests for the API
api-e2e:
	docker exec -it ${API_CONTAINER_ID} pnpm --filter @dx3/api-e2e test

## build the API container
api-build:
	docker compose build api-node-22-dx3

## rebuild the API container (no cache)
api-rebuild:
	docker compose build --no-cache api-node-22-dx3


################### Database Operations ###################

## start postgres docker shell
shell-pg:
	docker exec -it ${CONTAINER_PG} /bin/bash

## full database reset (drop + create + seed with TypeScript seeders)
db-reset:
	@echo "Terminating existing connections..."
	docker exec -it ${CONTAINER_PG} psql -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" || true
	@echo "Dropping existing database..."
	docker exec -it ${CONTAINER_PG} dropdb -U ${DB_USER} --if-exists ${DB_NAME} || true
	@echo "Creating fresh database..."
	docker exec -it ${CONTAINER_PG} createdb -T template0 ${DB_NAME} --username=${DB_USER}
	@echo "Running TypeScript seeders..."
	docker exec -it -e REDIS_URL=redis://${REDIS_CONTAINER} -e REDIS_PORT=${REDIS_PORT} ${API_CONTAINER_ID} pnpm --filter @dx3/api db:seed --reset --verbose

## full database reset (no seeding)
db-reset-empty:
	@echo "Terminating existing connections..."
	docker exec -it ${CONTAINER_PG} psql -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" || true
	@echo "Dropping existing database..."
	docker exec -it ${CONTAINER_PG} dropdb -U ${DB_USER} --if-exists ${DB_NAME} || true
	@echo "Creating fresh database..."
	docker exec -it ${CONTAINER_PG} createdb -T template0 ${DB_NAME} --username=${DB_USER}
	@echo "Database reset complete (empty)."

## run TypeScript seeders only (no reset)
db-seed:
	docker exec -it -e REDIS_URL=redis://${REDIS_CONTAINER} -e REDIS_PORT=${REDIS_PORT} ${API_CONTAINER_ID} pnpm --filter @dx3/api db:seed --verbose

## run TypeScript seeders with reset flag
db-seed-reset:
	docker exec -it -e REDIS_URL=redis://${REDIS_CONTAINER} -e REDIS_PORT=${REDIS_PORT} ${API_CONTAINER_ID} pnpm --filter @dx3/api db:seed --reset --verbose

## create a backup dump from current database state
db-dump:
	docker exec -it ${CONTAINER_PG} sh -c "pg_dump --username=${DB_USER} -Fc ${DB_NAME} > /${POSTGRES_SEED_FILE}"
	docker cp ${CONTAINER_PG}:/${POSTGRES_SEED_FILE} ./packages/api/libs/pg/dump/${POSTGRES_SEED_FILE}
	@echo "Database dump saved to ./packages/api/libs/pg/dump/${POSTGRES_SEED_FILE}"

## restore database from dump file
db-restore:
	docker cp ./packages/api/libs/pg/dump/${POSTGRES_SEED_FILE} ${CONTAINER_PG}:/
	docker exec -it ${CONTAINER_PG} pg_restore --username=${DB_USER} -d ${DB_NAME} -c ./${POSTGRES_SEED_FILE} || true
	@echo "Database restored from dump file."

################### Integration Mode ###################

## start in integration mode (uses shared ax-infrastructure for Redis + TimescaleDB)
## dx3 keeps its own local PostgreSQL (it's the parent dashboard, not a lightweight app)
dev-integration:
	@if [ ! -f .env.integration ]; then \
		echo "Error: .env.integration not found"; \
		echo "Copy values from docs/AX-INFRASTRUCTURE-SETUP.md and create .env.integration"; \
		exit 1; \
	fi
	@echo ""
	@echo "=== Integration Mode ==="
	@echo "Checking ax-infrastructure services..."
	@if ! docker ps --filter "name=ax-redis-shared" --format "{{.Names}}" | grep -q "ax-redis-shared"; then \
		echo ""; \
		echo "ERROR: ax-infrastructure is not running!"; \
		echo "Start it first: cd ~/Developer/ArteFX/ax-infrastructure ; make up"; \
		echo ""; \
		exit 1; \
	fi
	@echo "  ✓ ax-infrastructure is running"
	@echo ""
	@echo "Starting dx3 services..."
	@echo "  → Local PostgreSQL (5433) - dx3's own database"
	@echo "  → Shared Redis (6380) - ax-infrastructure"
	@echo "  → Shared TimescaleDB (5434) - logging/metrics"
	docker compose --env-file .env.integration up -d postgres sendgrid minio
	@echo "Waiting for postgres to be healthy..."
	@sleep 3
	docker compose --env-file .env.integration up -d api-node-22-dx3
	@echo ""
	@echo "=== Integration Mode Active ==="
	@echo "Services:"
	@echo "  • API:         localhost:4000 (run 'make api-watch' + 'make api-start')"
	@echo "  • PostgreSQL:  localhost:5433 (postgres-dx3 - local)"
	@echo "  • Redis:       localhost:6380 (ax-redis-shared)"
	@echo "  • TimescaleDB: localhost:5434 (ax-timescaledb-shared)"
	@echo ""
	@echo "Postico connection: localhost:5433, user: pguser, pass: password, db: dx-app"
	@echo ""

## stop integration mode services (keeps ax-infrastructure running)
dev-integration-down:
	@echo "Stopping dx3 integration services..."
	docker compose stop api-node-22-dx3 redis postgres sendgrid minio
	@echo "Stopped. ax-infrastructure services still running."

## check integration mode services status
integration-status:
	@echo ""
	@echo "=== ax-infrastructure Services ==="
	@echo ""
	@echo "TimescaleDB (5434):"
	@docker ps --filter "name=ax-timescaledb-shared" --format "  {{.Status}}" 2>/dev/null || echo "  Not running"
	@echo ""
	@echo "Shared PostgreSQL (5435) - for lightweight apps:"
	@docker ps --filter "name=ax-postgres-shared" --format "  {{.Status}}" 2>/dev/null || echo "  Not running"
	@echo ""
	@echo "Shared Redis (6380):"
	@docker ps --filter "name=ax-redis-shared" --format "  {{.Status}}" 2>/dev/null || echo "  Not running"
	@echo ""
	@echo "=== dx3 Services ==="
	@echo ""
	@echo "API (4000):"
	@docker ps --filter "name=api-dx3" --format "  {{.Status}}" 2>/dev/null || echo "  Not running"
	@echo ""
	@echo "Local PostgreSQL (5433) - dx3's database:"
	@docker ps --filter "name=postgres-dx3" --format "  {{.Status}}" 2>/dev/null || echo "  Not running"
	@echo ""

################### Help ###################

## show all available commands
help:
	@echo ""
	@echo "DX3 Monorepo Makefile Commands"
	@echo "==============================="
	@echo ""
	@echo "API Commands:"
	@echo "  make api-shell      - Start a shell inside the API container"
	@echo "  make api-watch      - Start API in watch mode (esbuild)"
	@echo "  make api-start      - Start API with nodemon"
	@echo "  make api-e2e        - Run E2E tests"
	@echo "  make api-build      - Build the API Docker container"
	@echo "  make api-rebuild    - Rebuild the API Docker container (no cache)"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-reset       - Full reset: drop DB, create fresh, run seeders"
	@echo "  make db-reset-empty - Reset DB without seeding"
	@echo "  make db-seed        - Run TypeScript seeders only"
	@echo "  make db-seed-reset  - Run seeders with --reset flag (force sync)"
	@echo "  make db-dump        - Create a backup dump of current database"
	@echo "  make db-restore     - Restore database from dump file"
	@echo "  make shell-pg       - Start a shell inside PostgreSQL container"
	@echo ""
	@echo "Integration Mode Commands:"
	@echo "  make dev-integration      - Start in integration mode (uses ax-infrastructure)"
	@echo "  make dev-integration-down - Stop dx3 services (keeps ax-infrastructure)"
	@echo "  make integration-status   - Check all services status"
	@echo ""
	@echo "Usage Examples:"
	@echo "  make db-reset            - Start fresh with seeded data"
	@echo "  make db-dump             - Backup current state before making changes"
	@echo "  make dev-integration     - Connect to shared ax-infrastructure"
	@echo ""
