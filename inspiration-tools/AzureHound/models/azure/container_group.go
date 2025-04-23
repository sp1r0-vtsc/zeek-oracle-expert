package azure

import "strings"

type ContainerGroup struct {
	Entity

	Properties ContainerGroupProperties `json:"properties,omitempty"`
	Identity   ManagedIdentity          `json:"identity,omitempty"`
	Location   string                   `json:"location,omitempty"`
	Name       string                   `json:"name,omitempty"`
	Tags       map[string]string        `json:"tags,omitempty"`
	Type       string                   `json:"type,omitempty"`
}

func (s ContainerGroup) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s ContainerGroup) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
