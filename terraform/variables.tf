variable "resource_group_name" {
  description = "Name of the existing resource group."
  type        = string
}

variable "vault_name" {
  description = "Name of the existing Key Vault."
  type        = string
}

variable "tenant_id" {
  description = "Azure AD tenant ID."
  type        = string
}

variable "access_group_object_ids" {
  description = "List of Azure AD group object IDs to grant access (lab/work groups)."
  type        = list(string)
  default     = []
}

variable "enable_lab_access" {
  description = "Enable assignment of lab/work access permissions for Azure AD groups."
  type        = bool
  default     = false
}

variable "agent_identities" {
  description = "List of user-assigned managed identity names for security automation tools."
  type        = list(string)
  default     = []
}