package com.mangablade.backend.mapper;

import java.time.LocalDateTime;

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
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
