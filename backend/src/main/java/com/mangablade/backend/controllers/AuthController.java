package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.request.ForgotPasswordRequest;
import com.mangablade.backend.dtos.request.GoogleLoginRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.request.ChangePasswordRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.services.mangablade.AuthService;
import com.mangablade.backend.entities.User;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.sercurity.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

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

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa được chỉ định vai trò."))
                .getAuthority(); // Trả về dạng "ROLE_USER", "ROLE_ADMIN",...

        String jwt = tokenProvider.generateToken(username, role);
        return ResponseEntity.ok(new AuthResponse(jwt, username, role));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request){
        authService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Password reset link has been sent to your email")
                        .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request){
        authService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Password has been updated successfully")
                        .build()
        );
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Google login successful")
                        .payload(authService.googleLogin(request))
                        .build()
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user
    ) {
        authService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Password updated successfully")
                        .build()
        );
    }
}
