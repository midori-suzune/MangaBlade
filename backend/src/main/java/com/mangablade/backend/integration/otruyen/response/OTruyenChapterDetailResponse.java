package com.mangablade.backend.integration.otruyen.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OTruyenChapterDetailResponse {

    private Data data;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {

        @JsonProperty("domain_cdn")
        private String domainCdn;

        private Item item;
    }

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {

        @JsonProperty("chapter_path")
        private String chapterPath;

        @JsonProperty("chapter_image")
        private List<ChapterImage> chapterImages;
    }

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
