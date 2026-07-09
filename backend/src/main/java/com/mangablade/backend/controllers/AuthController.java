package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.request.ForgotPasswordRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.services.mangablade.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Login successful")
                        .payload(authService.login(request))
                        .build()
        );
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request){
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Registration successful")
                        .payload(null)
                        .error(null)
                        .fieldsErrors(null)
                        .build()
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request){
        authService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Link đặt lại mật khẩu đã được gửi qua email")
                        .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request){
        authService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Mật khẩu đã được cập nhật thành công")
                        .build()
        );
    }
}
