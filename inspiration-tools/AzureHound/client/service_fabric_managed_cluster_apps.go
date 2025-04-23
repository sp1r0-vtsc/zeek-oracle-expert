package client

import (
	"context"
	"fmt"

	"github.com/bloodhoundad/azurehound/v2/client/query"
	"github.com/bloodhoundad/azurehound/v2/models/azure"
)

// ListAzureServiceFabricManagedClusterApps https://learn.microsoft.com/en-us/rest/api/servicefabric/managedclusters/applications/list
func (s *azureClient) ListAzureServiceFabricManagedClusterApps(ctx context.Context, subscriptionId string, resourceGroupName string, clusterName string) <-chan AzureResult[azure.ServiceFabricManagedClusterApp] {
	var (
		out    = make(chan AzureResult[azure.ServiceFabricManagedClusterApp])
		path   = fmt.Sprintf("/subscriptions/%s/resourceGroups/%s/providers/Microsoft.ServiceFabric/managedclusters/%s/applications", subscriptionId, resourceGroupName, clusterName)
		params = query.RMParams{ApiVersion: "2024-09-01-preview"}
	)

	go getAzureObjectList[azure.ServiceFabricManagedClusterApp](s.resourceManager, ctx, path, params, out)

	return out
}
