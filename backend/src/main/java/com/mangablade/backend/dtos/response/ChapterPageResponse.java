package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


public interface ChapterPageResponse {
     String getMangaTitle() ;
     String getChapterNumber() ;
     String getImageUrl();
}
