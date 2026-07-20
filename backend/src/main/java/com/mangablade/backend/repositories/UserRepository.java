package com.mangablade.backend.repositories;

import java.time.Instant;
import java.util.Optional;

import com.mangablade.backend.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mangablade.backend.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant startAt, Instant endAt);

    @Query(
            value = "SELECT u FROM User u LEFT JOIN FETCH u.activeTitle WHERE (:role IS NULL OR u.role = :role) " +
                    "AND (:search IS NULL OR u.username LIKE %:search% OR u.email LIKE %:search%) " +
                    "AND (:isBanned IS NULL OR u.isBanned = :isBanned)",
            countQuery = "SELECT COUNT(u) FROM User u WHERE (:role IS NULL OR u.role = :role) " +
                    "AND (:search IS NULL OR u.username LIKE %:search% OR u.email LIKE %:search%) " +
                    "AND (:isBanned IS NULL OR u.isBanned = :isBanned)"
    )
    Page<User> findByRoleWithFilters(@Param("role") UserRole role,
                                     @Param("search") String search,
                                     @Param("isBanned") Boolean isBanned,
                                     Pageable pageable);
}
