variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-west1"
}


variable "app_name" {
  description = "Application name"
  type        = string
  default     = "openchat"
}

variable "frontend_service_name" {
  description = "Frontend Cloud Run service name"
  type        = string
  default     = "openchat-frontend"
}

variable "backend_service_name" {
  description = "Backend Cloud Run service name"
  type        = string
  default     = "openchat-backend"
}

variable "db_user" {
  description = "Database user name"
  type        = string
  default     = "openchat_user"
}

# variable "frontend_image" {
#   description = "Frontend container image"
#   type        = string
#   default     = ""
# }

# variable "backend_image" {
#   description = "Backend container image"
#   type        = string
#   default     = ""
# }