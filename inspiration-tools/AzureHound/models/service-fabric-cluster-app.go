package models

import "github.com/bloodhoundad/azurehound/v2/models/azure"

type ServiceFabricClusterApp struct {
	azure.ServiceFabricClusterApp
	SubscriptionId         string `json:"subscriptionId"`
	ResourceGroupId        string `json:"resourceGroupId"`
	ResourceGroupName      string `json:"resourceGroupName"`
	ServiceFabricClusterId string `json:"serviceFabricClusterId"`
	TenantId               string `json:"tenantId"`
}
