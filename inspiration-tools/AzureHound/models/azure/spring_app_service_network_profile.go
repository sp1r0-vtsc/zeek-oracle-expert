package azure

// Properties of the Spring App Service
type SpringAppServiceNetworkProfile struct {
	AppNetworkResourceGroup            string                            `json:"appNetworkResourceGroup,omitempty"`
	AppSubnetId                        string                            `json:"appSubnetId,omitempty"`
	OutboundIPs                        SpringAppServiceOutboundIps       `json:"outboundIPs,omitempty"`
	OutboundType                       string                            `json:"outboundType,omitempty"`
	RequiredTraffics                   []SpringAppServiceRequiredTraffic `json:"requiredTraffics,omitempty"`
	ServiceCidr                        string                            `json:"serviceCidr,omitempty"`
	ServiceRuntimeNetworkResourceGroup string                            `json:"serviceRuntimeNetworkResourceGroup,omitempty"`
	ServiceRuntimeSubnetId             string                            `json:"serviceRuntimeSubnetId,omitempty"`
}
