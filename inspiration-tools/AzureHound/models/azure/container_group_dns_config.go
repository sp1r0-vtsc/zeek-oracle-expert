package azure

// Properties of the Container Group
type ContainerGroupDNSConfig struct {
	NameServers   []string `json:"nameServers,omitempty"`
	Options       string   `json:"options,omitempty"`
	SearchDomains []string `json:"searchDomains,omitempty"`
}
