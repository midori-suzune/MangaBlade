package com.mangablade.backend.integration.otruyen.response;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.hibernate.cache.spi.support.AbstractReadWriteAccess;

import java.time.Instant;
import java.util.List;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
@JsonIgnoreProperties(ignoreUnknown = true) // ignore unnecessary field
public class OTruyenMangaResponse {

    private String status;
    private Data data ;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data{
        private Item item ;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item{
        @JsonProperty("_id")
        private String id ;

        private String name;
        private String slug ;

        @JsonProperty("content")
        private String description;

        @JsonProperty("origin_name")
        private List<String> originName ;

        private String status ;

        @JsonProperty("thumb_url")
        private String thumblUrl ;

        private Instant updatedAt;

    }


}
