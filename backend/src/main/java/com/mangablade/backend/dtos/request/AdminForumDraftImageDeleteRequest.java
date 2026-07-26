package com.mangablade.backend.dtos.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AdminForumDraftImageDeleteRequest {

    @NotEmpty
    private List<Long> ids;
}
