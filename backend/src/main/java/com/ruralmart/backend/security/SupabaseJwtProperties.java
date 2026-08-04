package com.ruralmart.backend.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from supabase.jwt.* (SUPABASE_JWT_JWKS_URI / SUPABASE_JWT_SECRET env vars).
 * Prefer jwksUri (asymmetric signing keys) when your Supabase project has it enabled;
 * secret is the legacy shared HS256 JWT secret fallback.
 */
@ConfigurationProperties(prefix = "supabase.jwt")
public record SupabaseJwtProperties(String jwksUri, String secret) {
}
