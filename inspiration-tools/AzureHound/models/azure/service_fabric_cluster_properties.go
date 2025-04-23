package azure

type ServiceFabricClusterProperties struct {
	AzureActiveDirectory               ServiceFabricClusterAADProperties `json:"azureActiveDirectory,omitempty"`
	ClusterEndpoint                    string                            `json:"clusterEndpoint,omitempty"`
	ClusterId                          string                            `json:"clusterId,omitempty"`
	ClusterState                       string                            `json:"clusterState,omitempty"`
	EnableHTTPGatewayExclusiveAuthMode bool                              `json:"enableHttpGatewayExclusiveAuthMode,omitempty"`
	FabricSettings                     []ServiceFabricClusterSetting     `json:"fabricSettings,omitempty"`
	ManagementEndpoint                 string                            `json:"managementEndpoint,omitempty"`
	NodeTypes                          []ServiceFabricClusterNodeType    `json:"nodeTypes,omitempty"`
}
