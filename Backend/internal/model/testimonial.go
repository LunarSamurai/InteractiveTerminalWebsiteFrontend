package model

type Testimonial struct {
	ID         string `json:"id"`
	ClientName string `json:"client_name"`
	Company    string `json:"company"`
	Quote      string `json:"quote"`
	Rating     int    `json:"rating"`
}
