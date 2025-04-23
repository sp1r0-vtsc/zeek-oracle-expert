package azure

// Managed cluster managed identity.
type ManagedClusterPodIdentity struct {
	BindingSelector   string                             `json:"bindingSelector,omitempty"`
	Identity          ManagedClusterUserAssignedIdentity `json:"identity,omitempty"`
	Name              string                             `json:"name,omitempty"`
	Namespace         string                             `json:"namespace,omitempty"`
	ProvisioningState string                             `json:"provisioningState,omitempty"`
}
