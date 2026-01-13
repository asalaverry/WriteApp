// Package server provides the HTTP server implementation.
package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/agusalaverry/anotador/internal/handler"
)

// Config holds the server configuration.
type Config struct {
	Port      string
	StaticDir string
}

// Server represents the HTTP server.
type Server struct {
	httpServer *http.Server
	config     Config
}

// New creates a new server instance with the given configuration.
func New(cfg Config) (*Server, error) {
	if cfg.Port == "" {
		cfg.Port = "8080"
	}
	if cfg.StaticDir == "" {
		cfg.StaticDir = "web/static"
	}

	mux := http.NewServeMux()

	// Configurar handlers
	h := handler.New(cfg.StaticDir)
	h.RegisterRoutes(mux)

	httpServer := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return &Server{
		httpServer: httpServer,
		config:     cfg,
	}, nil
}

// Start begins listening for HTTP requests.
func (s *Server) Start() error {
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully stops the server.
func (s *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return s.httpServer.Shutdown(ctx)
}

// Config returns the server configuration.
func (s *Server) Config() Config {
	return s.config
}
