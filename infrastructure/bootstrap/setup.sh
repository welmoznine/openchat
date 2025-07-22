#!/bin/bash

# OpenChat GCP Bootstrap Script
# This script sets up the initial GCP resources required before running Terraform

set -euo pipefail

# Load environment variables from .env file if it exists
if [[ -f ".env" ]]; then
    source .env
fi

# Configuration - Load from environment variables
PROJECT_ID="${PROJECT_ID:-}"
PROJECT_NAME="OpenChat Production"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-}"
ORGANIZATION_ID="${ORGANIZATION_ID:-}"
REGION="us-west1"
TERRAFORM_SA_NAME="terraform-sa"
TERRAFORM_STATE_BUCKET="${TERRAFORM_STATE_BUCKET:-}"

# Validate required environment variables
if [[ -z "$PROJECT_ID" ]]; then
    echo "Error: PROJECT_ID environment variable is required"
    exit 1
fi

if [[ -z "$BILLING_ACCOUNT_ID" ]]; then
    echo "Error: BILLING_ACCOUNT_ID environment variable is required"
    exit 1
fi

if [[ -z "$ORGANIZATION_ID" ]]; then
    echo "Error: ORGANIZATION_ID environment variable is required"
    exit 1
fi

if [[ -z "$TERRAFORM_STATE_BUCKET" ]]; then
    echo "Error: TERRAFORM_STATE_BUCKET environment variable is required"
    exit 1
fi

echo "=== OpenChat GCP Bootstrap Setup ==="
echo "Project ID: ${PROJECT_ID}"
echo "Organization ID: ${ORGANIZATION_ID}"
echo "Region: ${REGION}"
echo ""

# Verify organization access
echo "1. Verifying organization access..."
echo "   Organization ID: ${ORGANIZATION_ID}"

# Verify the organization exists and user has access
if ! gcloud organizations describe ${ORGANIZATION_ID} &>/dev/null; then
    echo "Error: Organization ${ORGANIZATION_ID} not found or you don't have access."
    echo "Please ensure you have access to the oregonstate.edu organization."
    exit 1
fi

echo "   Organization access verified."
PROJECT_CREATE_FLAGS="--organization=${ORGANIZATION_ID}"

# Create project
echo "2. Creating GCP project..."
if gcloud projects describe ${PROJECT_ID} &>/dev/null; then
    echo "   Project ${PROJECT_ID} already exists. Skipping..."
else
    gcloud projects create ${PROJECT_ID} \
        --name="${PROJECT_NAME}" \
        ${PROJECT_CREATE_FLAGS}
    echo "   Project created successfully."
fi

# Link billing account
echo "3. Linking billing account..."
gcloud billing projects link ${PROJECT_ID} --billing-account=${BILLING_ACCOUNT_ID}
echo "   Billing account linked."

# Set project as default
echo "4. Setting project as default..."
gcloud config set project ${PROJECT_ID}
echo "   Project set as default."

# Enable required APIs
echo "5. Enabling required APIs..."
APIS=(
    "cloudresourcemanager.googleapis.com"
    "compute.googleapis.com"
    "container.googleapis.com"
    "sqladmin.googleapis.com"
    "servicenetworking.googleapis.com"
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "secretmanager.googleapis.com"
    "iam.googleapis.com"
    "storage-component.googleapis.com"
    "storage-api.googleapis.com"
)

for API in "${APIS[@]}"; do
    echo "   Enabling ${API}..."
    gcloud services enable ${API} --project=${PROJECT_ID}
done
echo "   All APIs enabled."

# Create Terraform service account
echo "6. Creating Terraform service account..."
if gcloud iam service-accounts describe ${TERRAFORM_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
    echo "   Service account already exists. Skipping..."
else
    gcloud iam service-accounts create ${TERRAFORM_SA_NAME} \
        --display-name="Terraform Service Account" \
        --project=${PROJECT_ID}
    echo "   Service account created."
fi

# Assign roles to Terraform service account
echo "7. Assigning roles to Terraform service account..."
ROLES=(
    "roles/compute.admin"
    "roles/container.admin"
    "roles/cloudsql.admin"
    "roles/storage.admin"
    "roles/iam.serviceAccountAdmin"
    "roles/resourcemanager.projectIamAdmin"
    "roles/compute.networkAdmin"
    "roles/run.admin"
    "roles/secretmanager.admin"
)

for ROLE in "${ROLES[@]}"; do
    echo "   Assigning ${ROLE}..."
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${TERRAFORM_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="${ROLE}" \
        --quiet
done
echo "   All roles assigned."

# Create Terraform state bucket
echo "8. Creating Terraform state bucket..."
if gsutil ls -b gs://${TERRAFORM_STATE_BUCKET} &>/dev/null; then
    echo "   Bucket already exists. Skipping..."
else
    gsutil mb -p ${PROJECT_ID} -c STANDARD -l ${REGION} gs://${TERRAFORM_STATE_BUCKET}
    # Enable versioning for state file protection
    gsutil versioning set on gs://${TERRAFORM_STATE_BUCKET}
    # Enable uniform bucket-level access
    gsutil uniformbucketlevelaccess set on gs://${TERRAFORM_STATE_BUCKET}
    echo "   State bucket created with versioning enabled."
fi

# Grant Terraform SA access to state bucket
echo "9. Granting Terraform SA access to state bucket..."
gsutil iam ch serviceAccount:${TERRAFORM_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com:objectAdmin gs://${TERRAFORM_STATE_BUCKET}
echo "   Access granted."

# Create service account key
echo "10. Creating service account key..."
KEY_FILE="../terraform-key.json"
if [ -f "${KEY_FILE}" ]; then
    echo "   Key file already exists. Skipping..."
else
    gcloud iam service-accounts keys create ${KEY_FILE} \
        --iam-account=${TERRAFORM_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
        --project=${PROJECT_ID}
    chmod 600 ${KEY_FILE}
    echo "   Key created at: ${KEY_FILE}"
fi

echo ""
echo "=== Bootstrap Complete! ==="
echo ""
echo "Next steps:"
echo "1. Export the service account key path:"
echo "   export GOOGLE_APPLICATION_CREDENTIALS=\"\$(pwd)/${KEY_FILE}\""
echo ""
echo "2. Create your Terraform configuration in ../terraform/"
echo ""
echo "3. Configure your Terraform backend to use:"
echo "   bucket = \"${TERRAFORM_STATE_BUCKET}\""
echo "   prefix = \"terraform/state\""
echo ""
echo "Important: Keep ${KEY_FILE} secure and never commit it to version control!"