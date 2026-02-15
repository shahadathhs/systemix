# Config
ENV_FILE := .env.production
DOCKER_REGISTRY := shahadathhs
PACKAGE_NAME := vortex
VERSION := latest

# Docker Compose Commands
COMPOSE_FILE_ARGS := -f compose.infra.yaml -f compose.yaml
COMPOSE_ENV_ARGS := --env-file $(ENV_FILE)
COMPOSE_CMD := docker compose $(COMPOSE_FILE_ARGS) $(COMPOSE_ENV_ARGS)
COMPOSE_INFRA_CMD := docker compose -f compose.infra.yaml $(COMPOSE_ENV_ARGS)

# Services List
SERVICES := gateway auth product order notification

.PHONY: help infra dev prod tools up-% down build-% push-% pull-% clean clean-all logs-%

help:
	@echo "Vortex Docker Commands"
	@echo "======================"
	@echo "Environment:"
	@echo "  make infra            Start infrastructure (Mongo, RabbitMQ)"
	@echo "  make up               Start all services"
	@echo "  make up-<service>     Start specific service (gateway, auth, product, order, notification)"
	@echo "  make up-common        Start common profile services"
	@echo "  make tools            Start dev tools (Mongo Express)"
	@echo "  make down             Stop all containers"
	@echo ""
	@echo "Images (build/push/pull):"
	@echo "  make build        Build all images"
	@echo "  make build-<service>  Build specific service"
	@echo "  make push         Push all images"
	@echo "  make pull         Pull all images"
	@echo ""
	@echo "Cleanup & Logs:"
	@echo "  make clean[-all]      Stop and remove containers [volumes]"
	@echo "  make logs-infra       Show infra logs"
	@echo "  make logs-dev         Show app logs"

# --- Environment ---

infra:
	$(COMPOSE_INFRA_CMD) --profile infra up -d

up:
	$(COMPOSE_CMD) --profile dev up -d

prod:
	$(COMPOSE_CMD) --profile prod up -d

tools:
	$(COMPOSE_INFRA_CMD) --profile tools up -d

# Pattern: make up-auth, make up-gateway
up-%:
	$(COMPOSE_CMD) --profile $* up -d

down:
	$(COMPOSE_CMD) --profile infra --profile dev --profile prod --profile tools down --remove-orphans

# --- Build / Push / Pull patterns ---

# Build
build-gateway:
	docker build -f gateway/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION) .

build-%:
	docker build -f services/$*-service/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-$*-service:$(VERSION) .

build: $(addprefix build-, $(SERVICES))

# Push
push-gateway:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION)

push-%:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-$*-service:$(VERSION)

push: $(addprefix push-, $(SERVICES))

# Pull
pull-gateway:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION)

pull-%:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-$*-service:$(VERSION)

pull: $(addprefix pull-, $(SERVICES))

# --- Maintenance ---

clean:
	$(COMPOSE_CMD) --profile infra --profile dev --profile prod --profile tools down --remove-orphans

clean-all:
	$(COMPOSE_CMD) --profile infra --profile dev --profile prod --profile tools down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

logs-infra:
	$(COMPOSE_INFRA_CMD) logs -f

logs-dev logs-prod:
	$(COMPOSE_CMD) logs -f
