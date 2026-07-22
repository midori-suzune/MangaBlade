package com.mangablade.backend.dtos.request;

import com.mangablade.backend.enums.CommentReportReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentReportRequest {
    @NotNull(message = "Lý do báo cáo không được để trống")
    private CommentReportReason reason;
    private String description;
}
