package com.mangablade.backend.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorChapterCreateRequest {

    @NotBlank(message = "Số chương không được để trống!")
    @Size(max = 30, message = "Số chương tối đa 30 ký tự!")
    private String chapterNumber;

    @Size(max = 500, message = "Tiêu đề chương tối đa 500 ký tự!")
    private String title;

    private Integer chapterSort;
}
