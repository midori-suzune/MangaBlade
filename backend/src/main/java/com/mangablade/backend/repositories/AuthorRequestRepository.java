package com.mangablade.backend.repositories;

import java.time.Instant;
import java.util.Optional;
import com.mangablade.backend.entities.AuthorRequest;
import com.mangablade.backend.enums.AuthorRequestStatus;
import com.mangablade.backend.utils.querysql.AuthorRequestQuery;
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

    @Query(AuthorRequestQuery.FIND_REQUESTS)
    Page<AuthorRequest> findRequests(
            @Param("status") AuthorRequestStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByStatus(AuthorRequestStatus status);
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant startAt, Instant endAt);
}
