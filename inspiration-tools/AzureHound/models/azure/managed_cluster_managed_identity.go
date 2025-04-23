package azure

// Managed cluster managed identity.
type ManagedClusterManagedIdentity struct {
	ManagedIdentity
	ServicePrincipalProfile ManagedClusterServicePrincipalProfile         `json:"servicePrincipalProfile"`
	IdentityProfile         map[string]ManagedClusterUserAssignedIdentity `json:"identityProfile"`
}
