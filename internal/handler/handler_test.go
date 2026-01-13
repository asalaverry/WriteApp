package handler

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestNew(t *testing.T) {
	h := New("test/static")
	if h == nil {
		t.Error("New() returned nil")
	}
	if h.StaticDir() != "test/static" {
		t.Errorf("StaticDir() = %v, want %v", h.StaticDir(), "test/static")
	}
}

func TestHandleIndex_RootPath(t *testing.T) {
	// Crear directorio temporal para tests
	tmpDir := t.TempDir()

	// Crear archivo index.html de prueba
	indexContent := []byte("<!DOCTYPE html><html><body>Test</body></html>")
	err := os.WriteFile(filepath.Join(tmpDir, "index.html"), indexContent, 0644)
	if err != nil {
		t.Fatalf("Error creando archivo de prueba: %v", err)
	}

	h := New(tmpDir)
	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	// Test ruta raíz
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("handleIndex() status = %v, want %v", rec.Code, http.StatusOK)
	}

	// Verificar headers de no-caché
	if rec.Header().Get("Cache-Control") != "no-cache, no-store, must-revalidate" {
		t.Errorf("Cache-Control header incorrecto: %v", rec.Header().Get("Cache-Control"))
	}
}

func TestHandleIndex_NotFound(t *testing.T) {
	tmpDir := t.TempDir()

	// Crear archivo index.html
	indexContent := []byte("<!DOCTYPE html><html><body>Test</body></html>")
	err := os.WriteFile(filepath.Join(tmpDir, "index.html"), indexContent, 0644)
	if err != nil {
		t.Fatalf("Error creando archivo de prueba: %v", err)
	}

	h := New(tmpDir)
	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	// Test ruta no existente
	req := httptest.NewRequest(http.MethodGet, "/nonexistent", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Errorf("handleIndex() status = %v, want %v", rec.Code, http.StatusNotFound)
	}
}

func TestHandleIndex_MissingFile(t *testing.T) {
	// Usar directorio vacío (sin index.html)
	tmpDir := t.TempDir()

	h := New(tmpDir)
	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Errorf("handleIndex() status = %v, want %v for missing file", rec.Code, http.StatusNotFound)
	}
}

func TestStaticDir(t *testing.T) {
	tests := []struct {
		name      string
		staticDir string
	}{
		{"ruta simple", "static"},
		{"ruta con subdirectorios", "web/static"},
		{"ruta absoluta", "/var/www/static"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := New(tt.staticDir)
			if got := h.StaticDir(); got != tt.staticDir {
				t.Errorf("StaticDir() = %v, want %v", got, tt.staticDir)
			}
		})
	}
}
