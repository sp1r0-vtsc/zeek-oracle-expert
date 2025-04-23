package azure

import "strings"

type ServiceFabricManagedCluster struct {
	Entity

	Properties ServiceFabricManagedClusterProperties `json:"properties,omitempty"`
	Location   string                                `json:"location,omitempty"`
	Name       string                                `json:"name,omitempty"`
	Tags       map[string]string                     `json:"tags,omitempty"`
	Type       string                                `json:"type,omitempty"`
}

func (s ServiceFabricManagedCluster) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s ServiceFabricManagedCluster) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
