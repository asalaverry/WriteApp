# Makefile para Anotador
# Un anotador web minimalista

.PHONY: all build run test clean fmt lint help

# Variables
BINARY_NAME=anotador
CMD_PATH=./cmd/server
BUILD_DIR=./build

# Colores para output
GREEN=\033[0;32m
NC=\033[0m # No Color

# Comando por defecto
all: fmt test build

## build: Compila el binario
build:
	@echo "$(GREEN)🔨 Compilando...$(NC)"
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_PATH)
	@echo "$(GREEN)✓ Binario creado en $(BUILD_DIR)/$(BINARY_NAME)$(NC)"

## run: Ejecuta la aplicación
run:
	@echo "$(GREEN)🚀 Iniciando servidor...$(NC)"
	@go run $(CMD_PATH)/main.go

## test: Ejecuta todos los tests
test:
	@echo "$(GREEN)🧪 Ejecutando tests...$(NC)"
	@go test -v -race ./...

## test-coverage: Ejecuta tests con cobertura
test-coverage:
	@echo "$(GREEN)📊 Ejecutando tests con cobertura...$(NC)"
	@go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✓ Reporte generado en coverage.html$(NC)"

## fmt: Formatea el código
fmt:
	@echo "$(GREEN)✨ Formateando código...$(NC)"
	@go fmt ./...

## lint: Ejecuta el linter (requiere golangci-lint)
lint:
	@echo "$(GREEN)🔍 Ejecutando linter...$(NC)"
	@golangci-lint run ./...

## clean: Limpia archivos generados
clean:
	@echo "$(GREEN)🧹 Limpiando...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

## help: Muestra esta ayuda
help:
	@echo "Comandos disponibles:"
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'
