package com.mangablade.backend.repositories;

import java.time.Instant;
import java.util.Optional;

import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.utils.querysql.UserQuery;
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
            value = UserQuery.FIND_BY_ROLE_WITH_FILTERS,
            countQuery = UserQuery.COUNT_BY_ROLE_WITH_FILTERS
    )
    Page<User> findByRoleWithFilters(@Param("role") UserRole role,
                                     @Param("search") String search,
                                     @Param("isBanned") Boolean isBanned,
                                     Pageable pageable);
}
