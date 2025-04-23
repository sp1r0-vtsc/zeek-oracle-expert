package models

import "github.com/bloodhoundad/azurehound/v2/models/azure"

type ContainerApp struct {
	azure.ContainerApp
	SubscriptionId  string `json:"subscriptionId"`
	ResourceGroupId string `json:"resourceGroupId"`
	TenantId        string `json:"tenantId"`
}
