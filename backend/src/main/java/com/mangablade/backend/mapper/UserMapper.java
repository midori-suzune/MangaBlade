package com.mangablade.backend.mapper;

import java.time.Instant;

import org.springframework.stereotype.Component;

import com.mangablade.backend.dtos.request.RegisterRequest;
import com.mangablade.backend.entities.User;

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
