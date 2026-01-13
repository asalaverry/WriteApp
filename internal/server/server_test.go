package server

import (
	"testing"
)

func TestNew(t *testing.T) {
	tests := []struct {
		name    string
		cfg     Config
		wantErr bool
	}{
		{
			name: "configuración válida",
			cfg: Config{
				Port:      "8080",
				StaticDir: "../../web/static",
			},
			wantErr: false,
		},
		{
			name:    "configuración con valores por defecto",
			cfg:     Config{},
			wantErr: false,
		},
		{
			name: "puerto personalizado",
			cfg: Config{
				Port: "3000",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			srv, err := New(tt.cfg)
			if (err != nil) != tt.wantErr {
				t.Errorf("New() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && srv == nil {
				t.Error("New() returned nil server without error")
			}
		})
	}
}

func TestConfig_Defaults(t *testing.T) {
	cfg := Config{}
	srv, err := New(cfg)
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}

	actualCfg := srv.Config()

	if actualCfg.Port != "8080" {
		t.Errorf("Config().Port = %v, want %v", actualCfg.Port, "8080")
	}

	if actualCfg.StaticDir != "web/static" {
		t.Errorf("Config().StaticDir = %v, want %v", actualCfg.StaticDir, "web/static")
	}
}

func TestConfig_Custom(t *testing.T) {
	cfg := Config{
		Port:      "3000",
		StaticDir: "/custom/path",
	}

	srv, err := New(cfg)
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}

	actualCfg := srv.Config()

	if actualCfg.Port != "3000" {
		t.Errorf("Config().Port = %v, want %v", actualCfg.Port, "3000")
	}

	if actualCfg.StaticDir != "/custom/path" {
		t.Errorf("Config().StaticDir = %v, want %v", actualCfg.StaticDir, "/custom/path")
	}
}
