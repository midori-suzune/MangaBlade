package com.mangablade.backend.repositories;

import java.time.Instant;
import java.util.Optional;
import com.mangablade.backend.entities.AuthorRequest;
import com.mangablade.backend.enums.AuthorRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AuthorRequestRepository extends JpaRepository<AuthorRequest, Long> {
    Optional<AuthorRequest> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndStatus(Long userId, AuthorRequestStatus status);
    Page<AuthorRequest> findByStatus(AuthorRequestStatus status, Pageable pageable);

    @Query("""
            SELECT r FROM AuthorRequest r
            LEFT JOIN r.user u
            WHERE (:status IS NULL OR r.status = :status)
              AND (
                  :search IS NULL OR :search = ''
                  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(r.penName) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<AuthorRequest> findRequests(
            @Param("status") AuthorRequestStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByStatus(AuthorRequestStatus status);
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant startAt, Instant endAt);
}
