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
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    WRONG_PASSWORD(400, "Incorrect current password", HttpStatus.BAD_REQUEST),
    SOCIAL_USER_CANT_CHANGE_PASSWORD(400, "Google accounts do not support local password changes", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;
}
