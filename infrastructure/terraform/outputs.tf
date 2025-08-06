output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "frontend_url" {
  description = "Frontend service URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "backend_url" {
  description = "Backend service URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}

output "database_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}"
}


output "database_private_ip" {
  description = "Cloud SQL instance private IP address"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}

output "deployment_service_account" {
  description = "Deployment service account email"
  value       = google_service_account.deployment_sa.email
}

output "database_url" {
  description = "PostgreSQL connection string containing user, password, host and database"
  value       = "postgres://${var.db_user}:${random_password.db_password.result}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.main.name}"
  sensitive   = true
}