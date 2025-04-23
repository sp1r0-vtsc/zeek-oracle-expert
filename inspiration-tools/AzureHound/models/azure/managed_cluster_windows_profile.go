package azure

// Properties of the managed cluster
type ManagedClusterWindowsProfile struct {
	AdminPassword string                    `json:"adminPassword,omitempty"`
	AdminUsername string                    `json:"adminUsername,omitempty"`
	GmsaProfile   ManagedProfilegMSAProfile `json:"gmsaProfile,omitempty"`
}
