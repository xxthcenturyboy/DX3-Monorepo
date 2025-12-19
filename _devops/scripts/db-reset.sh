#!/usr/bin/env bash
#
# Database Reset Script
# Performs a full database reset: drop → create → seed
#
# Usage:
#   ./db-reset.sh           # Full reset with seeding
#   ./db-reset.sh --no-seed # Reset without seeding
#   ./db-reset.sh --verbose # Enable verbose output
#

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Configuration
DB_NAME="${DB_NAME:-dx-app}"
DB_USER="${DB_USER:-pguser}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-postgres-dx3}"
API_CONTAINER="${API_CONTAINER:-api-dx3}"
REDIS_CONTAINER="${REDIS_CONTAINER:-redis-dx3}"
REDIS_PORT="${REDIS_PORT:-6379}"

# Parse arguments
NO_SEED=false
VERBOSE=false

for arg in "$@"; do
  case $arg in
    --no-seed)
      NO_SEED=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --no-seed    Skip running seeders after reset"
      echo "  --verbose    Enable verbose output"
      echo "  --help       Show this help message"
      exit 0
      ;;
  esac
done

# Print header
echo -e "${CYAN}${BOLD}"
echo "╔════════════════════════════════════════╗"
echo "║     DX3 Database Reset Script          ║"
echo "╚════════════════════════════════════════╝"
echo -e "${RESET}"

# Check if containers are running
echo -e "${BLUE}▶ Checking Docker containers...${RESET}"

if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
  echo -e "${RED}✗ PostgreSQL container '${POSTGRES_CONTAINER}' is not running${RESET}"
  echo -e "${YELLOW}  Run 'docker compose up -d postgres' first${RESET}"
  exit 1
fi

echo -e "${GREEN}✓ PostgreSQL container is running${RESET}"

if ! docker ps --format '{{.Names}}' | grep -q "^${API_CONTAINER}$"; then
  echo -e "${YELLOW}⚠ API container '${API_CONTAINER}' is not running${RESET}"
  echo -e "${YELLOW}  Seeders will not be run automatically${RESET}"
  NO_SEED=true
fi

# Step 1: Terminate existing connections and drop database
echo -e "\n${BLUE}▶ Step 1: Dropping existing database '${DB_NAME}'...${RESET}"

# Terminate all existing connections to the database
docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = '${DB_NAME}'
  AND pid <> pg_backend_pid();
" > /dev/null 2>&1 || true

if docker exec "${POSTGRES_CONTAINER}" dropdb -U "${DB_USER}" --if-exists "${DB_NAME}" 2>/dev/null; then
  echo -e "${GREEN}✓ Database dropped successfully${RESET}"
else
  echo -e "${YELLOW}⚠ Database did not exist or could not be dropped${RESET}"
fi

# Step 2: Create fresh database
echo -e "\n${BLUE}▶ Step 2: Creating fresh database '${DB_NAME}'...${RESET}"
if docker exec "${POSTGRES_CONTAINER}" createdb -T template0 "${DB_NAME}" --username="${DB_USER}"; then
  echo -e "${GREEN}✓ Database created successfully${RESET}"
else
  echo -e "${RED}✗ Failed to create database${RESET}"
  exit 1
fi

# Step 3: Install PostgreSQL extensions
echo -e "\n${BLUE}▶ Step 3: Installing PostgreSQL extensions...${RESET}"
docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";' > /dev/null
docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c 'CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";' > /dev/null
docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' > /dev/null
echo -e "${GREEN}✓ Extensions installed (pgcrypto, fuzzystrmatch, uuid-ossp)${RESET}"

# Step 4: Create enum types (using lowercase for PostgreSQL convention)
echo -e "\n${BLUE}▶ Step 4: Creating enum types...${RESET}"
docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
  DO \$\$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END \$\$;
" > /dev/null

docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
  DO \$\$ BEGIN
    CREATE TYPE account_restriction AS ENUM ('ADMIN_LOCKOUT', 'LOGIN_ATTEMPTS', 'OTP_LOCKOUT');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END \$\$;
" > /dev/null

docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
  DO \$\$ BEGIN
    CREATE TYPE enum_devices_facial_auth_state AS ENUM ('CHALLENGE', 'NOT_APPLICABLE', 'SUCCESS');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END \$\$;
" > /dev/null

docker exec "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
  DO \$\$ BEGIN
    CREATE TYPE enum_notifications_level AS ENUM ('DANGER', 'INFO', 'PRIMARY', 'SUCCESS', 'WARNING');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END \$\$;
" > /dev/null

echo -e "${GREEN}✓ Enum types created${RESET}"

# Step 5: Run seeders (if API container is running)
if [ "$NO_SEED" = false ]; then
  echo -e "\n${BLUE}▶ Step 5: Running database seeders...${RESET}"

  SEEDER_ARGS="--reset"
  if [ "$VERBOSE" = true ]; then
    SEEDER_ARGS="$SEEDER_ARGS --verbose"
  fi

  # Pass Redis environment variables explicitly to ensure cache updates work
  if docker exec \
    -e "REDIS_URL=redis://${REDIS_CONTAINER}" \
    -e "REDIS_PORT=${REDIS_PORT}" \
    "${API_CONTAINER}" pnpm --filter @dx3/api db:seed $SEEDER_ARGS; then
    echo -e "${GREEN}✓ Seeders completed successfully${RESET}"
  else
    echo -e "${RED}✗ Seeders failed${RESET}"
    exit 1
  fi
else
  echo -e "\n${YELLOW}⚠ Skipping seeders (--no-seed flag or API container not running)${RESET}"
fi

# Print summary
echo -e "\n${CYAN}${BOLD}════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}✓ Database reset completed successfully!${RESET}"
echo -e "${CYAN}${BOLD}════════════════════════════════════════${RESET}"
echo -e "\n${BLUE}Database:${RESET} ${DB_NAME}"
echo -e "${BLUE}User:${RESET} ${DB_USER}"
echo -e "${BLUE}Host:${RESET} ${POSTGRES_CONTAINER}:5432"
echo ""
