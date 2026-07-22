package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.request.AdminCommentReportReviewRequest;
import com.mangablade.backend.dtos.request.CreateCommentReportRequest;
import com.mangablade.backend.dtos.response.AdminCommentReportResponse;
import com.mangablade.backend.entities.CommentReport;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.CommentReportReason;
import com.mangablade.backend.enums.CommentReportStatus;
import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.CommentRepository;
import com.mangablade.backend.repositories.CommentReportRepository;
import com.mangablade.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentReportService {
    private final CommentReportRepository commentReportRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public void create(Long commentId, CreateCommentReportRequest request, User reporter) {
        if (reporter == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        User dbReporter = userRepository.findById(reporter.getId()).orElse(reporter);
        var comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        if (comment.getStatus() == CommentStatus.DELETED) {
            throw new AppException(ErrorCode.COMMENT_NOT_FOUND);
        }

        if (comment.getUserId().equals(dbReporter.getId())) {
            throw new AppException(ErrorCode.CANNOT_REPORT_OWN_COMMENT);
        }

        var report = CommentReport.builder()
                .comment(comment)
                .reporter(dbReporter)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(CommentReportStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        commentReportRepository.save(report);
    }

    public Page<AdminCommentReportResponse> findReports(CommentReportStatus status, CommentReportReason reason, String search, Pageable pageable) {
        return commentReportRepository.findReports(status, reason, search, pageable)
                .map(AdminCommentReportResponse::from);
    }

    @Transactional
    public AdminCommentReportResponse review(Long reportId, AdminCommentReportReviewRequest request, User admin) {
        var report = commentReportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        Instant now = Instant.now();
        report.setStatus(request.getStatus());
        report.setResolvedAt(now);
        report.setResolvedBy(admin);
        report.setRejectReason(request.getRejectReason());

        if (request.getStatus() == CommentReportStatus.RESOLVED) {
            var comment = report.getComment();
            if (Boolean.TRUE.equals(request.getDeleteComment()) || Boolean.TRUE.equals(request.getBanUser())) {
                if (comment != null) {
                    comment.setStatus(CommentStatus.DELETED);
                    comment.setDeletedAt(now);
                    comment.setUpdatedAt(now);
                }
            }
            if (Boolean.TRUE.equals(request.getBanUser())) {
                if (comment != null && comment.getUser() != null) {
                    comment.getUser().setBanned(true);
                }
            }
        }

        return AdminCommentReportResponse.from(report);
    }
}
