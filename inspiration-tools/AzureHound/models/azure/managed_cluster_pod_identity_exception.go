package azure

// Managed cluster managed identity.
type ManagedClusterPodIdentityException struct {
	Name      string            `json:"name,omitempty"`
	Namespace string            `json:"namespace,omitempty"`
	PodLabels map[string]string `json:"podLabels,omitempty"`
}
