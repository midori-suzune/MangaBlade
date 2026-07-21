package com.mangablade.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mangablade.backend.entities.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
