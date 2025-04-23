output "agent_identity_principal_ids" {
  description = "Map of user-assigned managed identity names to their principal IDs."
  value = {
    for name in var.agent_identities :
    name => azurerm_user_assigned_identity.agent_identity[name].principal_id
  }
}

output "access_group_object_ids" {
  description = "Azure AD group object IDs that were granted access."
  value       = var.access_group_object_ids
}