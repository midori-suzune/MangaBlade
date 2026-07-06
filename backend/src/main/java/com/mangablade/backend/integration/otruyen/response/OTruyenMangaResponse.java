package com.mangablade.backend.integration.otruyen.response;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true) // ignore unnecessary field
public class OTruyenMangaResponse {

    private String status;
    private Data data ;

    @Getter
    @NoArgsConstructor
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data{
        private Item item ;
    }

    @Setter
    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item{
        @JsonProperty("_id")
        private String otruyenMangaId ;

        private String name;
        private String slug ;

        @JsonProperty("content")
        private String description;

        @JsonProperty("origin_name")
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        private List<String> originName = new ArrayList<>();

        private String status ;

        @JsonProperty("thumb_url")
        private String thumbUrl;

        private Instant updatedAt;

        @JsonProperty("author")
        @JsonSetter(nulls = Nulls.AS_EMPTY) // Convert null to an empty list.
        private List<String> authors = new ArrayList<>();

        @JsonProperty("chapters")
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        private List<OTruyenChapterResponse> chapters = new ArrayList<>();

        @JsonProperty("category")
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        private List<OtruyenCategoryResponse> categories = new ArrayList<>();

    }




}
