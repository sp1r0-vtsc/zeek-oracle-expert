package azure

// Properties of the Red Hat OpenShift Cluster
type RedHatOpenShiftClusterProperties struct {
	APIServerProfile        RedHatOpenShiftClusterAPIServerProfile        `json:"apiServerProfile,omitempty"`
	ClusterProfile          RedHatOpenShiftClusterClusterProfile          `json:"clusterProfile,omitempty"`
	ConsoleProfile          RedHatOpenShiftClusterConsoleProfile          `json:"consoleProfile,omitempty"`
	ServicePrincipalProfile RedHatOpenShiftClusterServicePrincipalProfile `json:"servicePrincipalProfile,omitempty"`
	WorkerProfiles          []RedHatOpenShiftClusterWorkerProfile         `json:"workerProfiles,omitempty"`
	WorkerProfilesStatus    []RedHatOpenShiftClusterWorkerProfile         `json:"workerProfilesStatus,omitempty"`
}

type RedHatOpenShiftClusterAPIServerProfile struct {
	IP         string `json:"ip,omitempty"`
	URL        string `json:"url,omitempty"`
	Visibility string `json:"visibility,omitempty"`
}

type RedHatOpenShiftClusterClusterProfile struct {
	Domain          string `json:"domain,omitempty"`
	PullSecret      string `json:"pullSecret,omitempty"`
	ResourceGroupId string `json:"resourceGroupId,omitempty"`
}

type RedHatOpenShiftClusterServicePrincipalProfile struct {
	ClientId string `json:"clientId,omitempty"`
}

type RedHatOpenShiftClusterConsoleProfile struct {
	ClientID     string `json:"clientId,omitempty"`
	ClientSecret string `json:"clientSecret,omitempty"`
}

type RedHatOpenShiftClusterWorkerProfile struct {
	Count    int    `json:"count,omitempty"`
	Name     string `json:"name,omitempty"`
	SubnetID string `json:"subnetId,omitempty"`
}
