package azure

// Properties of the Spring App Service
type SpringAppServiceVnetAddons struct {
	DataPlanePublicEndpoint bool `json:"dataPlanePublicEndpoint,omitempty"`
	LogStreamPublicEndpoint bool `json:"logStreamPublicEndpoint,omitempty"`
}
