package com.ruralmart.backend.repository;

import com.ruralmart.backend.model.Profile;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
}
