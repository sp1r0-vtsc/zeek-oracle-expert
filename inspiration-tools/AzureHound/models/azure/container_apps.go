package azure

import "strings"

type ContainerApp struct {
	Entity

	Properties ContainerAppProperties `json:"properties,omitempty"`
	Identity   ManagedIdentity        `json:"identity,omitempty"`
	Location   string                 `json:"location,omitempty"`
	ManagedBy  string                 `json:"managedBy,omitempty"`
	Name       string                 `json:"name,omitempty"`
	Tags       map[string]string      `json:"tags,omitempty"`
	Type       string                 `json:"type,omitempty"`
}

func (s ContainerApp) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s ContainerApp) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
