// Package main is the entry point for the anotador web server.
package main

import (
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/agusalaverry/anotador/internal/server"
)

func main() {
	port := flag.String("port", "8080", "Puerto del servidor HTTP")
	staticDir := flag.String("static", "web/static", "Directorio de archivos estáticos")
	flag.Parse()

	cfg := server.Config{
		Port:      *port,
		StaticDir: *staticDir,
	}

	srv, err := server.New(cfg)
	if err != nil {
		log.Fatalf("Error al crear el servidor: %v", err)
	}

	// Canal para señales de sistema
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Iniciar servidor en goroutine
	go func() {
		log.Printf("🖊️  Anotador iniciado en http://localhost:%s", *port)
		if err := srv.Start(); err != nil {
			log.Printf("Error del servidor: %v", err)
		}
	}()

	// Esperar señal de cierre
	<-sigChan
	log.Println("Cerrando servidor...")
	
	if err := srv.Shutdown(); err != nil {
		log.Printf("Error al cerrar servidor: %v", err)
	}
	
	log.Println("Servidor cerrado correctamente")
}
