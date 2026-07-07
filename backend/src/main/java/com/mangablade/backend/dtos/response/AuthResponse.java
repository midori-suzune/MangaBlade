package com.mangablade.backend.dtos.response;

import com.mangablade.backend.enums.UserRole;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserInfo user
) {
    public record UserInfo(
            Long id,
            String username,
            String email,
            UserRole role
    ) {
    }
}
