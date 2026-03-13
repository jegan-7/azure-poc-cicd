# Azure PoC — Infrastructure & CI/CD

Multi-environment infrastructure provisioning with Terraform and git-flow CI/CD promotion pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Git-Flow CI/CD Promotion                       │
│                                                                     │
│  Feature Branch ──PR──▶ develop ──merge──▶ main ──tag──▶ Release   │
│                            │                │              │        │
│                       🟢 DEV            🟡 UAT         🔴 PRD     │
│                      (auto)            (auto)       (approval)     │
│                                                                     │
│  Each environment:                                                  │
│    TF init → plan → apply → Build → Trivy Scan → ACR Push → Deploy│
└─────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
├── terraform/
│   ├── modules/                          # Shared/common modules
│   │   ├── acr/                          # Container Registry
│   │   ├── keyvault/                     # Key Vault + secrets
│   │   └── container_apps/               # Container Apps + RBAC
│   └── environments/                     # Per-environment roots
│       ├── dev/                          # 🟢 commit → develop
│       │   ├── main.tf                   # Calls ../../modules/*
│       │   ├── backend.tf                # key = dev.tfstate
│       │   ├── variables.tf / outputs.tf
│       │   └── terraform.tfvars
│       ├── uat/                          # 🟡 merge → main
│       │   └── (same structure)
│       └── prd/                          # 🔴 release tag
│           └── (same structure)
├── .github/workflows/ci-cd.yml           # Git-flow pipeline
├── app/                                  # Sample Node.js app
│   ├── index.js / package.json / Dockerfile
├── scripts/bootstrap-backend.sh          # One-time backend setup
└── README.md
```

## Environment Comparison

| Config | DEV | UAT | PRD |
|---|---|---|---|
| ACR SKU | Basic | Standard | Premium |
| CPU | 0.25 | 0.5 | 1.0 |
| Memory | 0.5Gi | 1Gi | 2Gi |
| Replicas | 1-2 | 1-3 | 2-10 |
| State file | `dev.tfstate` | `uat.tfstate` | `prd.tfstate` |
| Deploy trigger | Merge to `develop` | Merge to `main` | Release tag |
| Approval | Auto | Auto | Manual |

## Quick Start

### 1. Bootstrap Remote State

```bash
chmod +x scripts/bootstrap-backend.sh
./scripts/bootstrap-backend.sh
# Update storage_account_name in all environments/*/backend.tf
```

### 2. Deploy DEV

```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### 3. Configure GitHub

**Secrets** (per environment prefix: `DEV_`, `UAT_`, `PRD_`):

| Secret | Description |
|---|---|
| `AZURE_CREDENTIALS` | Service Principal JSON |
| `TF_STORAGE_ACCOUNT` | Terraform state storage account |
| `{ENV}_ACR_LOGIN_SERVER` | ACR login server |
| `{ENV}_ACR_USERNAME` | ACR admin username |
| `{ENV}_ACR_PASSWORD` | ACR admin password |
| `{ENV}_RESOURCE_GROUP` | Resource group name |
| `{ENV}_CONTAINER_APP_NAME` | Container App name |

**Environments** (Settings → Environments):
- `dev` — no protection rules
- `uat` — no protection rules
- `prd` — add **Required reviewers**

### 4. Git Workflow

```bash
# Feature development
git checkout -b feature/my-feature develop
# ... make changes ...
git push origin feature/my-feature
# Create PR to develop → pipeline runs TF plan + code scan

# After PR approved and merged to develop → auto-deploys to DEV

# Promote to UAT
git checkout main && git merge develop && git push
# → auto-deploys to UAT

# Promote to PRD
gh release create v1.0.1 --target main --title "Patch v1.0.1"
# → waits for manual approval → deploys to PRD
```

## Cleanup

```bash
cd terraform/environments/dev  && terraform destroy
cd terraform/environments/uat  && terraform destroy
cd terraform/environments/prd  && terraform destroy
```

oidc for azure with github ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

step 1 - oidc creation :

az ad sp create-for-rbac \
  --name "github-actions-oidc-poc" \
  --role contributor \
  --scopes /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan


step 2 :

az ad app federated-credential create \                                                                                                   --id 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --parameters '{
    "name": "github-actions-oidc-poc",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:repo:jegan-7/azure-poc-cicd:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'


step 3 : acr push role for oidc

az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role AcrPush \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.ContainerRegistry/registries/acr
azurepocdev8zm8ln

step 4:  blob storage role for terraform backend state file storing

az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.Storage/storageAccounts/devstter
raformstate

step 5 : key vault role (optional ) if you are using key vault 

az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role "Key Vault Secrets User" \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.KeyVault/vaults/kv-azurepocdev8zm8ln


step 6 : user access administrator role must needed 

az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role "User Access Administrator" \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan












samples::::::::::::::::::::::::::::::



Requesting a Cloud Shell.Succeeded. 
Connecting terminal...

Welcome to Azure Cloud Shell

Type "az" to use Azure CLI
Type "help" to learn about Cloud Shell

Your Cloud Shell session will be ephemeral so no files or system changes will persist beyond your current session.
jegan [ ~ ]$ az ad sp create-for-rbac \
  --name "github-actions-oidc-poc" \
  --role contributor \
  --scopes /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan
Creating 'contributor' role assignment under scope '/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan'
The output includes credentials that you must protect. Be sure that you do not include these credentials in your code or check the credentials into your source control. For more information, see https://aka.ms/azadsp-cli
{
  "appId": "341f3dfd-47a8-4bdc-9957-956a2e9c3d65",
  "displayName": "github-actions-oidc-poc",
  "password": "~fK8Q~YO0dUpwNQVcBAxdU35Xftnd4RVXGjTZboP",
  "tenant": "b8869792-ee44-4a05-a4fb-b6323a34ca35"
}
jegan [ ~ ]$ az ad app federated-credential create \                                                                                                   --id 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --parameters '{
    "name": "github-actions-oidc-poc",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:repo:jegan-7/azure-poc-cicd:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#applications('e42e71a8-7320-4fbc-8912-6e8edd469d89')/federatedIdentityCredentials/$entity",
  "audiences": [
    "api://AzureADTokenExchange"
  ],
  "description": null,
  "id": "40193a92-0058-4099-912c-a417f16da1b0",
  "issuer": "https://token.actions.githubusercontent.com",
  "name": "github-actions-oidc-poc",
  "subject": "repo:repo:jegan-7/azure-poc-cicd:ref:refs/heads/main"
}
jegan [ ~ ]$ az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role AcrPush \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.ContainerRegistry/registries/acr
azurepocdev8zm8ln
{
  "condition": null,
  "conditionVersion": null,
  "createdBy": null,
  "createdOn": "2026-03-13T03:21:06.306722+00:00",
  "delegatedManagedIdentityResourceId": null,
  "description": null,
  "id": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.ContainerRegistry/registries/acrazurepocdev8zm8ln/providers/Microsoft.Authorization/roleAssignments/60b619fa-1d35-4af5-8d1b-b693e6057d73",
  "name": "60b619fa-1d35-4af5-8d1b-b693e6057d73",
  "principalId": "93447ba8-af8d-4ecd-a137-b0f27a5b67cd",
  "principalType": "ServicePrincipal",
  "resourceGroup": "rg-app-devops_Jegan",
  "roleDefinitionId": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/providers/Microsoft.Authorization/roleDefinitions/8311e382-0749-4cb8-b61a-304f252e45ec",
  "scope": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.ContainerRegistry/registries/acrazurepocdev8zm8ln",
  "type": "Microsoft.Authorization/roleAssignments",
  "updatedBy": "53602e3e-a632-4cea-8c7e-8e2aa5f1aa18",
  "updatedOn": "2026-03-13T03:21:06.770721+00:00"
}
jegan [ ~ ]$ az ad app federated-credential delete \
  --id 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --federated-credential-id 40193a92-0058-4099-912c-a417f16da1b0
jegan [ ~ ]$ az ad app federated-credential create \
  --id 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --parameters '{
    "name": "github-actions-oidc-poc",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:jegan-7/azure-poc-cicd:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#applications('e42e71a8-7320-4fbc-8912-6e8edd469d89')/federatedIdentityCredentials/$entity",
  "audiences": [
    "api://AzureADTokenExchange"
  ],
  "description": null,
  "id": "122acb5f-9406-4105-8b01-7a4c514ad38d",
  "issuer": "https://token.actions.githubusercontent.com",
  "name": "github-actions-oidc-poc",
  "subject": "repo:jegan-7/azure-poc-cicd:ref:refs/heads/main"
}
jegan [ ~ ]$ az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.Storage/storageAccounts/devstter
raformstate
{
  "condition": null,
  "conditionVersion": null,
  "createdBy": null,
  "createdOn": "2026-03-13T04:10:48.506487+00:00",
  "delegatedManagedIdentityResourceId": null,
  "description": null,
  "id": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.Storage/storageAccounts/devstterraformstate/providers/Microsoft.Authorization/roleAssignments/d28a656b-862a-4f68-8f42-96a8b2443676",
  "name": "d28a656b-862a-4f68-8f42-96a8b2443676",
  "principalId": "93447ba8-af8d-4ecd-a137-b0f27a5b67cd",
  "principalType": "ServicePrincipal",
  "resourceGroup": "rg-app-devops_Jegan",
  "roleDefinitionId": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe",
  "scope": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.Storage/storageAccounts/devstterraformstate",
  "type": "Microsoft.Authorization/roleAssignments",
  "updatedBy": "53602e3e-a632-4cea-8c7e-8e2aa5f1aa18",
  "updatedOn": "2026-03-13T04:10:49.227499+00:00"
}
jegan [ ~ ]$ az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role "Key Vault Secrets User" \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.KeyVault/vaults/kv-azurepocdev8zm8ln
{
  "condition": null,
  "conditionVersion": null,
  "createdBy": null,
  "createdOn": "2026-03-13T04:20:43.738392+00:00",
  "delegatedManagedIdentityResourceId": null,
  "description": null,
  "id": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.KeyVault/vaults/kv-azurepocdev8zm8ln/providers/Microsoft.Authorization/roleAssignments/2473fc4a-88b6-4be8-9bc2-8eeef6ab75fb",
  "name": "2473fc4a-88b6-4be8-9bc2-8eeef6ab75fb",
  "principalId": "93447ba8-af8d-4ecd-a137-b0f27a5b67cd",
  "principalType": "ServicePrincipal",
  "resourceGroup": "rg-app-devops_Jegan",
  "roleDefinitionId": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/providers/Microsoft.Authorization/roleDefinitions/4633458b-17de-408a-b874-0445c86b69e6",
  "scope": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.KeyVault/vaults/kv-azurepocdev8zm8ln",
  "type": "Microsoft.Authorization/roleAssignments",
  "updatedBy": "53602e3e-a632-4cea-8c7e-8e2aa5f1aa18",
  "updatedOn": "2026-03-13T04:20:44.225394+00:00"
}
jegan [ ~ ]$ az role assignment create \
  --assignee 341f3dfd-47a8-4bdc-9957-956a2e9c3d65 \
  --role "User Access Administrator" \
  --scope /subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan
{
  "condition": null,
  "conditionVersion": null,
  "createdBy": null,
  "createdOn": "2026-03-13T04:23:21.010705+00:00",
  "delegatedManagedIdentityResourceId": null,
  "description": null,
  "id": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan/providers/Microsoft.Authorization/roleAssignments/28a9e073-54c1-4b00-a7cd-5e98bf355cb5",
  "name": "28a9e073-54c1-4b00-a7cd-5e98bf355cb5",
  "principalId": "93447ba8-af8d-4ecd-a137-b0f27a5b67cd",
  "principalType": "ServicePrincipal",
  "resourceGroup": "rg-app-devops_Jegan",
  "roleDefinitionId": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/providers/Microsoft.Authorization/roleDefinitions/18d7d88d-d35e-4fb5-a5c3-7773c20a72d9",
  "scope": "/subscriptions/db84696f-9164-40e7-8623-08b0ff53b0e9/resourceGroups/rg-app-devops_Jegan",
  "type": "Microsoft.Authorization/roleAssignments",
  "updatedBy": "53602e3e-a632-4cea-8c7e-8e2aa5f1aa18",
  "updatedOn": "2026-03-13T04:23:21.474869+00:00"
}
jegan [ ~ ]$ 
