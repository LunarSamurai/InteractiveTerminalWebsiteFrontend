package model

type Service struct {
	ID          string   `json:"id"`
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Tagline     string   `json:"tagline"`
	Description string   `json:"description"`
	Features    []string `json:"features"`
	Icon        string   `json:"icon"`
	SortOrder   int      `json:"sort_order"`
}
