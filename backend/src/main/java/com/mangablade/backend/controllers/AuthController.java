package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.LoginRequest;
import com.mangablade.backend.dtos.request.RegisterRequest;
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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        return  ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request){
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("success")
                        .payload(null)
                        .error(null)
                        .fieldsErrors(null)
                        .build()
        );
    }
}
