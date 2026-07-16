package com.mangablade.backend.controllers;

import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.services.mangablade.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam("role") UserRole role,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "isBanned", required = false) Boolean isBanned,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        return ResponseEntity.ok(userService.getUsersPaging(role, search, isBanned, PageRequest.of(page, size)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        userService.deleteUser(id, currentUser.getId());
        return ResponseEntity.ok("Xóa người dùng thành công");
    }

    @PatchMapping("/{id}/toggle-ban")
    public ResponseEntity<User> toggleBan(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.toggleBanUser(id, currentUser.getId()));
    }
}
