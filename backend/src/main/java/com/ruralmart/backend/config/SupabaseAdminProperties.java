package com.ruralmart.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from supabase.url / supabase.service-role-key (SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY env vars). Used to call the Supabase Auth Admin
 * REST API when approving a registration.
 */
@ConfigurationProperties(prefix = "supabase")
public record SupabaseAdminProperties(String url, String serviceRoleKey) {
}
