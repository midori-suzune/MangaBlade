package com.mangablade.backend.integration.otruyen.response;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OTruyenSeoOnPageResponse {

    private SeoSchema seoSchema;

    private Instant updatedAt;

    @JsonProperty("updated_time")
    public void setUpdatedAt(JsonNode updatedAt) {
        if (updatedAt == null || updatedAt.isNull()) {
            this.updatedAt = null;
            return;
        }

        if (updatedAt.isNumber()) {
            this.updatedAt = toInstant(updatedAt.asLong());
            return;
        }

        var value = updatedAt.asText();
        if (value == null || value.isBlank()) {
            this.updatedAt = null;
            return;
        }

        this.updatedAt = parseTextValue(value);
    }

    private Instant parseTextValue(String value) {
        try {
            return Instant.parse(value);
        } catch (RuntimeException ignored) {
            return toInstant(Long.parseLong(value));
        }
    }

    private Instant toInstant(long timestamp) {
        if (timestamp > 10_000_000_000L) {
            return Instant.ofEpochMilli(timestamp);
        }

        return Instant.ofEpochSecond(timestamp);
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeoSchema {
        @JsonProperty("image")
        private String thumbUrl;
    }
}
