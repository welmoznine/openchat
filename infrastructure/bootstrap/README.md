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
- Terraform service account with required permissions
- GCS bucket for Terraform state
- Service account key: `../terraform-key.json`

## After setup

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/../terraform-key.json"
cd ../terraform
terraform init
```

## Security Notes

- The `.env` file contains sensitive information and should not be committed
- The generated `terraform-key.json` file contains credentials and should be kept secure
- Both files are in `.gitignore` to prevent accidental commits