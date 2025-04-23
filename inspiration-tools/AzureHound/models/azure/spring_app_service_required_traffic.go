package azure

// Properties of the Spring App Service
type SpringAppServiceRequiredTraffic struct {
	Direction string   `json:"direction,omitempty"`
	Fqdns     []string `json:"fqdns,omitempty"`
	Ips       []string `json:"ips,omitempty"`
	Port      int      `json:"port,omitempty"`
	Protocol  string   `json:"protocol,omitempty"`
}
