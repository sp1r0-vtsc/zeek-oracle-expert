package azure

// Properties of the Spring App Service
type SpringAppServiceOutboundIps struct {
	PublicIPs []string `json:"publicIPs,omitempty"`
}
