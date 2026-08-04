package com.ruralmart.backend.repository;

import com.ruralmart.backend.model.PendingRegistration;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, UUID> {

    long countByStatus(String status);
}
