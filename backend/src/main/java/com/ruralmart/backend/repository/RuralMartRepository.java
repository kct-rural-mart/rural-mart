package com.ruralmart.backend.repository;

import com.ruralmart.backend.model.RuralMart;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RuralMartRepository extends JpaRepository<RuralMart, UUID> {
}
