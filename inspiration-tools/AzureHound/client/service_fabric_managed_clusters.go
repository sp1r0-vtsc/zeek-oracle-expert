package client

import (
	"context"
	"fmt"

	"github.com/bloodhoundad/azurehound/v2/client/query"
	"github.com/bloodhoundad/azurehound/v2/models/azure"
)

// ListAzureServiceFabricManagedClusters https://learn.microsoft.com/en-us/rest/api/servicefabric/managedclusters/managed-clusters/list-by-subscription
func (s *azureClient) ListAzureServiceFabricManagedClusters(ctx context.Context, subscriptionId string) <-chan AzureResult[azure.ServiceFabricManagedCluster] {
	var (
		out    = make(chan AzureResult[azure.ServiceFabricManagedCluster])
		path   = fmt.Sprintf("/subscriptions/%s/providers/Microsoft.ServiceFabric/managedClusters", subscriptionId)
		params = query.RMParams{ApiVersion: "2024-09-01-preview"}
	)

	go getAzureObjectList[azure.ServiceFabricManagedCluster](s.resourceManager, ctx, path, params, out)

	return out
}
