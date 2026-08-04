package com.ruralmart.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Mirrors the existing Supabase "rural_marts" table. */
@Entity
@Table(name = "rural_marts")
@Getter
@Setter
@NoArgsConstructor
public class RuralMart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "registration_id")
    private UUID registrationId;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "reference_code")
    private String referenceCode;

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
}
