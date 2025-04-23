package azure

// Managed cluster managed identity.
type ManagedClusterUserAssignedIdentity struct {
	ClientId   string `json:"clientId,omitempty"`
	ObjectId   string `json:"objectId,omitempty"`
	ResourceId string `json:"resourceId,omitempty"`
}
