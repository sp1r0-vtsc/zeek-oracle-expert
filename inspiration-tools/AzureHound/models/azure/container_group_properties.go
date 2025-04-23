package azure

// Properties of the Container Group
type ContainerGroupProperties struct {
	Containers []Container             `json:"containers,omitempty"`
	DNSConfig  ContainerGroupDNSConfig `json:"dnsConfig,omitempty"`
	IPAddress  ContainerGroupIPAddress `json:"ipAddress,omitempty"`
	Sku        string                  `json:"sku,omitempty"`
}
