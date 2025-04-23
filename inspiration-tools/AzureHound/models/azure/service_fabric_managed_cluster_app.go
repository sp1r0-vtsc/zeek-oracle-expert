package azure

import "strings"

type ServiceFabricManagedClusterApp struct {
	ServiceFabricClusterApp
}

func (s *ServiceFabricManagedClusterApp) PopulateManagedIdentity() {
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

func (s ServiceFabricManagedClusterApp) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s ServiceFabricManagedClusterApp) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
