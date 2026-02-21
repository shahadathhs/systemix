# Systemix Monorepo Makefile
# pnpm workspace + Turborepo

# Variables
PNPM := pnpm
TURBO := pnpm turbo

# Resolve turbo filter: demos uses "demos", others use @systemix/<name>
pkg_filter = $(if $(filter demos,$(1)),demos,@systemix/$(1))

# Discovery
PACKAGES := $(shell ls packages 2>/dev/null)
CONFIGS := $(shell ls configs 2>/dev/null)
WORKSPACES := $(PACKAGES) $(CONFIGS) demos

.PHONY: help install i dev test build lint format typecheck clean clean-all
.PHONY: build-% lint-% format-% typecheck-% test-%
.PHONY: add add-pkg update list ls changeset version publish

help:
	@echo "Systemix Monorepo — pnpm workspace + Turborepo"
	@echo "=============================================="
	@echo ""
	@echo "Workspace Commands:"
	@echo "  make install, make i    Install all dependencies"
	@echo "  make dev               Start dev servers (turbo dev)"
	@echo "  make test              Run tests in all packages"
	@echo "  make update            Update dependencies across workspace"
	@echo "  make list, make ls     List workspace packages"
	@echo ""
	@echo "Global Commands:"
	@echo "  make build             Build all packages"
	@echo "  make lint              Lint all packages"
	@echo "  make format            Format all files (prettier + turbo)"
	@echo "  make typecheck         Typecheck all packages"
	@echo "  make clean             Clean build artifacts"
	@echo "  make clean-all         Deep clean (node_modules, dist, turbo cache)"
	@echo ""
	@echo "Package Commands (use pkg name, e.g. password, demos):"
	@echo "  make build-<pkg>       Build a specific package"
	@echo "  make lint-<pkg>        Lint a specific package"
	@echo "  make format-<pkg>      Format a specific package"
	@echo "  make typecheck-<pkg>   Typecheck a specific package"
	@echo "  make test-<pkg>        Test a specific package"
	@echo ""
	@echo "Dependency Commands:"
	@echo "  make add PKG=<name>    Add package to root (e.g. make add PKG=lodash)"
	@echo "  make add-pkg PKG=<name> TARGET=<pkg>  Add to specific workspace"
	@echo ""
	@echo "Changeset Commands:"
	@echo "  make changeset        Add a changeset"
	@echo "  make version          Apply version bumps"
	@echo "  make publish          Publish packages"
	@echo ""
	@echo "Packages: $(PACKAGES)"
	@echo "Configs:  $(CONFIGS)"
	@echo "Workspaces: $(WORKSPACES)"

# --- pnpm Workspace Commands ---

install i:
	$(PNPM) install

dev:
	$(TURBO) dev

test:
	$(TURBO) test

update:
	$(PNPM) update -r

list ls:
	$(PNPM) ls -r --depth -1

add:
ifndef PKG
	$(error Usage: make add PKG=<package-name>)
endif
	$(PNPM) add $(PKG) -w

add-pkg:
ifndef PKG
	$(error Usage: make add-pkg PKG=<pkg> TARGET=<workspace>)
endif
ifndef TARGET
	$(error Usage: make add-pkg PKG=<pkg> TARGET=<workspace>)
endif
	$(PNPM) add $(PKG) --filter $(call pkg_filter,$(TARGET))

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
	$(PNPM) exec rimraf node_modules '**/node_modules' dist '**/dist' .turbo

# --- Changeset Commands ---

changeset:
	$(PNPM) changelog

version:
	$(PNPM) version

publish:
	$(PNPM) publish

# --- Dynamic Package Targets ---

build-%:
	$(TURBO) build --filter=$(call pkg_filter,$*)

lint-%:
	$(TURBO) lint --filter=$(call pkg_filter,$*)

format-%:
	$(TURBO) format:fix --filter=$(call pkg_filter,$*)

typecheck-%:
	$(TURBO) typecheck --filter=$(call pkg_filter,$*)

test-%:
	$(TURBO) test --filter=$(call pkg_filter,$*)
