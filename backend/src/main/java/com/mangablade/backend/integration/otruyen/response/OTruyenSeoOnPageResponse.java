package com.mangablade.backend.integration.otruyen.response;


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

    @JsonProperty("updated_time")
    private Instant updatedAt;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeoSchema {
        @JsonProperty("image")
        private String thumbUrl;
    }
}
