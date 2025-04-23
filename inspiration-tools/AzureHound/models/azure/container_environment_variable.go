package azure

type ContainerEnvironmentVariable struct {
	Name        string `json:"name,omitempty"`
	SecureValue string `json:"secureValue,omitempty"`
	Value       string `json:"value,omitempty"`
}
