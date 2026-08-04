package com.ruralmart.backend.dto;

import java.util.UUID;

/** Mirrors the JSON shape the approve-registration Edge Function currently returns. */
public record RegistrationApprovalResponse(
        boolean success,
        UUID martId,
        UUID ownerId,
        String email,
        String username,
        String tempPassword,
        boolean emailSent,
        String note) {

    private static final String EMAIL_NOTE =
            "Email sending is not configured yet - credentials are logged server-side and returned here for testing only.";

    public static RegistrationApprovalResponse of(
            UUID martId, UUID ownerId, String email, String username, String tempPassword) {
        return new RegistrationApprovalResponse(true, martId, ownerId, email, username, tempPassword, false, EMAIL_NOTE);
    }
}
