package com.mangablade.backend.integration.otruyen.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OTruyenChapterDetailResponse {

    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {

        @JsonProperty("domain_cdn")
        private String domainCdn;

        private Item item;
    }

    @Setter
    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {

        @JsonProperty("chapter_path")
        private String chapterPath;

        @JsonProperty("chapter_image")
        @JsonSetter(nulls = Nulls.AS_EMPTY) // Convert null to an empty list.
        private List<ChapterImage> chapterImages = new ArrayList<>();
    }

    @Setter
    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ChapterImage {

        @JsonProperty("image_page")
        private Integer pageNumber;

        @JsonProperty("image_file")
        private String imageFile;
    }
}
