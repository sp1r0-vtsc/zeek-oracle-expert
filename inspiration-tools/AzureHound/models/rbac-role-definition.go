package models

import "github.com/bloodhoundad/azurehound/v2/models/azure"

type RBACRoleDefinition struct {
	azure.RBACRoleDefinition
	SubscriptionId       string `json:"subscriptionId"`
	RBACRoleDefinitionId string `json:"RBACRoleDefinitionId"`
	TenantId             string `json:"tenantId"`
}
