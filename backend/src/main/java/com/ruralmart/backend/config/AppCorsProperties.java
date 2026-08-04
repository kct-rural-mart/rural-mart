package com.ruralmart.backend.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Bound from app.cors.allowed-origins (APP_CORS_ALLOWED_ORIGINS env var, comma-separated). */
@ConfigurationProperties(prefix = "app.cors")
public record AppCorsProperties(List<String> allowedOrigins) {
}
