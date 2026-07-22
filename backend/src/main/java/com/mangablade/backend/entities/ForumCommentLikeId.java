package com.mangablade.backend.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class ForumCommentLikeId implements Serializable {
    private Long userId;
    private Long commentId;
}
