package com.mangablade.backend.dtos.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumAttachmentResponse {
    private Long id;
    private String url;
    private String mimeType;
    private Long fileSize;
    private Integer width;
    private Integer height;
}
