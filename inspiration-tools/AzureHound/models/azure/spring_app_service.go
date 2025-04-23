package azure

import "strings"

type SpringAppService struct {
	Entity

	Properties SpringAppServiceProperties `json:"properties,omitempty"`
	Location   string                     `json:"location,omitempty"`
	Name       string                     `json:"name,omitempty"`
	Sku        SpringAppServiceSku        `json:"sku,omitempty"`
	Tags       map[string]string          `json:"tags,omitempty"`
	Type       string                     `json:"type,omitempty"`
}

func (s SpringAppService) ResourceGroupName() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 4 {
		return parts[4]
	} else {
		return ""
	}
}

func (s SpringAppService) ResourceGroupId() string {
	parts := strings.Split(s.Id, "/")
	if len(parts) > 5 {
		return strings.Join(parts[:5], "/")
	} else {
		return ""
	}
}
