package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.request.ForgotPasswordRequest;
import com.mangablade.backend.dtos.request.GoogleLoginRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.request.ChangePasswordRequest;
import com.mangablade.backend.dtos.request.VerifyOtpRequest;
import com.mangablade.backend.dtos.request.ResendOtpRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.services.mangablade.AuthService;
import com.mangablade.backend.entities.User;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ){
        AuthResponse auth = authService.login(request);

        // rememberMe=true → persistent cookie (30 days), false → session cookie (dies on browser close)
        long cookieMaxAge = request.isRememberMe() ? 60L * 60 * 24 * 30 : -1;

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, buildAccessTokenCookie(auth.getAccessToken(), servletRequest, cookieMaxAge).toString())
                .body(ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Đăng nhập thành công")
                        .payload(auth)
                        .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest servletRequest){
        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, buildAccessTokenCookie("", servletRequest, 0).toString())
                .body(ApiResponse.<Void>builder()
                        .success(true)
                        .message("Đăng xuất thành công")
                        .build());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request){
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Đăng ký tài khoản thành công")
                        .payload(null)
                        .error(null)
                        .fieldsErrors(null)
                        .build()
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Xác thực email thành công")
                        .build()
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request.getEmail());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Đã gửi lại mã xác nhận OTP thành công")
                        .build()
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request){
        authService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn")
                        .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request){
        authService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Cập nhật mật khẩu mới thành công")
                        .build()
        );
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest servletRequest
    ) {
        AuthResponse auth = authService.googleLogin(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAccessTokenCookie(auth.getAccessToken(), servletRequest, 60 * 60 * 24 * 7).toString())
                .body(ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Đăng nhập bằng Google thành công")
                        .payload(auth)
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
                        .message("Đổi mật khẩu thành công")
                        .build()
        );
    }

    private ResponseCookie buildAccessTokenCookie(String token, HttpServletRequest request, long maxAge) {
        String host = request.getServerName();
        boolean isLocalhost = "localhost".equals(host) || "127.0.0.1".equals(host);

        ResponseCookie.ResponseCookieBuilder cookie = ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(!isLocalhost)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge);

        if (!isLocalhost) {
            cookie.domain(".mangablade.online");
        }

        return cookie.build();
    }
}
