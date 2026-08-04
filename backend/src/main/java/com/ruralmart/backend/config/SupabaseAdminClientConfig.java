package com.ruralmart.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * RestClient pre-configured for Supabase's Auth Admin API
 * (https://&lt;project-ref&gt;.supabase.co/auth/v1/admin/...), authenticated with
 * the service-role key. Bypasses Row Level Security - only used server-side
 * for privileged writes (creating/deleting Auth users during approval).
 */
@Configuration
@EnableConfigurationProperties(SupabaseAdminProperties.class)
public class SupabaseAdminClientConfig {

    @Bean
    RestClient supabaseAdminRestClient(SupabaseAdminProperties properties) {
        if (properties.url() == null || properties.url().isBlank()) {
            throw new IllegalStateException("SUPABASE_URL must be set to call the Supabase Admin API");
        }
        if (properties.serviceRoleKey() == null || properties.serviceRoleKey().isBlank()) {
            throw new IllegalStateException("SUPABASE_SERVICE_ROLE_KEY must be set to call the Supabase Admin API");
        }

        // No timeout is configured by default here, which lets a slow/stalled
        // handshake hang the request indefinitely instead of failing fast -
        // see the matching note in JwtDecoderConfig.
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(20_000);
        requestFactory.setReadTimeout(20_000);

        String baseUrl = properties.url().replaceAll("/+$", "") + "/auth/v1/admin";
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader("apikey", properties.serviceRoleKey())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.serviceRoleKey())
                .build();
    }
}
