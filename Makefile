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


################### Postgres ###################
## start postgres docker shell
shell-pg:
	docker exec -it ${CONTAINER_PG} /bin/bash

## creates the db and initial tables
initialize-pg:
	docker exec -it ${CONTAINER_PG} createdb -T template0 dx-nx --username=pguser
	docker cp ./api/libs/pg/src/dump/${POSTGRES_SEED_FILE} ${CONTAINER_PG}:/
	docker exec -it ${CONTAINER_PG} pg_restore --username=pguser -d dx-nx ./${POSTGRES_SEED_FILE}

## seeds the database
seed-pg:
	docker cp ./api/libs/pg/src/dump/${POSTGRES_SEED_FILE} ${CONTAINER_PG}:/
	docker exec -it ${CONTAINER_PG} pg_restore --username=pguser -d dx-nx ./${POSTGRES_SEED_FILE}

## creates the seed file
dump-pg:
	docker exec -it ${CONTAINER_PG} sh -c "pg_dump --username=pguser -Fc dx-nx > /${POSTGRES_SEED_FILE}"
	docker cp ${CONTAINER_PG}:/${POSTGRES_SEED_FILE} ./api/libs/pg/src/dump/${POSTGRES_SEED_FILE}
