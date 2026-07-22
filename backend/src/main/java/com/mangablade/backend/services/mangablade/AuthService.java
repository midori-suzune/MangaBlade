package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.configurations.JwtService;
import com.mangablade.backend.dtos.request.GoogleLoginRequest;
import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.request.ForgotPasswordRequest;
import com.mangablade.backend.dtos.request.ResetPasswordRequest;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.entities.PasswordResetToken;
import com.mangablade.backend.entities.EmailVerificationToken;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.enums.AuthProvider;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.mapper.UserMapper;
import com.mangablade.backend.repositories.UserRepository;
import com.mangablade.backend.repositories.PasswordResetTokenRepository;
import com.mangablade.backend.repositories.EmailVerificationTokenRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.UUID;
import java.util.Random;
import java.util.Map;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
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
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword())
        );
        User user = userService.loadUserByUsername(loginRequest.getEmail());

        if (user.getAuthProvider() == AuthProvider.LOCAL && user.getEmailVerifiedAt() == null) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        String accessToken = jwtService.generateToken(user);

        var userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getEmailVerifiedAt()
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
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerifiedAt(null);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        sendAndSaveVerificationOtp(user);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    private void sendAndSaveVerificationOtp(User user) {
        String otp = generateOtp();
        String hashedOtp = sha256(otp);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .userId(user.getId())
                .tokenHash(hashedOtp)
                .expiresAt(Instant.now().plusSeconds(300))
                .createdAt(Instant.now())
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        try {
            emailService.sendVerificationOtpMail(user.getEmail(), user.getUsername(), otp);
            System.out.println("\n=== [EMAIL OTP SENT SUCCESS] ===");
            System.out.println("OTP verification email sent successfully to: " + user.getEmail());
            System.out.println("================================\n");
        } catch (Exception e) {
            System.err.println("\n[MAIL OTP ERROR] Failed to send email: " + e.getMessage());
            System.out.println("=== [FALLBACK OTP PRINTED TO CONSOLE] ===");
            System.out.println("Recipient email: " + user.getEmail());
            System.out.println("OTP Code: " + otp);
            System.out.println("=========================================\n");
        }
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getEmailVerifiedAt() != null) {
            return;
        }

        String hashedOtp = sha256(otp);
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenHash(hashedOtp)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (verificationToken.getUsedAt() != null) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }
        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.EXPIRED_OTP);
        }
        if (!verificationToken.getUserId().equals(user.getId())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        user.setEmailVerifiedAt(Instant.now());
        userRepository.save(user);

        verificationToken.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(verificationToken);
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getEmailVerifiedAt() != null) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        sendAndSaveVerificationOtp(user);
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(request.getCredential());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> userInfo = response.getBody();
            if (userInfo == null || !userInfo.containsKey("email")) {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            String email = (String) userInfo.get("email");
            String pictureUrl = (String) userInfo.get("picture");
            String googleId = (String) userInfo.get("sub");

            User user;
            if (userRepository.existsByEmail(email)) {
                user = (User) userService.loadUserByUsername(email);
                boolean needsSave = false;
                if (user.getAuthProvider() == AuthProvider.LOCAL) {
                    user.setProviderId(googleId);
                    user.setEmailVerifiedAt(Instant.now());
                    needsSave = true;
                }
                if (user.getEmailVerifiedAt() == null) {
                    user.setEmailVerifiedAt(Instant.now());
                    needsSave = true;
                }
                if (pictureUrl != null && user.getAvatarUrl() == null) {
                    user.setAvatarUrl(pictureUrl);
                    needsSave = true;
                }
                if (needsSave) {
                    userRepository.save(user);
                }
            } else {
                String username = email.substring(0, email.indexOf('@'));
                if (userRepository.existsByUsername(username)) {
                    username = username + UUID.randomUUID().toString().substring(0, 4);
                }

                user = User.builder()
                        .email(email)
                        .username(username)
                        .authProvider(AuthProvider.GOOGLE)
                        .providerId(googleId)
                        .avatarUrl(pictureUrl)
                        .role(UserRole.USER)
                        .emailVerifiedAt(Instant.now())
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
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
                            user.getRole(),
                            user.getEmailVerifiedAt()
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
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainText.getBytes(StandardCharsets.UTF_8));
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

        if (currentPassword.equals(newPassword) || (user.getPasswordHash() != null && passwordEncoder.matches(newPassword, user.getPasswordHash()))) {
            throw new AppException(ErrorCode.SAME_AS_CURRENT_PASSWORD);
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
