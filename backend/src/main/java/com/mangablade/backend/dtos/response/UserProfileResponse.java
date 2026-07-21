package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String role;
    private Integer level;
    private Integer exp;
    private String activeTitle;
    private String activeTitleColor;
}
