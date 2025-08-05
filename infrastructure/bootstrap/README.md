# GCP Bootstrap

Sets up initial GCP resources for OpenChat infrastructure.

## Prerequisites

- `gcloud` CLI installed and authenticated
- Access to your GCP organization
- Billing account enabled

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```bash
   # Configuration values
   PROJECT_ID=your-project-id
   BILLING_ACCOUNT_ID=your-billing-account-id
   ORGANIZATION_ID=your-organization-id
   TERRAFORM_STATE_BUCKET=your-terraform-state-bucket-name
   ```

3. Run the bootstrap script:
   ```bash
   ./setup.sh
   ```

## What it creates

- GCP project (from PROJECT_ID)
- Enables meta-APIs required for Terraform provider to function:
  - `cloudresourcemanager.googleapis.com` - Project and IAM management
  - `serviceusage.googleapis.com` - API enablement/management
  - `cloudbilling.googleapis.com` - Billing account management
  - `iam.googleapis.com` - Service account and role management
  - `storage.googleapis.com` - Core GCS service
  - `storage-component.googleapis.com` - GCS bucket operations
  - `storage-api.googleapis.com` - GCS API access
- Terraform service account with required permissions
- GCS bucket for Terraform state with versioning enabled
- Service account key: `../../terraform-key.json`

## API Management Strategy

This bootstrap follows Google Cloud best practices for API management:

1. **Meta-APIs** (handled by bootstrap):
   - Essential APIs that Terraform provider needs to operate
   - Enabled once during initial setup
   - Never managed by Terraform to avoid circular dependencies

2. **Product APIs** (handled by Terraform):
   - All application-specific APIs (Cloud Run, Cloud SQL, etc.)
   - Managed declaratively in `terraform/main.tf`
   - Provides drift detection and version control
   - Configured with `disable_on_destroy = false` to prevent accidental disabling

## After setup

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/../../terraform-key.json"
cd ../terraform
terraform init
```

## Security Notes

- The `.env` file contains sensitive information and should not be committed
- The generated `terraform-key.json` file contains credentials and should be kept secure
- Both files are in `.gitignore` to prevent accidental commits