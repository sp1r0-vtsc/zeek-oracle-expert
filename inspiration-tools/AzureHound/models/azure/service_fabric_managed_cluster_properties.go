package azure

type ServiceFabricManagedClusterProperties struct {
	AdminPassword                      string                                       `json:"adminPassword,omitempty"`
	AdminUserName                      string                                       `json:"adminUserName,omitempty"`
	AllocatedOutboundPorts             int                                          `json:"allocatedOutboundPorts,omitempty"`
	AllowRDPAccess                     bool                                         `json:"allowRDPAccess,omitempty"`
	AzureActiveDirectory               ServiceFabricClusterAADProperties            `json:"azureActiveDirectory,omitempty"`
	ClientConnectionPort               int                                          `json:"clientConnectionPort,omitempty"`
	ClusterID                          string                                       `json:"clusterId,omitempty"`
	DNSName                            string                                       `json:"dnsName,omitempty"`
	EnableHttpGatewayExclusiveAuthMode bool                                         `json:"enableHttpGatewayExclusiveAuthMode,omitempty"`
	EnableIpv6                         bool                                         `json:"enableIpv6,omitempty"`
	EnableServicePublicIP              bool                                         `json:"enableServicePublicIP,omitempty"`
	FabricSettings                     []ServiceFabricClusterSetting                `json:"fabricSettings,omitempty"`
	FQDN                               string                                       `json:"fqdn,omitempty"`
	HTTPGatewayConnectionPort          int                                          `json:"httpGatewayConnectionPort,omitempty"`
	HTTPGatewayTokenAuthConnectionPort int                                          `json:"httpGatewayTokenAuthConnectionPort,omitempty"`
	IPv4Address                        string                                       `json:"ipv4Address,omitempty"`
	IPv6Address                        string                                       `json:"ipv6Address,omitempty"`
	PublicIPPrefixId                   string                                       `json:"publicIPPrefixId,omitempty"`
	PublicIPv6PrefixId                 string                                       `json:"publicIPv6PrefixId,omitempty"`
	ServiceEndpoints                   []ServiceFabricManagedClusterServiceEndpoint `json:"serviceEndpoints,omitempty"`
}

type ServiceFabricManagedClusterServiceEndpoint struct {
	Locations []string `json:"locations,omitempty"`
	Service   string   `json:"service,omitempty"`
}
