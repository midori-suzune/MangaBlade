package com.mangablade.backend.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class CommentLikeId implements Serializable {
    private Long userId;
    private Long commentId;
}
