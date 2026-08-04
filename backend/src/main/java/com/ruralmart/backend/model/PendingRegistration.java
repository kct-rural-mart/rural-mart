package com.ruralmart.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Mirrors the existing Supabase "pending_registrations" table. Writable (unlike
 * Profile): the approval flow flips status from "pending" to "approved".
 */
@Entity
@Table(name = "pending_registrations")
@Getter
@Setter
@NoArgsConstructor
public class PendingRegistration {

    @Id
    private UUID id;

    @Column(name = "mart_name")
    private String martName;

    @Column(name = "entrepreneur_name")
    private String entrepreneurName;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "district")
    private String district;

    @Column(name = "block")
    private String block;

    @Column(name = "village")
    private String village;

    @Column(name = "gps_lat")
    private Double gpsLat;

    @Column(name = "gps_lng")
    private Double gpsLng;

    @Column(name = "opening_date")
    private LocalDate openingDate;

    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "rejection_reason")
    private String rejectionReason;
}
