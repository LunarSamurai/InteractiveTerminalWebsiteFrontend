package model

type ContactForm struct {
	Name    string `json:"name" validate:"required"`
	Email   string `json:"email" validate:"required,email"`
	Phone   string `json:"phone"`
	Company string `json:"company"`
	Message string `json:"message" validate:"required"`
}
