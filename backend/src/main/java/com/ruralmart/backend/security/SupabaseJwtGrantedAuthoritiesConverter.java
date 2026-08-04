package com.ruralmart.backend.security;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Supabase's JWT "role" claim is the Postgres/PostgREST role (e.g. "authenticated",
 * "anon", "service_role") - NOT the application-level admin/owner role stored in the
 * "profiles" table. This converter only exposes that Postgres-level role as a Spring
 * authority. Resolving the real admin/owner role requires a lookup via
 * ProfileRepository keyed by the token's subject (user id); that lookup is
 * deliberately not wired up yet - see backend/README.md for what's deferred to a
 * later phase.
 */
public class SupabaseJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        String role = jwt.getClaimAsString("role");
        if (role == null || role.isBlank()) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase(Locale.ROOT)));
    }
}
