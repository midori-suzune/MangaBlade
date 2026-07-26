package com.mangablade.backend.dtos.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminForumDraftImageListResponse {

    private PageResponse<AdminForumDraftImageResponse> images;
    private long totalCount;
    private long totalSizeBytes;
}
