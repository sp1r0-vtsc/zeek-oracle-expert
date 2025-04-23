package cmd

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"time"

	"github.com/bloodhoundad/azurehound/v2/client"
	"github.com/bloodhoundad/azurehound/v2/config"
	"github.com/bloodhoundad/azurehound/v2/enums"
	"github.com/bloodhoundad/azurehound/v2/models"
	"github.com/bloodhoundad/azurehound/v2/panicrecovery"
	"github.com/bloodhoundad/azurehound/v2/pipeline"
	"github.com/spf13/cobra"
)

func init() {
	listRootCmd.AddCommand(listServiceFabricManagedClustersCmd)
}

var listServiceFabricManagedClustersCmd = &cobra.Command{
	Use:          "service-fabric-managed-clusters",
	Long:         "Lists Azure Service Fabric Managed Clusters",
	Run:          listServiceFabricManagedClustersCmdImpl,
	SilenceUsage: true,
}

func listServiceFabricManagedClustersCmdImpl(cmd *cobra.Command, args []string) {
	ctx, stop := signal.NotifyContext(cmd.Context(), os.Interrupt, os.Kill)
	defer gracefulShutdown(stop)

	log.V(1).Info("testing connections")
	if err := testConnections(); err != nil {
		exit(err)
	} else if azClient, err := newAzureClient(); err != nil {
		exit(err)
	} else {
		log.Info("collecting azure Service Fabric Managed Clusters...")
		start := time.Now()
		stream := listServiceFabricManagedClusters(ctx, azClient, listSubscriptions(ctx, azClient))
		panicrecovery.HandleBubbledPanic(ctx, stop, log)
		outputStream(ctx, stream)
		duration := time.Since(start)
		log.Info("collection completed", "duration", duration.String())
	}
}

func listServiceFabricManagedClusters(ctx context.Context, client client.AzureClient, subscriptions <-chan interface{}) <-chan interface{} {
	var (
		out     = make(chan interface{})
		ids     = make(chan string)
		streams = pipeline.Demux(ctx.Done(), ids, config.ColStreamCount.Value().(int))
		wg      sync.WaitGroup
	)

	go func() {
		defer panicrecovery.PanicRecovery()
		defer close(ids)
		for result := range pipeline.OrDone(ctx.Done(), subscriptions) {
			if subscription, ok := result.(AzureWrapper).Data.(models.Subscription); !ok {
				log.Error(fmt.Errorf("failed type assertion"), "unable to continue enumerating service fabric managed clusters", "result", result)
				return
			} else {
				if ok := pipeline.Send(ctx.Done(), ids, subscription.SubscriptionId); !ok {
					return
				}
			}
		}
	}()

	wg.Add(len(streams))
	for i := range streams {
		stream := streams[i]
		go func() {
			defer panicrecovery.PanicRecovery()
			defer wg.Done()
			for id := range stream {
				count := 0
				for item := range client.ListAzureServiceFabricManagedClusters(ctx, id) {
					if item.Error != nil {
						log.Error(item.Error, "unable to continue processing service fabric managed clusters for this subscription", "subscriptionId", id)
					} else {
						serviceFabricManagedCluster := models.ServiceFabricManagedCluster{
							ServiceFabricManagedCluster: item.Ok,
							SubscriptionId:              "/subscriptions/" + id,
							ResourceGroupId:             item.Ok.ResourceGroupId(),
							ResourceGroupName:           item.Ok.ResourceGroupName(),
							TenantId:                    client.TenantInfo().TenantId,
						}
						log.V(2).Info("found service fabric managed cluster", "serviceFabricManagedCluster", serviceFabricManagedCluster)
						count++
						if ok := pipeline.SendAny(ctx.Done(), out, AzureWrapper{
							Kind: enums.KindAZServiceFabricManagedCluster,
							Data: serviceFabricManagedCluster,
						}); !ok {
							return
						}
					}
				}
				log.V(1).Info("finished listing service fabric managed clusters", "subscriptionId", id, "count", count)
			}
		}()
	}

	go func() {
		wg.Wait()
		close(out)
		log.Info("finished listing all Service Fabric Managed Clusters")
	}()

	return out
}
