terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Data source: existing resource group
data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

# Data source: existing Key Vault
data "azurerm_key_vault" "kv" {
  name                = var.vault_name
  resource_group_name = var.resource_group_name
}


# Assign roles to Azure AD groups for lab/work access
resource "azurerm_role_assignment" "group_reader" {
  for_each            = var.enable_lab_access ? toset(var.access_group_object_ids) : []
  scope               = data.azurerm_key_vault.kv.id
  role_definition_name = "Reader"
  principal_id        = each.value
}

resource "azurerm_key_vault_access_policy" "group_data_plane" {
  for_each     = var.enable_lab_access ? toset(var.access_group_object_ids) : []
  key_vault_id = data.azurerm_key_vault.kv.id
  tenant_id    = var.tenant_id
  object_id    = each.value

  secret_permissions = [
    "Get",
    "List",
  ]
}

resource "azurerm_role_assignment" "group_vm_contributor" {
  for_each             = var.enable_lab_access ? toset(var.access_group_object_ids) : []
  scope                = data.azurerm_resource_group.rg.id
  role_definition_name = "Virtual Machine Contributor"
  principal_id         = each.value
}



# Create user-assigned managed identities for security automation tools
resource "azurerm_user_assigned_identity" "agent_identity" {
  for_each            = toset(var.agent_identities)
  name                = each.value
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
}

# Assign roles to each managed identity
resource "azurerm_role_assignment" "agent_reader" {
  for_each            = toset(var.agent_identities)
  scope               = data.azurerm_key_vault.kv.id
  role_definition_name = "Reader"
  principal_id        = azurerm_user_assigned_identity.agent_identity[each.value].principal_id
}

resource "azurerm_role_assignment" "agent_secrets_user" {
  for_each            = toset(var.agent_identities)
  scope               = data.azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id        = azurerm_user_assigned_identity.agent_identity[each.value].principal_id
}

resource "azurerm_role_assignment" "agent_vm_contributor" {
  for_each            = toset(var.agent_identities)
  scope               = data.azurerm_resource_group.rg.id
  role_definition_name = "Virtual Machine Contributor"
  principal_id        = azurerm_user_assigned_identity.agent_identity[each.value].principal_id
}