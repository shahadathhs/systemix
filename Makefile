# Systemix Monorepo Makefile

# Variables
PNPM := pnpm
TURBO := pnpm turbo

# Discovery
PACKAGES := $(shell ls packages 2>/dev/null)
CONFIGS := $(shell ls configs 2>/dev/null)

.PHONY: help build build-% lint lint-% format format-% typecheck clean clean-all

help:
	@echo "Systemix Monorepo Management"
	@echo "============================"
	@echo "Global Commands:"
	@echo "  make build          Build all packages"
	@echo "  make lint           Lint all packages"
	@echo "  make format         Format all files"
	@echo "  make typecheck      Typecheck all packages"
	@echo "  make clean          Clean all build artifacts"
	@echo ""
	@echo "Package Commands (Dynamic):"
	@echo "  make build-<pkg>    Build a specific package (e.g., make build-password)"
	@echo "  make lint-<pkg>     Lint a specific package"
	@echo "  make format-<pkg>   Format a specific package"
	@echo "  make typecheck-<pkg> Typecheck a specific package"
	@echo ""
	@echo "Available Packages: $(PACKAGES)"
	@echo "Available Configs:  $(CONFIGS)"

# --- Global Targets ---

build:
	$(TURBO) build

lint:
	$(TURBO) lint

format:
	$(PNPM) format:fix

typecheck:
	$(TURBO) typecheck

clean:
	$(TURBO) clean
	rm -rf dist

clean-all:
	$(TURBO) clean:turbo
	rm -rf node_modules **/node_modules dist **/dist

# --- Dynamic Package Targets ---

# Build pattern
build-%:
	$(TURBO) build --filter=@systemix/$*

# Lint pattern
lint-%:
	$(TURBO) lint --filter=@systemix/$*

# Format pattern
format-%:
	$(TURBO) format:fix --filter=@systemix/$*

# Typecheck pattern
typecheck-%:
	$(TURBO) typecheck --filter=@systemix/$*
