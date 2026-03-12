package handler

import (
	"encoding/json"
	"net/http"

	"github.com/coreit/website-backend/internal/model"
)

func SubmitContact(w http.ResponseWriter, r *http.Request) {
	var form model.ContactForm
	if err := json.NewDecoder(r.Body).Decode(&form); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if form.Name == "" || form.Email == "" || form.Message == "" {
		http.Error(w, `{"error":"name, email, and message are required"}`, http.StatusBadRequest)
		return
	}

	// TODO: Save to Supabase
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Contact form submitted successfully",
	})
}
