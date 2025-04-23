package azure

// Properties of the Spring App Ingress Settings
type SpringAppIngressSettings struct {
	BackendProtocol     string              `json:"backendProtocol,omitempty"`
	ClientAuth          SpringAppClientAuth `json:"clientAuth,omitempty"`
	SessionCookieMaxAge int                 `json:"sessionCookieMaxAge,omitempty"`
}
