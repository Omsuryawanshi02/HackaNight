.PHONY: all test lint typecheck demo db-up db-down logs clean fmt

all: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

test:  ## Run all tests
	pytest --tb=short -v

lint:  ## Run ruff linter
	ruff check app/

typecheck:  ## Run mypy type checking
	mypy app/ --strict

fmt:  ## Format code with ruff
	ruff check --fix app/

db-up:  ## Start PostgreSQL in Docker
	docker compose up -d db

db-down:  ## Stop PostgreSQL Docker container
	docker compose down

db-migrate-up:  ## Run alembic migrations head
	alembic upgrade head

db-migrate-down:  ## Revert last alembic migration
	alembic downgrade -1

db-create:  ## Create a new alembic migration
	@read -p "Enter migration message: " msg; alembic revision --autogenerate -m "$$msg"

db-seed:  ## Seed the database with synthetic data
	python scripts/seed.py

demo:  ## Run the demo flow (offline with Mock providers)
	python scripts/demo_flow.py

clean:  ## Remove cache and build artifacts
	rm -rf **/__pycache__ **/.pytest_cache **/htmlcov *.egg-info
	rm -rf dist build