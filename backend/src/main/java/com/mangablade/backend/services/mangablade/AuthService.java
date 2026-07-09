package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.configurations.JwtService;
import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.request.ForgotPasswordRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.entities.PasswordResetToken;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.mapper.UserMapper;
import com.mangablade.backend.repositories.UserRepository;
import com.mangablade.backend.repositories.PasswordResetTokenRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword())
        );
        User user = userService.loadUserByUsername(loginRequest.getEmail());
        String accessToken = jwtService.generateToken(user);

        var userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(accessToken, "Bearer", userInfo);
    }

    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())
                || userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        var user = userMapper.toEntity(registerRequest);
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        userRepository.save(user);
    }

    private String sha256(String plainText) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainText.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String plainToken = UUID.randomUUID().toString();
        String hashedToken = sha256(plainToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(hashedToken)
                .expiresAt(Instant.now().plusSeconds(900))
                .createdAt(Instant.now())
                .build();

        passwordResetTokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + plainToken;
        try {
            emailService.sendResetPasswordMail(user.getEmail(), user.getUsername(), resetLink);
            System.out.println("\n=== [EMAIL SENT SUCCESS] ===");
            System.out.println("Reset email sent successfully to: " + user.getEmail());
            System.out.println("============================\n");
        } catch (Exception e) {
            System.err.println("\n[MAIL ERROR] Failed to send email: " + e.getMessage());
            System.out.println("=== [FALLBACK LINK PRINTED TO CONSOLE] ===");
            System.out.println("Recipient email: " + user.getEmail());
            System.out.println("Password reset link: " + resetLink);
            System.out.println("====================================================\n");
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        String hashedToken = sha256(request.getToken());
        var resetToken = passwordResetTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (resetToken.getUsedAt() != null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.EXPIRED_TOKEN);
        }

        var user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);
    }
}
