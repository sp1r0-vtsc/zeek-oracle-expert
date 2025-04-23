package azure

type ContainerAppProperties struct {
	Configuration              ContainerAppConfiguration `json:"configuration,omitempty"`
	CustomDomainVerificationID string                    `json:"customDomainVerificationId,omitempty"`
	EnvironmentID              string                    `json:"environmentId,omitempty"`
	EventStreamEndpoint        string                    `json:"eventStreamEndpoint,omitempty"`
	LatestRevisionFQDN         string                    `json:"latestRevisionFqdn,omitempty"`
	OutboundIPAddress          string                    `json:"outboundIPAddress,omitempty"`
	Template                   ContainerAppTemplate      `json:"template,omitempty"`
	WorkloadProfileName        string                    `json:"workloadProfileName,omitempty"`
}

type ContainerAppConfiguration struct {
	DAPR       ContainerAppDAPR       `json:"dapr,omitempty"`
	Ingress    ContainerAppIngress    `json:"ingress,omitempty"`
	Registries []ContainerAppRegistry `json:"registries,omitempty"`
	Secrets    []ContainerAppSecret   `json:"secrets,omitempty"`
	Service    ContainerAppService    `json:"service,omitempty"`
}

type ContainerAppDAPR struct {
	AppID       string `json:"appId,omitempty"`
	AppPort     int    `json:"appPort,omitempty"`
	AppProtocol string `json:"appProtocol,omitempty"`
	Enabled     bool   `json:"enabled,omitempty"`
}

type ContainerAppIngress struct {
	AdditionalPortMappings []ContainerAppIngressPortMapping `json:"additionalPortMappings,omitempty"`
	AllowInsecure          bool                             `json:"allowInsecure,omitempty"`
	ClientCertificateMode  string                           `json:"clientCertificateMode,omitempty"`
	CORSPolicy             ContainerAppCORSPolicy           `json:"corsPolicy,omitempty"`
	CustomDomains          []ContainerAppCustomDomain       `json:"customDomains,omitempty"`
	ExposedPort            int                              `json:"exposedPort,omitempty"`
	External               bool                             `json:"external,omitempty"`
	FQDN                   string                           `json:"fqdn,omitempty"`
	TargetPort             int                              `json:"targetPort,omitempty"`
	Transport              string                           `json:"transport,omitempty"`
}

type ContainerAppIngressPortMapping struct {
	ExposedPort int  `json:"exposedPort,omitempty"`
	External    bool `json:"external,omitempty"`
	TargetPort  int  `json:"targetPort,omitempty"`
}

type ContainerAppCORSPolicy struct {
	AllowCredentials bool     `json:"allowCredentials,omitempty"`
	AllowedHeaders   []string `json:"allowedHeaders,omitempty"`
	AllowedMethods   []string `json:"allowedMethods,omitempty"`
	AllowedOrigins   []string `json:"allowedOrigins,omitempty"`
	ExposeHeaders    []string `json:"exposeHeaders,omitempty"`
}

type ContainerAppCustomDomain struct {
	BindingType   string `json:"bindingType,omitempty"`
	CertificateID string `json:"certificateId,omitempty"`
	Name          string `json:"name,omitempty"`
}

type ContainerAppRegistry struct {
	Identity          string `json:"identity,omitempty"`
	PasswordSecretRef string `json:"passwordSecretRef,omitempty"`
	Server            string `json:"server,omitempty"`
	Username          string `json:"username,omitempty"`
}

type ContainerAppSecret struct {
	Identity    string `json:"identity,omitempty"`
	KeyVaultURL string `json:"keyVaultUrl,omitempty"`
	Name        string `json:"name,omitempty"`
	Value       string `json:"value,omitempty"`
}

type ContainerAppService struct {
	Type string `json:"type,omitempty"`
}

type ContainerAppTemplate struct {
	Containers     []ContainerAppContainer   `json:"containers,omitempty"`
	InitContainers []ContainerAppContainer   `json:"initContainers,omitempty"`
	ServiceBinds   []ContainerAppServiceBind `json:"serviceBinds,omitempty"`
	Volumes        []ContainerAppVolume      `json:"volumes,omitempty"`
}

type ContainerAppContainer struct {
	Args         []string                  `json:"args,omitempty"`
	Command      []string                  `json:"command,omitempty"`
	Env          []ContainerAppEnvVar      `json:"env,omitempty"`
	Image        string                    `json:"image,omitempty"`
	Name         string                    `json:"name,omitempty"`
	VolumeMounts []ContainerAppVolumeMount `json:"volumeMounts,omitempty"`
}

type ContainerAppEnvVar struct {
	Name      string `json:"name,omitempty"`
	SecretRef string `json:"secretRef,omitempty"`
	Value     string `json:"value,omitempty"`
}

type ContainerAppVolumeMount struct {
	MountPath  string `json:"mountPath,omitempty"`
	SubPath    string `json:"subPath,omitempty"`
	VolumeName string `json:"volumeName,omitempty"`
}

type ContainerAppServiceBind struct {
	Name      string `json:"name,omitempty"`
	ServiceID string `json:"serviceId,omitempty"`
}

type ContainerAppVolume struct {
	MountOptions []string                   `json:"mountOptions,omitempty"`
	Name         string                     `json:"name,omitempty"`
	Secrets      []ContainerAppVolumeSecret `json:"secrets,omitempty"`
	StorageName  string                     `json:"storageName,omitempty"`
	StorageType  string                     `json:"storageType,omitempty"`
}

type ContainerAppVolumeSecret struct {
	Path      string `json:"path,omitempty"`
	SecretRef string `json:"secretRef,omitempty"`
}
