package azure

import "strings"

type ServiceFabricCluster struct {
	Entity

	Properties ServiceFabricClusterProperties `json:"properties,omitempty"`
	Location   string                         `json:"location,omitempty"`
	Name       string                         `json:"name,omitempty"`
	Tags       map[string]string              `json:"tags,omitempty"`
	Type       string                         `json:"type,omitempty"`
}

func (s ServiceFabricCluster) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s ServiceFabricCluster) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
