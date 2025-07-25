# OpenChat Infrastructure

This directory contains Terraform configuration for deploying OpenChat on Google Cloud Platform.

## Architecture

- **Frontend**: React application served via Cloud Run
- **Backend**: Express.js/Socket.io API served via Cloud Run
- **Database**: Cloud SQL PostgreSQL with private IP
- **Security**: Secret Manager for sensitive data, IAM with least privilege

## Prerequisites

1. Complete the bootstrap setup first (see bootstrap/README.md)
2. Install Terraform >= 1.5

## Deployment Steps

### 1. Configure Terraform

```bash
# Set authentication
cd terraform
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/../../terraform-key.json"

# Copy and edit configuration
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project details
```

### 2. Initialize and Deploy

```bash
# Initialize Terraform with backend
terraform init

# Deploy infrastructure
terraform plan
terraform apply
```

### 3. Initialize Secrets

After Terraform creates the resources, manually set secret values:

```bash
# JWT secret
openssl rand -base64 32 | gcloud secrets versions add openchat-jwt-secret --data-file=-

# Database password
DB_PASSWORD=$(openssl rand -hex 16)
echo -n "$DB_PASSWORD" | gcloud secrets versions add openchat-db-password --data-file=-
gcloud sql users set-password openchat_user --instance=openchat-db --password="$DB_PASSWORD"

# DATABASE_URL
DB_PRIVATE_IP=$(terraform output -raw database_private_ip)
echo -n "postgresql://openchat_user:${DB_PASSWORD}@${DB_PRIVATE_IP}:5432/openchat" | \
  gcloud secrets versions add openchat-database-url --data-file=-
```
