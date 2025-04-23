package azure

// Managed cluster managed identity.
type ManagedClusterPodIdentityProfile struct {
	AllowNetworkPluginKubenet      bool                                 `json:"allowNetworkPluginKubenet,omitempty"`
	Enabled                        bool                                 `json:"enabled,omitempty"`
	UserAssignedIdentities         []ManagedClusterPodIdentity          `json:"userAssignedIdentities,omitempty"`
	UserAssignedIdentityExceptions []ManagedClusterPodIdentityException `json:"userAssignedIdentityExceptions,omitempty"`
}
