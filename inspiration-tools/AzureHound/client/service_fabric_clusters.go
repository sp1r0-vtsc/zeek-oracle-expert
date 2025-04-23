package client

import (
	"context"
	"fmt"

	"github.com/bloodhoundad/azurehound/v2/client/query"
	"github.com/bloodhoundad/azurehound/v2/models/azure"
)

// ListAzureServiceFabricClusters https://learn.microsoft.com/en-us/rest/api/servicefabric/clusters/list?view=rest-servicefabric-2023-11-01-preview
func (s *azureClient) ListAzureServiceFabricClusters(ctx context.Context, subscriptionId string) <-chan AzureResult[azure.ServiceFabricCluster] {
	var (
		out    = make(chan AzureResult[azure.ServiceFabricCluster])
		path   = fmt.Sprintf("/subscriptions/%s/providers/Microsoft.ServiceFabric/clusters", subscriptionId)
		params = query.RMParams{ApiVersion: "2023-11-01-preview"}
	)

	go getAzureObjectList[azure.ServiceFabricCluster](s.resourceManager, ctx, path, params, out)

	return out
}
