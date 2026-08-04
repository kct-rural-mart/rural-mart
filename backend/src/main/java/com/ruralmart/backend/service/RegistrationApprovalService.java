package com.ruralmart.backend.service;

import com.ruralmart.backend.dto.RegistrationApprovalResponse;
import com.ruralmart.backend.model.PendingRegistration;
import com.ruralmart.backend.model.Profile;
import com.ruralmart.backend.model.RuralMart;
import com.ruralmart.backend.repository.PendingRegistrationRepository;
import com.ruralmart.backend.repository.ProfileRepository;
import com.ruralmart.backend.repository.RuralMartRepository;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Java port of supabase/functions/approve-registration/index.ts - see that file
 * for the original behavior this replicates. Left untouched as a fallback; this
 * is an additive Spring Boot equivalent.
 */
@Service
public class RegistrationApprovalService {

    private static final Logger log = LoggerFactory.getLogger(RegistrationApprovalService.class);

    private static final String PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final int PASSWORD_LENGTH = 12;

    private final ProfileRepository profileRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final RuralMartRepository ruralMartRepository;
    private final SupabaseAdminClient supabaseAdminClient;
    private final SecureRandom secureRandom = new SecureRandom();

    // Self-injected proxy so the @Transactional method below runs through Spring's
    // transaction advice - a direct `this.persistApproval(...)` call would bypass it.
    private final RegistrationApprovalService self;

    public RegistrationApprovalService(
            ProfileRepository profileRepository,
            PendingRegistrationRepository pendingRegistrationRepository,
            RuralMartRepository ruralMartRepository,
            SupabaseAdminClient supabaseAdminClient,
            @Lazy RegistrationApprovalService self) {
        this.profileRepository = profileRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.ruralMartRepository = ruralMartRepository;
        this.supabaseAdminClient = supabaseAdminClient;
        this.self = self;
    }

    public RegistrationApprovalResponse approve(UUID registrationId, UUID callerId) {
        log.info("Approval requested for registration {} by caller {}", registrationId, callerId);
        requireAdmin(callerId);

        PendingRegistration registration = pendingRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        if (!"pending".equals(registration.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Registration is already " + registration.getStatus());
        }

        String username = generateReferenceCode();
        String tempPassword = generateTempPassword();

        UUID newUserId = supabaseAdminClient.createUser(
                registration.getEmail(),
                tempPassword,
                Map.of("username", username, "mart_name", registration.getMartName()));

        try {
            RuralMart mart = self.persistApproval(registration, newUserId, username);
            return RegistrationApprovalResponse.of(
                    mart.getId(), newUserId, registration.getEmail(), username, tempPassword);
        } catch (RuntimeException e) {
            log.error("Approval of registration {} failed after auth user {} was created - rolling back",
                    registrationId, newUserId, e);
            supabaseAdminClient.deleteUser(newUserId);
            throw e;
        }
    }

    @Transactional
    protected RuralMart persistApproval(PendingRegistration registration, UUID ownerId, String referenceCode) {
        RuralMart mart = new RuralMart();
        mart.setRegistrationId(registration.getId());
        mart.setOwnerId(ownerId);
        mart.setReferenceCode(referenceCode);
        mart.setMartName(registration.getMartName());
        mart.setEntrepreneurName(registration.getEntrepreneurName());
        mart.setMobileNumber(registration.getMobileNumber());
        mart.setEmail(registration.getEmail());
        mart.setDistrict(registration.getDistrict());
        mart.setBlock(registration.getBlock());
        mart.setVillage(registration.getVillage());
        mart.setGpsLat(registration.getGpsLat());
        mart.setGpsLng(registration.getGpsLng());
        mart.setOpeningDate(registration.getOpeningDate());
        mart.setAadhaarNumber(registration.getAadhaarNumber());
        mart.setGstNumber(registration.getGstNumber());
        mart.setPhotoUrl(registration.getPhotoUrl());
        mart = ruralMartRepository.save(mart);

        Profile profile = new Profile();
        profile.setId(ownerId);
        profile.setRole("owner");
        profile.setRuralMartId(mart.getId());
        profile.setMustChangePassword(true);
        profile.setCreatedAt(OffsetDateTime.now());
        profileRepository.save(profile);

        registration.setStatus("approved");
        pendingRegistrationRepository.save(registration);

        return mart;
    }

    private void requireAdmin(UUID callerId) {
        Profile callerProfile = profileRepository.findById(callerId).orElse(null);
        if (callerProfile == null) {
            log.warn("Admin check failed for caller {}: no profiles row for this id", callerId);
            throw new AccessDeniedException("Only admins can approve registrations");
        }
        if (!"admin".equals(callerProfile.getRole())) {
            log.warn("Admin check failed for caller {}: role is '{}', not 'admin'", callerId, callerProfile.getRole());
            throw new AccessDeniedException("Only admins can approve registrations");
        }
        log.debug("Admin check passed for caller {}", callerId);
    }

    private String generateReferenceCode() {
        long approvedCount = pendingRegistrationRepository.countByStatus("approved");
        return "RM" + String.format("%04d", approvedCount + 1);
    }

    private String generateTempPassword() {
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            password.append(PASSWORD_CHARS.charAt(secureRandom.nextInt(PASSWORD_CHARS.length())));
        }
        return password.toString();
    }
}
