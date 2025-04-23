package azure

type Container struct {
	Name                 string                         `json:"name,omitempty"`
	Command              []string                       `json:"command,omitempty"`
	EnvironmentVariables []ContainerEnvironmentVariable `json:"environmentVariables,omitempty"`
	Image                string                         `json:"image,omitempty"`
	Ports                []ContainerPort                `json:"ports,omitempty"`
	SecurityContext      ContainerSecurityContext       `json:"securityContext,omitempty"`
	VolumeMounts         []ContainerVolumeMount         `json:"volumeMounts,omitempty"`
}
