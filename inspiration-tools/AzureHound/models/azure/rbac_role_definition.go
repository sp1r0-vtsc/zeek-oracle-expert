package azure

type RBACRoleDefinition struct {
	Entity

	Properties RBACRoleDefinitionProperties `json:"properties,omitempty"`
	Name       string                       `json:"name,omitempty"`
	Type       string                       `json:"type,omitempty"`
}
