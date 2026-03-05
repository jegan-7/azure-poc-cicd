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
