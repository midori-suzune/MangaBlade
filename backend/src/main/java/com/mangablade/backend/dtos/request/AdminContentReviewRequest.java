package com.mangablade.backend.dtos.request;

import com.mangablade.backend.enums.ApprovalStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminContentReviewRequest {
    @NotNull
    private ApprovalStatus status;

    @Size(max = 1000)
    private String rejectReason;
}
