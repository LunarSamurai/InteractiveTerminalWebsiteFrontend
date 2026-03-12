package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/coreit/website-backend/internal/config"
	"github.com/coreit/website-backend/internal/router"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()
	r := router.New(cfg)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("CoreIT Backend starting on %s", addr)

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
