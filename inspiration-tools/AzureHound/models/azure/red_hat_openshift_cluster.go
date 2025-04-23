package azure

import "strings"

type RedHatOpenShiftCluster struct {
	Entity

	Properties RedHatOpenShiftClusterProperties              `json:"properties,omitempty"`
	Identity   RedHatOpenShiftClusterServicePrincipalProfile `json:"identity,omitempty"`
	Location   string                                        `json:"location,omitempty"`
	Name       string                                        `json:"name,omitempty"`
	Tags       map[string]string                             `json:"tags,omitempty"`
	Type       string                                        `json:"type,omitempty"`
}

func (s *RedHatOpenShiftCluster) PopulateIdentity() {
	if s.Properties.ServicePrincipalProfile != (RedHatOpenShiftClusterServicePrincipalProfile{}) {
		s.Identity = s.Properties.ServicePrincipalProfile
	}
}

func (s RedHatOpenShiftCluster) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s RedHatOpenShiftCluster) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
