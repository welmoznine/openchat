output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

# output "frontend_url" {
#   description = "Frontend service URL"
#   value       = google_cloud_run_service.frontend.status[0].url
# }

# output "backend_url" {
#   description = "Backend service URL"
#   value       = google_cloud_run_service.backend.status[0].url
# }

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}

output "database_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = google_artifact_registry_repository.main.name
}

output "database_password_secret" {
  description = "Secret Manager secret name for database password"
  value       = google_secret_manager_secret.db_password.secret_id
  sensitive   = true
}

output "database_private_ip" {
  description = "Cloud SQL instance private IP address"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}