# One place for every local operation. Targets wrap npm scripts; CI calls npm directly.
# Requires Node 24 (.nvmrc), Docker and the Supabase CLI.

.DEFAULT_GOAL := help
.PHONY: help setup env content dev logs stop db-bootstrap db-reset kb-sync-live user typecheck lint test test-e2e lighthouse build check docker-api

help: ## List targets
	@grep -E '^[a-z0-9-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  make %-18s %s\n", $$1, $$2}'

setup: env ## Install deps, generate the Prisma client, install the e2e browser
	npm ci
	npm run prisma:generate -w @landednz/api
	cd apps/web && npx playwright install chromium

env: ## Create missing env files from their .env.example (never overwrites)
	@for f in apps/api/.env.local apps/web/.env.local supabase/.env; do \
	  [ -f $$f ] && echo "$$f exists" || { cp $${f%.local}.example $$f && echo "created $$f"; }; \
	done

content: ## Validate the content YAML, write the bundle and packages/types/dimensions.ts
	npm run content:build -w @landednz/api

dev: content ## Supabase + bootstrap if empty + API (:3001) + web (:3000) in the background
	npm run dev:all

logs: ## Follow the API and web dev logs (.dev/)
	tail -f .dev/api.log .dev/web.log

# LISTEN only: a plain port match would also kill the browser tabs connected to :3000.
stop: ## Stop web (:3000), API (:3001) and Supabase (data kept)
	@pids=$$(lsof -ti tcp:3000 -ti tcp:3001 -sTCP:LISTEN); [ -z "$$pids" ] || { kill $$pids; kill -CONT $$pids 2>/dev/null; echo "stopped web/API ($$pids)"; }
	supabase stop

db-bootstrap: ## Migrate, sync KB chunks from the content bundle, vector index
	npm run db:bootstrap -w @landednz/api

db-reset: ## Wipe the local DB and bootstrap again (destroys local data)
	supabase db reset
	npm run db:bootstrap -w @landednz/api

kb-sync-live: ## Re-embed the KB chunks with real OpenAI embeddings (needs both API keys)
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

lighthouse: ## Lighthouse on /, /onboarding, /signin against the production web build (run make build first)
	npm run lighthouse

build: ## Build API and web
	npm run build

check: content typecheck lint test build ## Everything CI runs before e2e

docker-api: ## Run the production API container on :3001 against local Supabase
	npm run docker:api
