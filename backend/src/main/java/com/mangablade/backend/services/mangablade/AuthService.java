// package com.mangablade.backend.services.mangablade;

<<<<<<< HEAD
import com.mangablade.backend.configurations.JwtService;
import com.mangablade.backend.dtos.request.GoogleLoginRequest;
import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.request.ForgotPasswordRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.entities.PasswordResetToken;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.enums.AuthProvider;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.mapper.UserMapper;
import com.mangablade.backend.repositories.UserRepository;
import com.mangablade.backend.repositories.PasswordResetTokenRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
=======
// import com.mangablade.backend.configurations.JwtService;
// import com.mangablade.backend.dtos.request.LoginRequest;
// import com.mangablade.backend.dtos.request.RegisterRequest;
// import com.mangablade.backend.dtos.response.AuthResponse;
// import com.mangablade.backend.entities.User;
// import com.mangablade.backend.exceptions.AppException;
// import com.mangablade.backend.exceptions.ErrorCode;
// import com.mangablade.backend.mapper.UserMapper;
// import com.mangablade.backend.repositories.UserRepository;

// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import lombok.RequiredArgsConstructor;
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf

// @Service
// @RequiredArgsConstructor
// public class AuthService {

<<<<<<< HEAD
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
=======
//     private final AuthenticationManager authenticationManager;
//     private final UserService userService;
//     private final JwtService jwtService;
//     private final UserMapper userMapper;
//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf

    @Value("${google.client-id}")
    private String googleClientId;

//     public AuthResponse login(LoginRequest loginRequest) {
//         authenticationManager.authenticate(
//                 new UsernamePasswordAuthenticationToken(
//                         loginRequest.getEmail(),
//                         loginRequest.getPassword())
//         );
//         User user = userService.loadUserByUsername(loginRequest.getEmail());
//         String accessToken = jwtService.generateToken(user);

//         var userInfo = new AuthResponse.UserInfo(
//                 user.getId(),
//                 user.getUsername(),
//                 user.getEmail(),
//                 user.getRole()
//         );

//         return new AuthResponse(accessToken, "Bearer", userInfo);
//     }

//     public void register(RegisterRequest registerRequest) {
//         if (userRepository.existsByEmail(registerRequest.getEmail())
//                 || userRepository.existsByUsername(registerRequest.getUsername())) {
//             throw new AppException(ErrorCode.USER_EXISTED);
//         }

<<<<<<< HEAD
        var user = userMapper.toEntity(registerRequest);
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setAuthProvider(AuthProvider.LOCAL);
        userRepository.save(user);
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            // Call Google userinfo API with the access token
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(request.getCredential());
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    java.util.Map.class
            );

            java.util.Map<String, Object> userInfo = response.getBody();
            if (userInfo == null || !userInfo.containsKey("email")) {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String pictureUrl = (String) userInfo.get("picture");
            String googleId = (String) userInfo.get("sub");

            User user;
            if (userRepository.existsByEmail(email)) {
                user = (User) userService.loadUserByUsername(email);
                if (user.getAuthProvider() == AuthProvider.LOCAL) {
                    user.setProviderId(googleId);
                    if (pictureUrl != null && user.getAvatarUrl() == null) {
                        user.setAvatarUrl(pictureUrl);
                    }
                    userRepository.save(user);
                }
            } else {
                String username = email.substring(0, email.indexOf('@'));
                if (userRepository.existsByUsername(username)) {
                    username = username + java.util.UUID.randomUUID().toString().substring(0, 4);
                }

                user = User.builder()
                        .email(email)
                        .username(username)
                        .authProvider(AuthProvider.GOOGLE)
                        .providerId(googleId)
                        .avatarUrl(pictureUrl)
                        .role(UserRole.USER)
                        .createdAt(java.time.Instant.now())
                        .updatedAt(java.time.Instant.now())
                        .build();
                userRepository.save(user);
            }

            String token = jwtService.generateToken(user);
            return new AuthResponse(
                    token,
                    "Bearer",
                    new AuthResponse.UserInfo(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole()
                    )
            );
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
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

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (user.getAuthProvider() == AuthProvider.GOOGLE && user.getPasswordHash() == null) {
            throw new AppException(ErrorCode.SOCIAL_USER_CANT_CHANGE_PASSWORD);
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }

        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        dbUser.setPasswordHash(passwordEncoder.encode(newPassword));
        dbUser.setPasswordChangedAt(Instant.now());
        userRepository.save(dbUser);
    }
}
=======
//         var user = userMapper.toEntity(registerRequest);
//         user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
//         userRepository.save(user);
//     }
// }
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf
