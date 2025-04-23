package azure

type ContainerVolumeMount struct {
	MountPath string `json:"mountPath,omitempty"`
	Name      string `json:"name,omitempty"`
	ReadOnly  bool   `json:"readOnly,omitempty"`
}
