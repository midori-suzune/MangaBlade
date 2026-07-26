package com.mangablade.backend.dtos.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminForumDraftImageDeleteResponse {

    private int deletedCount;
    private long deletedSizeBytes;
}
