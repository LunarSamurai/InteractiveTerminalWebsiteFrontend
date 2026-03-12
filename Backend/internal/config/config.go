package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	SupabaseURL    string
	SupabaseKey    string
	AllowedOrigins []string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:5173"
	}

	return &Config{
		Port:           port,
		SupabaseURL:    os.Getenv("SUPABASE_URL"),
		SupabaseKey:    os.Getenv("SUPABASE_KEY"),
		AllowedOrigins: strings.Split(origins, ","),
	}
}
