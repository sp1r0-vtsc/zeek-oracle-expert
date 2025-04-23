package azure

// Properties of the managed cluster
type ManagedProfilegMSAProfile struct {
	DNSServer      string `json:"dnsServer,omitempty"`
	Enabled        bool   `json:"enabled,omitempty"`
	RootDomainName string `json:"rootDomainName,omitempty"`
}
