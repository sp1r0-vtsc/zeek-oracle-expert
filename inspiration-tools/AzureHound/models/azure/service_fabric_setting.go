package azure

type ServiceFabricClusterSetting struct {
	Name       string                                 `json:"name,omitempty"`
	Parameters []ServiceFabricClusterSettingParameter `json:"parameters,omitempty"`
}

type ServiceFabricClusterSettingParameter struct {
	Name  string `json:"name,omitempty"`
	Value string `json:"value,omitempty"`
}
