package handler

import (
	"encoding/json"
	"net/http"

	"github.com/coreit/website-backend/internal/model"
	"github.com/go-chi/chi/v5"
)

// Static services data (will be replaced with Supabase queries)
var services = []model.Service{
	{
		ID: "1", Slug: "firewall-standup", Title: "Firewall Standup",
		Tagline: "Enterprise-grade perimeter defense",
		Description: "Deploy and configure next-generation firewalls to protect your network from unauthorized access, malware, and cyber threats.",
		Features: []string{"Next-gen firewall deployment", "IDS/IPS", "VPN setup", "Traffic analysis", "Real-time monitoring", "24/7 incident response"},
		Icon: "Shield", SortOrder: 1,
	},
	{
		ID: "2", Slug: "forensics", Title: "Digital Forensics",
		Tagline: "Investigate. Analyze. Resolve.",
		Description: "Our certified forensic analysts investigate security incidents, preserve digital evidence, and provide detailed reports.",
		Features: []string{"Incident response", "Evidence preservation", "Malware analysis", "Chain of custody", "Expert testimony", "Remediation planning"},
		Icon: "Search", SortOrder: 2,
	},
	{
		ID: "3", Slug: "data-recovery", Title: "Data Recovery",
		Tagline: "Your data, recovered.",
		Description: "Advanced techniques to retrieve data from failed hard drives, corrupted RAID arrays, damaged SSDs, and compromised servers.",
		Features: []string{"Hard drive & SSD recovery", "RAID reconstruction", "Ransomware restoration", "Cloud backup recovery", "Database repair", "Emergency 24-hour turnaround"},
		Icon: "HardDrive", SortOrder: 3,
	},
	{
		ID: "4", Slug: "network-infrastructure", Title: "Network Infrastructure",
		Tagline: "Built for performance & reliability",
		Description: "Design, deploy, and manage robust network infrastructure that scales with your business.",
		Features: []string{"Network design", "Switching & routing", "Wireless solutions", "Network monitoring", "Performance optimization", "Disaster recovery"},
		Icon: "Network", SortOrder: 4,
	},
	{
		ID: "5", Slug: "antivirus-solutions", Title: "Antivirus Solutions",
		Tagline: "Proactive endpoint protection",
		Description: "Enterprise antivirus solutions that stop threats before they impact your business.",
		Features: []string{"EDR", "Real-time scanning", "Zero-day protection", "Centralized console", "Patch management", "Security training"},
		Icon: "Bug", SortOrder: 5,
	},
}

func GetServices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(services)
}

func GetServiceBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	for _, s := range services {
		if s.Slug == slug {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(s)
			return
		}
	}
	http.Error(w, `{"error":"service not found"}`, http.StatusNotFound)
}
