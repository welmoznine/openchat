# Data source to get current project details
data "google_project" "current" {}

# Enable meta-APIs (also enabled in bootstrap for initial Terraform run)
resource "google_project_service" "meta_apis" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "iam.googleapis.com",
    "storage.googleapis.com",
    "storage-component.googleapis.com",
    "storage-api.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false
}

# Enable product APIs for the application
resource "google_project_service" "product_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false

  depends_on = [google_project_service.meta_apis]
}

# Terraform Service Account
data "google_service_account" "terraform" {
  account_id = "terraform-sa@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "tf_sa_required_roles" {
  for_each = toset([
    "roles/run.admin",
    "roles/compute.networkAdmin",
    "roles/servicenetworking.networksAdmin",
    "roles/cloudsql.admin",
    "roles/secretmanager.admin",
    "roles/iam.serviceAccountAdmin",
    "roles/iam.serviceAccountUser",
    "roles/artifactregistry.admin",
    "roles/serviceusage.serviceUsageAdmin",
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${data.google_service_account.terraform.email}"
}

# Deployment Service Account
resource "google_service_account" "deployment_sa" {
  account_id   = "deployment-sa"
  display_name = "Deployment Service Account"
  description  = "Service account for deployment to Cloud Run"
}

resource "google_project_iam_member" "deployment_sa_permissions" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/cloudbuild.builds.builder",
    "roles/storage.objectAdmin",
    "roles/logging.logWriter"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployment_sa.email}"
}

# VPC and Networking
resource "google_compute_network" "main" {
  name                    = "${var.app_name}-vpc"
  auto_create_subnetworks = false

  depends_on = [
    google_project_service.product_apis,
    google_project_iam_member.tf_sa_required_roles
  ]
}

resource "google_compute_subnetwork" "main" {
  name          = "${var.app_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.main.id

  depends_on = [google_project_iam_member.tf_sa_required_roles]
}

resource "google_compute_global_address" "private_ip_range" {
  name          = "${var.app_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id

  depends_on = [google_project_iam_member.tf_sa_required_roles]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]

  depends_on = [
    google_project_iam_member.tf_sa_required_roles
  ]
}

# Artifact Registry
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "${var.app_name}-repo"
  description   = "Docker repository for OpenChat"
  format        = "DOCKER"

  depends_on = [
    google_project_service.product_apis,
    google_project_iam_member.tf_sa_required_roles
  ]
}

# Cloud SQL
resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-custom-1-3840"
    availability_type = "REGIONAL"
    disk_type         = "PD_SSD"
    disk_size         = 20

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }

    maintenance_window {
      day          = 7
      hour         = 4
      update_track = "stable"
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
    }
  }

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_iam_member.tf_sa_required_roles
  ]
}

resource "google_sql_database" "main" {
  name     = var.app_name
  instance = google_sql_database_instance.main.name

  depends_on = [google_project_iam_member.tf_sa_required_roles]
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

resource "google_sql_user" "main" {
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result

  depends_on = [google_project_iam_member.tf_sa_required_roles]
}

# Secret Manager

resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.app_name}-database-url"

  replication {
    auto {}
  }

  depends_on = [
    google_project_service.product_apis,
    google_project_iam_member.tf_sa_required_roles
  ]
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "${var.app_name}-jwt-secret"

  replication {
    auto {}
  }

  depends_on = [
    google_project_service.product_apis,
    google_project_iam_member.tf_sa_required_roles
  ]
}

resource "google_service_account" "frontend" {
  account_id   = "${var.app_name}-frontend-sa"
  display_name = "OpenChat Frontend Service Account"
}

resource "google_service_account" "backend" {
  account_id   = "${var.app_name}-backend-sa"
  display_name = "OpenChat Backend Service Account"
}

resource "google_project_iam_member" "backend_permissions" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/artifactregistry.reader",
    "roles/compute.networkUser"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.backend.email}"
}


resource "google_secret_manager_secret_iam_member" "backend_jwt_secret_accessor" {
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_database_url_accessor" {
  secret_id = google_secret_manager_secret.database_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

# Cloud Run Services
resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region

  template {
    service_account = google_service_account.frontend.email

    containers {
      image = var.frontend_image != "" ? var.frontend_image : "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}/frontend:latest"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    scaling {
      max_instance_count = 10
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_project_service.product_apis,
    google_project_iam_member.tf_sa_required_roles
  ]
}

resource "google_cloud_run_v2_service" "backend" {
  name     = var.backend_service_name
  location = var.region

  template {
    service_account = google_service_account.backend.email

    containers {
      image = var.backend_image != "" ? var.backend_image : "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}/backend:latest"

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      dynamic "env" {
        for_each = {
          "DATABASE_URL" = {
            secret = google_secret_manager_secret.database_url.secret_id
          }
          "JWT_SECRET" = {
            secret = google_secret_manager_secret.jwt_secret.secret_id
          }
          "NODE_ENV" = {
            value = "production"
          }
          "PUBLIC_URL" = {
            value = "https://${var.frontend_service_name}-${data.google_project.current.number}.${var.region}.run.app"
          }
        }
        content {
          name = env.key

          dynamic "value_source" {
            for_each = can(env.value.secret) ? [1] : []
            content {
              secret_key_ref {
                secret  = env.value.secret
                version = "latest"
              }
            }
          }

          value = can(env.value.value) ? env.value.value : null
        }
      }
    }

    scaling {
      max_instance_count = 10
    }

    vpc_access {
      network_interfaces {
        network    = google_compute_network.main.name
        subnetwork = google_compute_subnetwork.main.name
      }
      egress = "ALL_TRAFFIC"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_project_service.product_apis,
    google_project_iam_member.tf_sa_required_roles
  ]
}

resource "google_cloud_run_v2_service_iam_binding" "frontend_noauth" {
  location = google_cloud_run_v2_service.frontend.location
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

resource "google_cloud_run_v2_service_iam_binding" "backend_noauth" {
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}
