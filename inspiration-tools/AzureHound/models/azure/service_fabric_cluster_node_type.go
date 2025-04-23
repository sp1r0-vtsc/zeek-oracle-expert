package azure

type ServiceFabricClusterNodeType struct {
	ApplicationPorts                 ServiceFabricClusterNodeEndpointRange `json:"applicationPorts,omitempty"`
	ClientConnectionEndpointPort     int                                   `json:"clientConnectionEndpointPort,omitempty"`
	EphemeralPorts                   ServiceFabricClusterNodeEndpointRange `json:"ephemeralPorts,omitempty"`
	HTTPGatewayEndpointPort          int                                   `json:"httpGatewayEndpointPort,omitempty"`
	HTTPGatewayTokenAuthEndpointPort int                                   `json:"httpGatewayTokenAuthEndpointPort,omitempty"`
	IsPrimary                        bool                                  `json:"isPrimary,omitempty"`
	IsStateless                      bool                                  `json:"isStateless,omitempty"`
	Name                             string                                `json:"name,omitempty"`
	ReverseProxyEndpointPort         int                                   `json:"reverseProxyEndpointPort,omitempty"`
}

type ServiceFabricClusterNodeEndpointRange struct {
	StartPort int `json:"startPort,omitempty"`
	EndPort   int `json:"endPort,omitempty"`
}
