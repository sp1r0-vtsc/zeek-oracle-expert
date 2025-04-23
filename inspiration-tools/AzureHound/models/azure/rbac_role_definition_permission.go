package azure

// Properties of the RBAC Role Definition
type RBACRoleDefinitionPermission struct {
	Actions        []string `json:"actions,omitempty"`
	DataActions    []string `json:"dataActions,omitempty"`
	NotActions     []string `json:"notActions,omitempty"`
	NotDataActions []string `json:"notDataActions,omitempty"`
}
