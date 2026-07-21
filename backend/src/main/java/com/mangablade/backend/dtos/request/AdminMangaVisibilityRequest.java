package com.mangablade.backend.dtos.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminMangaVisibilityRequest {
    @Size(max = 1000)
    private String reason;
}
