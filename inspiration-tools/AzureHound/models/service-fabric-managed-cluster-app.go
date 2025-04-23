package models

import "github.com/bloodhoundad/azurehound/v2/models/azure"

type ServiceFabricManagedClusterApp struct {
	azure.ServiceFabricManagedClusterApp
	SubscriptionId                string `json:"subscriptionId"`
	ResourceGroupId               string `json:"resourceGroupId"`
	ResourceGroupName             string `json:"resourceGroupName"`
	ServiceFabricManagedClusterId string `json:"serviceFabricManagedClusterId"`
	TenantId                      string `json:"tenantId"`
}
