package azure

// Properties of the Spring App Service
type SpringAppServiceProperties struct {
	Fqdn           string                         `json:"fqdn,omitempty"`
	NetworkProfile SpringAppServiceNetworkProfile `json:"networkProfile,omitempty"`
	ServiceId      string                         `json:"serviceId,omitempty"`
	Version        int                            `json:"version,omitempty"`
	VnetAddons     SpringAppServiceVnetAddons     `json:"vnetAddons,omitempty"`
}
