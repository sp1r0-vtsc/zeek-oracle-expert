package azure

import "strings"

type SpringApp struct {
	Entity

	Identity   ManagedIdentity     `json:"identity,omitempty"`
	Properties SpringAppProperties `json:"properties,omitempty"`
	Location   string              `json:"location,omitempty"`
	Name       string              `json:"name,omitempty"`
	Type       string              `json:"type,omitempty"`
}

func (s SpringApp) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s SpringApp) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
