package com.ruralmart.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Mirrors the existing Supabase "profiles" table (id references auth.users).
 * Writable: the registration-approval flow inserts a new row here (role
 * "owner") for each newly created Auth user.
 */
@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    private UUID id;

    @Column(name = "role")
    private String role;

    @Column(name = "rural_mart_id")
    private UUID ruralMartId;

    @Column(name = "must_change_password")
    private boolean mustChangePassword;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
