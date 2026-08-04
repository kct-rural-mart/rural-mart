package com.ruralmart.backend.security;

import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestTemplate;

/**
 * Builds the JwtDecoder used by the OAuth2 resource server filter chain to verify
 * incoming Supabase-issued access tokens. JWKS (asymmetric) is preferred when
 * configured; falls back to the legacy shared HMAC secret otherwise.
 */
@Configuration
@EnableConfigurationProperties(SupabaseJwtProperties.class)
public class JwtDecoderConfig {

    @Bean
    JwtDecoder jwtDecoder(SupabaseJwtProperties properties) {
        String jwksUri = properties.jwksUri();
        if (jwksUri != null && !jwksUri.isBlank()) {
            // Supabase signs with ES256; NimbusJwtDecoder defaults to RS256-only,
            // which silently rejects every genuine token as "invalid" otherwise.
            //
            // The default JWKS-fetch timeout is too short for the first HTTPS
            // handshake right after JVM startup (slow SecureRandom/TLS init on
            // some Windows hosts), which intermittently throws a Read timed out
            // even though the endpoint itself responds instantly - widen it.
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(20_000);
            requestFactory.setReadTimeout(20_000);

            return NimbusJwtDecoder.withJwkSetUri(jwksUri)
                    .jwsAlgorithm(SignatureAlgorithm.ES256)
                    .restOperations(new RestTemplate(requestFactory))
                    .build();
        }

        String secret = properties.secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "Set either supabase.jwt.jwks-uri or supabase.jwt.secret "
                            + "(SUPABASE_JWT_JWKS_URI / SUPABASE_JWT_SECRET) before starting the app.");
        }

        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
