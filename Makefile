.PHONY: build up down logs restart rebuild db db-connect

# === CONFIGURATION ===
ENV_FILE = apps/users/.env


DC = docker-compose --env-file $(ENV_FILE)

# === COMMANDS ===
build:
	$(DC) build

up:
	$(DC) up -d

down:
	$(DC) down

logs:
	$(DC) logs -f

db:
	$(DC) exec db sh

restart:
	$(DC) down && $(DC) up -d

rebuild:
	$(DC) down
	$(DC) build --no-cache
	$(DC) up -d



rabbit-view:
	@firefox-developer --safe-mode "http://localhost:15672/" >/dev/null 2>&1 &




# === DB CONNECTION (requires psql inside container) ===
db-connect:
	@export $$(grep -v '^#' $(ENV_FILE) | xargs) && \
	docker-compose --env-file $(ENV_FILE) exec db \
	psql -U $$POSTGRES_USER -d $$POSTGRES_DB
