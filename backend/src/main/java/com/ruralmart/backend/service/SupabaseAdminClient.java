package com.ruralmart.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Thin wrapper over Supabase's Auth Admin REST API
 * (POST/DELETE /auth/v1/admin/users) - the same operations the frontend's
 * Edge Function performs via the supabase-js admin client, done here with
 * Spring's RestClient instead.
 */
@Component
public class SupabaseAdminClient {

    private static final Logger log = LoggerFactory.getLogger(SupabaseAdminClient.class);

    private final RestClient restClient;

    public SupabaseAdminClient(RestClient supabaseAdminRestClient) {
        this.restClient = supabaseAdminRestClient;
    }

    public UUID createUser(String email, String password, Map<String, Object> userMetadata) {
        Map<String, Object> body = Map.of(
                "email", email,
                "password", password,
                "email_confirm", true,
                "user_metadata", userMetadata);

        try {
            CreateUserResponse response = restClient.post()
                    .uri("/users")
                    .body(body)
                    .retrieve()
                    .body(CreateUserResponse.class);

            if (response == null || response.id() == null) {
                throw new SupabaseAdminException("Supabase Admin API returned no user id");
            }
            return response.id();
        } catch (RestClientResponseException e) {
            throw new SupabaseAdminException(
                    "Failed to create auth user: " + e.getResponseBodyAsString(), e);
        }
    }

    /** Best-effort compensating delete; failures are logged, not thrown, so they never mask the original error. */
    public void deleteUser(UUID userId) {
        try {
            restClient.delete().uri("/users/{id}", userId).retrieve().toBodilessEntity();
        } catch (RestClientResponseException e) {
            log.error("Failed to roll back auth user {} after a partial approval failure: {}",
                    userId, e.getResponseBodyAsString(), e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CreateUserResponse(UUID id) {
    }

    public static class SupabaseAdminException extends RuntimeException {
        public SupabaseAdminException(String message) {
            super(message);
        }

        public SupabaseAdminException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
