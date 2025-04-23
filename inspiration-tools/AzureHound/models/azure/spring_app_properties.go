package azure

// Properties of the Spring App
type SpringAppProperties struct {
	EnableEndToEndTLS bool                     `json:"enableEndToEndTLS,omitempty"`
	Fqdn              string                   `json:"fqdn,omitempty"`
	HttpsOnly         bool                     `json:"httpsOnly,omitempty"`
	IngressSettings   SpringAppIngressSettings `json:"ingressSettings,omitempty"`
	Public            bool                     `json:"public,omitempty"`
	Url               string                   `json:"url,omitempty"`
}
