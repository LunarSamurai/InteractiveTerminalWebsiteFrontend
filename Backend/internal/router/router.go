package router

import (
	"github.com/coreit/website-backend/internal/config"
	"github.com/coreit/website-backend/internal/handler"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func New(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Get("/health", handler.HealthCheck)
		r.Get("/services", handler.GetServices)
		r.Get("/services/{slug}", handler.GetServiceBySlug)
		r.Get("/testimonials", handler.GetTestimonials)
		r.Post("/contact", handler.SubmitContact)
	})

	return r
}
