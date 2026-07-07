package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.configurations.JwtService;
import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.dtos.response.AuthResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.mapper.UserMapper;
import com.mangablade.backend.repositories.UserRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
}
