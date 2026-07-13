package com.mangablade.backend.dtos.response;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryResponse {
    private String mangaSlug;
    private String mangaTitle;
    private String thumbUrl;
    private String chapterNumber;
    private Instant lastReadAt;
}
