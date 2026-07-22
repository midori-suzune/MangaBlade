package com.mangablade.backend.dtos.request;

import com.mangablade.backend.enums.CommentReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCommentReportReviewRequest {
    @NotNull(message = "Trạng thái xử lý không được để trống")
    private CommentReportStatus status;
    private Boolean deleteComment;
    private Boolean banUser;
    private String rejectReason;
}
