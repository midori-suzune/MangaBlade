package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class AdminForumDraftImageResponse {

    private Long id;
    private Long userId;
    private String username;
    private String objectKey;
    private String url;
    private String mimeType;
    private Long fileSize;
    private Instant createdAt;
}
