package azure

import "strings"

type ServiceFabricClusterApp struct {
	Entity

	Identity   ManagedIdentity                   `json:"identity,omitempty"`
	Properties ServiceFabricClusterAppProperties `json:"properties,omitempty"`
	Location   string                            `json:"location,omitempty"`
	Tags       map[string]string                 `json:"tags,omitempty"`
	Type       string                            `json:"type,omitempty"`
}

func (s *ServiceFabricClusterApp) PopulateManagedIdentity() {
	if len(s.Properties.ManagedIdentities) > 0 {
		if s.Identity.UserAssignedIdentities == nil {
			s.Identity.UserAssignedIdentities = make(map[string]UserAssignedIdentity)
		}
		for _, identity := range s.Properties.ManagedIdentities {
			s.Identity.UserAssignedIdentities[identity.Name] = UserAssignedIdentity{
				PrincipalId: identity.PrincipalId,
			}
		}
	}
}

func (s ServiceFabricClusterApp) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s ServiceFabricClusterApp) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
