package azure

// Properties of the RBAC Role Definition
type RBACRoleDefinitionProperties struct {
	AssignableScopes []string                       `json:"assignableScopes,omitempty"`
	CreatedBy        string                         `json:"createdBy,omitempty"`
	CreatedOn        string                         `json:"createdOn,omitempty"`
	Description      string                         `json:"description,omitempty"`
	Permissions      []RBACRoleDefinitionPermission `json:"permissions,omitempty"`
	RoleName         string                         `json:"roleName,omitempty"`
	Type             string                         `json:"type,omitempty"`
	UpdatedBy        string                         `json:"updatedBy,omitempty"`
	UpdatedOn        string                         `json:"updatedOn,omitempty"`
}
