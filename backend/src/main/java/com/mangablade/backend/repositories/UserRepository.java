package com.mangablade.backend.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mangablade.backend.entities.User;
<<<<<<< HEAD
import com.mangablade.backend.enums.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
    
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.role = :role " +
           "AND (:search IS NULL OR u.username LIKE %:search% OR u.email LIKE %:search%) " +
           "AND (:isBanned IS NULL OR u.isBanned = :isBanned)")
    Page<User> findByRoleWithFilters(@Param("role") UserRole role, 
                                     @Param("search") String search, 
                                     @Param("isBanned") Boolean isBanned, 
                                     Pageable pageable);
}
=======

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);
}
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf
