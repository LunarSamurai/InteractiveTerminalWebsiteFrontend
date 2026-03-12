package handler

import (
	"encoding/json"
	"net/http"

	"github.com/coreit/website-backend/internal/model"
)

// Static testimonials data (will be replaced with Supabase queries)
var testimonials = []model.Testimonial{
	{ID: "1", ClientName: "Sarah Chen", Company: "Nexus Financial", Quote: "CoreIT's forensic team helped us identify and contain a breach within hours.", Rating: 5},
	{ID: "2", ClientName: "Marcus Williams", Company: "Atlas Manufacturing", Quote: "After a ransomware attack, CoreIT recovered 99.8% of our data.", Rating: 5},
	{ID: "3", ClientName: "Emily Rodriguez", Company: "Bright Health Systems", Quote: "The network infrastructure CoreIT deployed has been rock-solid.", Rating: 5},
	{ID: "4", ClientName: "David Park", Company: "Pinnacle Software", Quote: "Their firewall setup and managed security gives us peace of mind.", Rating: 5},
}

func GetTestimonials(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(testimonials)
}
