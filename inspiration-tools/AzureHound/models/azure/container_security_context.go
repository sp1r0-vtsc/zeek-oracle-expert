package azure

type ContainerSecurityContext struct {
	AllowPrivilegeEscalation bool                                 `json:"allowPrivilegeEscalation,omitempty"`
	Capabilities             ContainerSecurityContextCapabilities `json:"capabilities,omitempty"`
	Privileged               bool                                 `json:"privileged,omitempty"`
	RunAsGroup               int                                  `json:"runAsGroup,omitempty"`
	RunAsUser                int                                  `json:"runAsUser,omitempty"`
	SeccompProfile           string                               `json:"seccompProfile,omitempty"`
}
