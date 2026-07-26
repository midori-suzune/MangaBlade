package com.mangablade.backend.dtos.request;

import com.mangablade.backend.enums.ForumThreadCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateForumThreadRequest {
    @NotNull
    private ForumThreadCategory category;

    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
    @Size(max = 10000)
    private String content;

    @Size(max = 5, message = "Tối đa 5 ảnh")
    private List<Long> attachmentIds;
}
