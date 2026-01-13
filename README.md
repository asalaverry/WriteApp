# 🖊️ Anotador

Un anotador web minimalista para escribir sin distracciones.

## Descripción

Anotador es una página web simple que simula una hoja en blanco donde puedes escribir libremente. El contenido es efímero: se pierde al cerrar la página. Diseñado para tomar notas rápidas, hacer borradores o simplemente escribir sin la complejidad de un procesador de texto completo.

## Características

- **Escritura sin distracciones**: Interfaz limpia, solo tú y tus palabras
- **Tres modos de visualización**:
  - 🌞 **Modo Claro**: Fondo blanco clásico
  - 🌙 **Modo Oscuro**: Para escribir de noche
  - 🌅 **Modo Noche**: Tonos cálidos/amarillentos para descansar la vista
- **Tres tipografías**:
  - **Principal**: Lora - ideal para texto general
  - **Título**: Cormorant Garamond - elegante para encabezados
  - **Secundario**: Source Serif 4 - perfecta para notas
- **Sin persistencia**: Lo que escribes se queda en esa sesión
- **Ajustes discretos**: Aparecen solo cuando los necesitas

## Requisitos

- Go 1.21 o superior

## Instalación

\`\`\`bash
# Clonar el repositorio
git clone https://github.com/agusalaverry/anotador.git
cd anotador

# Compilar
make build

# O ejecutar directamente
make run
\`\`\`

## Uso

### Ejecutar el servidor

\`\`\`bash
# Método 1: Con Make
make run

# Método 2: Directamente con Go
go run ./cmd/server

# Método 3: Ejecutar el binario compilado
./build/anotador
\`\`\`

### Opciones de línea de comandos

\`\`\`bash
./build/anotador -port 3000 -static web/static
\`\`\`

| Opción | Descripción | Por defecto |
|--------|-------------|-------------|
| \`-port\` | Puerto del servidor HTTP | \`8080\` |
| \`-static\` | Directorio de archivos estáticos | \`web/static\` |

### Acceder a la aplicación

Abre tu navegador en: \`http://localhost:8080\`

## Estructura del Proyecto

\`\`\`
anotador/
├── cmd/
│   └── server/
│       └── main.go          # Punto de entrada
├── internal/
│   ├── handler/
│   │   ├── handler.go       # Manejadores HTTP
│   │   └── handler_test.go  # Tests de handlers
│   └── server/
│       ├── server.go        # Configuración del servidor
│       └── server_test.go   # Tests del servidor
├── web/
│   └── static/
│       ├── index.html       # Página principal
│       ├── css/
│       │   └── styles.css   # Estilos
│       └── js/
│           └── app.js       # Lógica del frontend
├── go.mod                   # Módulo de Go
├── Makefile                 # Comandos de desarrollo
└── README.md               # Este archivo
\`\`\`

## Desarrollo

### Comandos disponibles

\`\`\`bash
make help          # Muestra todos los comandos disponibles
make build         # Compila el binario
make run           # Ejecuta la aplicación
make test          # Ejecuta todos los tests
make test-coverage # Tests con reporte de cobertura
make fmt           # Formatea el código
make lint          # Ejecuta el linter (requiere golangci-lint)
make clean         # Limpia archivos generados
\`\`\`

### Ejecutar tests

\`\`\`bash
# Todos los tests
make test

# Con cobertura
make test-coverage
\`\`\`

## Arquitectura

El proyecto sigue las buenas prácticas de Go:

- **cmd/**: Punto de entrada de la aplicación
- **internal/**: Código interno no exportable
  - **handler/**: Manejadores de rutas HTTP
  - **server/**: Configuración y ciclo de vida del servidor
- **web/**: Archivos estáticos del frontend

### Principios de diseño

1. **Simplicidad**: Código minimalista y fácil de entender
2. **Separación de responsabilidades**: Cada paquete tiene un propósito claro
3. **Testeable**: Código diseñado para ser fácilmente testeable
4. **Efímero**: Sin base de datos ni persistencia - por diseño

## Licencia

MIT
