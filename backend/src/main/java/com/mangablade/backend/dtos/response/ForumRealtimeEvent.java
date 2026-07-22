package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumRealtimeEvent<T> {
    private String type;
    private T payload;
    private Instant occurredAt;

    public static <T> ForumRealtimeEvent<T> of(String type, T payload) {
        return ForumRealtimeEvent.<T>builder()
                .type(type)
                .payload(payload)
                .occurredAt(Instant.now())
                .build();
    }
}
