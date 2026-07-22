package com.mangablade.backend.dtos.response;

import com.mangablade.backend.entities.CommentReport;
import com.mangablade.backend.enums.CommentReportReason;
import com.mangablade.backend.enums.CommentReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCommentReportResponse {
    private Long id;
    private Long commentId;
    private String commentContent;
    private Long commentAuthorId;
    private String commentAuthorUsername;
    private String mangaTitle;
    private String mangaSlug;
    private String chapterNumber;
    private String reporterUsername;
    private CommentReportReason reason;
    private String description;
    private CommentReportStatus status;
    private Instant createdAt;
    private Instant resolvedAt;
    private String resolvedByUsername;
    private String rejectReason;

    public static AdminCommentReportResponse from(CommentReport report) {
        String chapterNum = report.getComment().getChapter() != null ? report.getComment().getChapter().getChapterNumber() : null;
        return AdminCommentReportResponse.builder()
                .id(report.getId())
                .commentId(report.getComment().getId())
                .commentContent(report.getComment().getContent())
                .commentAuthorId(report.getComment().getUser() != null ? report.getComment().getUser().getId() : null)
                .commentAuthorUsername(report.getComment().getUser() != null ? report.getComment().getUser().getUsername() : "Unregistered")
                .mangaTitle(report.getComment().getManga() != null ? report.getComment().getManga().getTitle() : "")
                .mangaSlug(report.getComment().getManga() != null ? report.getComment().getManga().getSlug() : "")
                .chapterNumber(chapterNum)
                .reporterUsername(report.getReporter() != null ? report.getReporter().getUsername() : "")
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .resolvedByUsername(report.getResolvedBy() != null ? report.getResolvedBy().getUsername() : null)
                .rejectReason(report.getRejectReason())
                .build();
    }
}
