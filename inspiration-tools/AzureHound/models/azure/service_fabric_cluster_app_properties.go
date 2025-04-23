package azure

type ServiceFabricClusterAppProperties struct {
	ManagedIdentities []ServiceFabricClusterAppUserAssignedIdentity `json:"managedIdentities,omitempty"`
	Parameters        map[string]string                             `json:"parameters,omitempty"`
}

type ServiceFabricClusterAppUserAssignedIdentity struct {
	Name        string `json:"name,omitempty"`
	PrincipalId string `json:"principalId,omitempty"`
}
