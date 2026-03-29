SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

IMAGE ?= the-conn:dev
CONTAINER_TOOL ?= $(shell command -v podman 2>/dev/null || command -v docker 2>/dev/null || echo docker)
PORT ?= 8080
API_BASE_URL ?= http://localhost:8080
SIDEBAR_LIMIT ?= 10
GIT_BASE_URL ?= https://github.com

.PHONY: help install dev build start lint fmt fmt-check typecheck check clean image image-run

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install npm dependencies
	npm install

dev: ## Run the Next.js dev server (hot reload)
	npm run dev

build: ## Build the production bundle (.next/standalone)
	npm run build

start: ## Run the production server locally (after `make build`)
	npm start

lint: ## Run ESLint
	npm run lint

fmt: ## Format the codebase with Prettier
	npm run format

fmt-check: ## Check formatting without writing
	npm run format:check

typecheck: ## Run TypeScript type checking
	npm run typecheck

check: fmt-check lint typecheck ## Run all static checks (CI-style)

clean: ## Remove build artifacts and dependencies
	rm -rf .next node_modules

image: ## Build the production container image
	$(CONTAINER_TOOL) build -f Containerfile -t $(IMAGE) .

image-run: ## Run the built image locally with env vars
	$(CONTAINER_TOOL) run --rm -it \
		-p $(PORT):8080 \
		-e NEXT_PUBLIC_API_BASE_URL=$(API_BASE_URL) \
		-e NEXT_PUBLIC_SIDEBAR_LIMIT=$(SIDEBAR_LIMIT) \
		-e NEXT_PUBLIC_GIT_BASE_URL=$(GIT_BASE_URL) \
		$(IMAGE)
