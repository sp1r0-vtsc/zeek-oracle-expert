package azure

// Properties of the Spring App
type SpringAppServiceSku struct {
	Capacity int    `json:"capacity,omitempty"`
	Name     string `json:"name,omitempty"`
	Tier     string `json:"tier,omitempty"`
}
