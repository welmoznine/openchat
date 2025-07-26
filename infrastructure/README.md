# OpenChat Infrastructure

This directory contains Terraform configuration for deploying OpenChat on Google Cloud Platform.

## Architecture

- **Frontend**: React application served via Cloud Run
- **Backend**: Express.js/Socket.io API served via Cloud Run
- **Database**: Cloud SQL PostgreSQL with private VPC connectivity
- **Security**: Secret Manager for sensitive data, IAM with least privilege
- **Registry**: Artifact Registry for container images

## Prerequisites

1. Complete the bootstrap setup first (see bootstrap/README.md)
2. Install Terraform >= 1.5
3. Build and push container images to Artifact Registry

## Deployment Steps

### 1. Build and Push Container Images

```bash
# Get registry URL
REGISTRY_URL="<your-region>-docker.pkg.dev/<your-project-id>/openchat"

# Build and push frontend
docker build -t $REGISTRY_URL/frontend:latest ./client
docker push $REGISTRY_URL/frontend:latest

# Build and push backend
docker build -t $REGISTRY_URL/backend:latest ./server
docker push $REGISTRY_URL/backend:latest
```

### 2. Configure Terraform

```bash
cd terraform

# Copy and edit configuration
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with:
# - project_id
# - frontend_image
# - backend_image
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform with backend
terraform init

# Deploy infrastructure
terraform plan
terraform apply
```

### 4. Initialize Secrets

After Terraform creates the resources, manually set the JWT secret:

```bash
# JWT secret
openssl rand -base64 32 | gcloud secrets versions add openchat-jwt-secret --data-file=-

# DATABASE_URL (automatically created by Terraform)
# No manual action needed - Cloud Run services read from Secret Manager
```

## Outputs

After deployment, Terraform provides:
- `frontend_url`: Frontend application URL
- `backend_url`: Backend API URL
- `artifact_registry_url`: Registry URL for container images
- `deployment_service_account`: Service account for CI/CD
