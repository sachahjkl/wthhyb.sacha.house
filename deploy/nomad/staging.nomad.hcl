variable "image" {
  type        = string
  description = "Immutable GHCR image reference"

  validation {
    condition     = strlen(var.image) == 108 && substr(var.image, 0, 44) == "ghcr.io/sachahjkl/wthhyb.sacha.house@sha256:"
    error_message = "The image must use the wthhyb GHCR repository and an exact SHA-256 digest."
  }
}

job "wthhyb-sacha-house" {
  namespace   = "staging"
  datacenters = ["homelab"]
  type        = "service"

  meta {
    image = var.image
  }

  group "web" {
    count = 1

    update {
      max_parallel      = 1
      health_check      = "checks"
      min_healthy_time  = "10s"
      healthy_deadline  = "2m"
      progress_deadline = "5m"
      auto_revert       = true
    }

    restart {
      attempts = 3
      interval = "10m"
      delay    = "15s"
      mode     = "fail"
    }

    reschedule {
      attempts       = 3
      interval       = "1h"
      delay          = "30s"
      delay_function = "exponential"
      max_delay      = "5m"
      unlimited      = false
    }

    network {
      mode = "host"

      port "http" {
        static       = 9021
        to           = 80
        host_network = "loopback"
      }
    }

    task "web" {
      driver = "docker"

      config {
        image        = var.image
        network_mode = "services"
        ports        = ["http"]
      }

      service {
        name     = "wthhyb-sacha-house-staging"
        provider = "nomad"
        port     = "http"
        tags = [
          "traefik.enable=true",
          "traefik.http.routers.wthhyb-sacha-house-staging.entrypoints=nomad",
          "traefik.http.routers.wthhyb-sacha-house-staging.middlewares=wthhyb-sacha-house-staging-noindex",
          "traefik.http.routers.wthhyb-sacha-house-staging.rule=Host(`staging.wthhyb.sacha.house`)",
          "traefik.http.routers.wthhyb-sacha-house-staging.tls.domains[0].main=staging.wthhyb.sacha.house",
          "traefik.http.middlewares.wthhyb-sacha-house-staging-noindex.headers.customresponseheaders.X-Robots-Tag=noindex, nofollow",
        ]

        check {
          name     = "HTTP health"
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "2s"

          check_restart {
            limit           = 3
            grace           = "30s"
            ignore_warnings = false
          }
        }
      }

      resources {
        cpu    = 200
        memory = 128
      }

      logs {
        max_files     = 5
        max_file_size = 10
      }

      kill_timeout = "15s"
    }
  }
}
