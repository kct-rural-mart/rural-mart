package com.ruralmart.backend.config;

import tools.jackson.databind.ObjectMapper;
import com.ruralmart.backend.security.SupabaseJwtGrantedAuthoritiesConverter;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

/**
 * Stateless resource-server setup: every request must carry a valid Supabase-issued
 * JWT in the Authorization header, except the health check. JWT signature/expiry
 * verification is handled by Spring's OAuth2 resource server support (JwtDecoder
 * bean in JwtDecoderConfig); this class only wires the filter chain + which claim
 * becomes the Spring authority.
 *
 * The custom entry point / access-denied handler below exist purely for debugging:
 * Spring's defaults return a 401/403 with an empty body, which makes "wrong token"
 * vs "valid token, wrong role" indistinguishable from the client and invisible in
 * the server log. These log the reason and return it in the JSON body instead.
 */
@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new SupabaseJwtGrantedAuthoritiesConverter());
        return converter;
    }

    @Bean
    AuthenticationEntryPoint authenticationEntryPoint(ObjectMapper objectMapper) {
        return (request, response, authException) -> {
            boolean hasAuthHeader = request.getHeader(HttpHeaders.AUTHORIZATION) != null;
            log.warn("401 on {} {} - Authorization header present: {} - reason: {}",
                    request.getMethod(), request.getRequestURI(), hasAuthHeader, authException.getMessage(),
                    authException);
            writeJsonError(response, objectMapper, HttpStatus.UNAUTHORIZED, "unauthorized",
                    authException.getMessage());
        };
    }

    @Bean
    AccessDeniedHandler accessDeniedHandler(ObjectMapper objectMapper) {
        return (request, response, accessDeniedException) -> {
            log.warn("403 on {} {} - reason: {}",
                    request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());
            writeJsonError(response, objectMapper, HttpStatus.FORBIDDEN, "forbidden",
                    accessDeniedException.getMessage());
        };
    }

    private static void writeJsonError(
            HttpServletResponse response,
            ObjectMapper objectMapper,
            HttpStatus status,
            String error,
            String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "error", error,
                "message", message == null ? status.getReasonPhrase() : message));
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            AuthenticationEntryPoint authenticationEntryPoint,
            AccessDeniedHandler accessDeniedHandler)
            throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));

        return http.build();
    }
}
