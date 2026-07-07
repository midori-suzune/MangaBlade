package com.mangablade.backend.exceptions;

import com.mangablade.backend.dtos.response.ApiResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(errorCode.getMessage())
                .payload(null)
                .error(errorCode.name())
                .fieldsErrors(null)
                .build();

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException exception) {
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(ErrorCode.INVALID_PASSWORD.getMessage())
                .payload(null)
                .error(ErrorCode.INVALID_PASSWORD.name())
                .fieldsErrors(null)
                .build();

        return ResponseEntity
                .status(ErrorCode.INVALID_PASSWORD.getHttpStatus())
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> fieldsErrors = new HashMap<>();

        exception.getBindingResult().getFieldErrors()
                .forEach(error -> fieldsErrors.put(error.getField(), error.getDefaultMessage()));

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message("validation failed")
                .payload(null)
                .error(null)
                .fieldsErrors(fieldsErrors)
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpectedException(Exception exception) {
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(ErrorCode.INTERNAL_ERROR.getMessage())
                .payload(null)
                .error(ErrorCode.INTERNAL_ERROR.name())
                .fieldsErrors(null)
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
