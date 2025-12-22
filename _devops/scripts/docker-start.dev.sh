#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║     DX3 API Development Container      ║${RESET}"
echo -e "${CYAN}╚════════════════════════════════════════╝${RESET}"

NPMRC=/root/.npmrc
if test -f "$NPMRC"; then
    echo -e "${GREEN}[✓] $NPMRC exists.${RESET}"
else
    echo -e "${RED}[✗] $NPMRC does NOT exist. You WILL experience issues installing private NPM packages.${RESET}"
fi

GITCONFIG=/root/.gitconfig
if test -f "$GITCONFIG"; then
    echo -e "${GREEN}[✓] $GITCONFIG exists.${RESET}"
else
    echo -e "${RED}[✗] $GITCONFIG does NOT exist. You WILL experience issues running git commands in the container shell.${RESET}"
fi

echo -e "${BLUE}[→] Location: $(pwd)${RESET}"

# Check if node_modules needs installation/update
# Using named volume, so node_modules persists between container restarts
if [ -d "node_modules" ] && [ -f "node_modules/.pnpm/lock.yaml" ]; then
    echo -e "${GREEN}[✓] node_modules exists (using cached volume).${RESET}"
    echo -e "${YELLOW}[→] Verifying dependencies are in sync...${RESET}"

    # Quick check - only install if lockfile changed
    if pnpm install --frozen-lockfile 2>/dev/null; then
        echo -e "${GREEN}[✓] Dependencies verified.${RESET}"
    else
        echo -e "${YELLOW}[→] Lockfile changed, updating dependencies...${RESET}"
        pnpm install
        echo -e "${GREEN}[✓] Dependencies updated.${RESET}"
    fi
else
    echo -e "${YELLOW}[→] First run - installing dependencies...${RESET}"
    pnpm install
    echo -e "${GREEN}[✓] Dependencies installed.${RESET}"
fi

echo -e "${GREEN}[✓] Container is ready for development.${RESET}"
echo -e "${BLUE}    Use 'make api-start' or 'make api-watch' to run the API.${RESET}"

# Keep the container running indefinitely
tail -f /dev/null
