// Package handler provides HTTP request handlers.
package handler

import (
	"net/http"
	"os"
	"path/filepath"
)

// Handler manages HTTP request handling.
type Handler struct {
	staticDir string
}

// New creates a new Handler instance.
func New(staticDir string) *Handler {
	return &Handler{
		staticDir: staticDir,
	}
}

// RegisterRoutes registers all HTTP routes.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	// Servir el archivo index.html en la raíz
	mux.HandleFunc("/", h.handleIndex)

	// Servir archivos estáticos (CSS, JS, fonts)
	mux.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir(filepath.Join(h.staticDir, "css")))))
	mux.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir(filepath.Join(h.staticDir, "js")))))
	mux.Handle("/fonts/", http.StripPrefix("/fonts/", http.FileServer(http.Dir(filepath.Join(h.staticDir, "fonts")))))
}

// handleIndex serves the main HTML page.
func (h *Handler) handleIndex(w http.ResponseWriter, r *http.Request) {
	// Solo servir index.html para la ruta raíz exacta
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	indexPath := filepath.Join(h.staticDir, "index.html")
	
	// Verificar que el archivo existe
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		http.Error(w, "Página no encontrada", http.StatusNotFound)
		return
	}

	// Configurar headers para evitar caché (contenido es efímero)
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	http.ServeFile(w, r, indexPath)
}

// StaticDir returns the configured static directory.
func (h *Handler) StaticDir() string {
	return h.staticDir
}
