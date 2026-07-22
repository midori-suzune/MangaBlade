package com.mangablade.backend.exceptions;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    USER_NOT_FOUND(404, "User not found", HttpStatus.NOT_FOUND),
    USER_EXISTED(400, "Account already exists", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(400, "Invalid password", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(400, "Invalid or already used password reset link", HttpStatus.BAD_REQUEST),
    EXPIRED_TOKEN(400, "Password reset link has expired", HttpStatus.BAD_REQUEST),
    MANGA_NOT_FOUND(404, "Manga not found", HttpStatus.NOT_FOUND),
    CHAPTER_NOT_FOUND(404, "Chapter not found", HttpStatus.NOT_FOUND),
    CHAPTER_REPORT_NOT_FOUND(404, "Chapter report not found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_FOUND(404, "Comment not found", HttpStatus.NOT_FOUND),
    INVALID_REQUEST(400, "Invalid request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    WRONG_PASSWORD(400, "Incorrect current password", HttpStatus.BAD_REQUEST),
    SAME_AS_CURRENT_PASSWORD(400, "New password cannot be the same as current password", HttpStatus.BAD_REQUEST),
    SOCIAL_USER_CANT_CHANGE_PASSWORD(400, "Google accounts do not support local password changes", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(400, "Email not verified. Please verify your email first.", HttpStatus.BAD_REQUEST),
    INVALID_OTP(400, "Invalid OTP code", HttpStatus.BAD_REQUEST),
    EXPIRED_OTP(400, "OTP code has expired", HttpStatus.BAD_REQUEST),
    AUTHOR_REQUEST_ALREADY_PENDING(400, "Bạn đã có đơn đăng ký đang chờ duyệt", HttpStatus.BAD_REQUEST),
    ALREADY_AUTHOR(400, "Bạn đã là tác giả", HttpStatus.BAD_REQUEST),
    AUTHOR_REQUEST_NOT_FOUND(404, "Không tìm thấy đơn đăng ký", HttpStatus.NOT_FOUND),
    INTERNAL_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;
}
