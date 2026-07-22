package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumCommentLikePayload {
    private Long threadId;
    private Long commentId;
    private Boolean liked;
    private Long likeCount;
}
