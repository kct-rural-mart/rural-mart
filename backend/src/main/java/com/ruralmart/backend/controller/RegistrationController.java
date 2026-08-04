package com.ruralmart.backend.controller;

import com.ruralmart.backend.dto.RegistrationApprovalResponse;
import com.ruralmart.backend.service.RegistrationApprovalService;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Spring Boot equivalent of supabase/functions/approve-registration/index.ts.
 * Admin-only enforcement happens in RegistrationApprovalService (looks up the
 * caller's profile role); SecurityConfig already requires a valid JWT for
 * every path under here - reaching the log line below at all confirms the
 * JWT passed signature/expiry validation, which rules out the token-validation
 * layer as the cause of any subsequent failure.
 */
@RestController
@RequestMapping("/api/admin/registrations")
public class RegistrationController {

    private static final Logger log = LoggerFactory.getLogger(RegistrationController.class);

    private final RegistrationApprovalService approvalService;

    public RegistrationController(RegistrationApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @PostMapping("/{id}/approve")
    public RegistrationApprovalResponse approve(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID callerId = UUID.fromString(jwt.getSubject());
        log.info("POST /api/admin/registrations/{}/approve - JWT validated OK, caller {}", id, callerId);
        return approvalService.approve(id, callerId);
    }
}
