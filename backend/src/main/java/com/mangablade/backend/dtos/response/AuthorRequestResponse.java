package com.mangablade.backend.dtos.response;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorRequestResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String penName;
    private String phone;
    private String socialLink;
    private String status;
    private String rejectReason;
    private Instant createdAt;
    private Instant reviewedAt;
}
