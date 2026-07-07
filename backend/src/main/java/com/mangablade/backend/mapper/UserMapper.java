package com.mangablade.backend.mapper;

import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.entities.User;

import org.springframework.stereotype.Component;

import java.time.Instant;

import lombok.NoArgsConstructor;

@Component
@NoArgsConstructor
public class UserMapper {

    public User toEntity(RegisterRequest request){
        return User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }
}
