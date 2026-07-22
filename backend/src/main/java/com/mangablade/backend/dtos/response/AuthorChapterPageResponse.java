package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorChapterPageResponse {
    private Long id;
    private Integer pageNumber;
    private String imageUrl;
}
