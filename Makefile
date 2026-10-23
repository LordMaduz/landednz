# One place for every local operation. Targets wrap npm scripts; CI calls npm directly.
# Requires Node 24 (.nvmrc), Docker and the Supabase CLI.

.DEFAULT_GOAL := help
.PHONY: help setup env dev stop db-bootstrap db-reset db-reset-live user typecheck lint test test-e2e build check docker-api

help: ## List targets
	@grep -E '^[a-z0-9-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  make %-18s %s\n", $$1, $$2}'

setup: env ## Install deps, generate the Prisma client, install the e2e browser
	npm ci
	npm run prisma:generate -w @landednz/api
	cd apps/web && npx playwright install chromium

env: ## Create missing .env.local files from .env.example (never overwrites)
	@for d in apps/api apps/web; do \
	  [ -f $$d/.env.local ] && echo "$$d/.env.local exists" || { cp $$d/.env.example $$d/.env.local && echo "created $$d/.env.local"; }; \
	done

dev: ## Supabase + bootstrap if empty + API (:3001) + web (:3000); Ctrl-C stops
	npm run dev:all

stop: ## Stop the local Supabase stack (data kept)
	supabase stop

db-bootstrap: ## Migrate, seed the KB, mock embeddings, vector index
	npm run db:bootstrap -w @landednz/api

db-reset: ## Wipe the local DB and bootstrap again (destroys local data)
	supabase db reset
	npm run db:bootstrap -w @landednz/api

# Bootstrap only embeds chunks that have none, so real embeddings need an empty DB.
db-reset-live: ## Wipe the local DB, bootstrap with real OpenAI embeddings (needs both API keys)
	supabase db reset
	AI_MODE=live npm run db:bootstrap -w @landednz/api

user: ## Create a confirmed local sign-in user: make user EMAIL=you@example.com PASSWORD=secret123
	@[ -n "$(EMAIL)" ] && [ -n "$(PASSWORD)" ] || { echo "usage: make user EMAIL=... PASSWORD=..." >&2; exit 1; }
	@set -a && . apps/web/.env.local && set +a && \
	out=$$(curl -sS --fail-with-body -X POST "$$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
	  -H "apikey: $$SUPABASE_SECRET_KEY" -H 'Content-Type: application/json' \
	  -d '{"email":"$(EMAIL)","password":"$(PASSWORD)","email_confirm":true}') || { echo "$$out" >&2; exit 1; }; \
	echo "created $(EMAIL) — sign in at http://localhost:3000/signin"

typecheck: ## Typecheck all workspaces
	npm run typecheck

lint: ## Lint all workspaces
	npm run lint

test: ## API + web unit tests (Supabase must be running)
	npm test

test-e2e: ## Playwright e2e; starts API and web if they are not up
	npm run test:e2e

build: ## Build API and web
	npm run build

check: typecheck lint test build ## Everything CI runs before e2e

docker-api: ## Run the production API container on :3001 against local Supabase
	npm run docker:api
