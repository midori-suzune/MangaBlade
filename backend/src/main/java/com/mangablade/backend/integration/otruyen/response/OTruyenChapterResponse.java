package com.mangablade.backend.integration.otruyen.response;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OTruyenChapterResponse {

    @JsonProperty("server_name")
    private String serverName;

    @JsonProperty("server_data")
    private List<ChapterData> severData;

    @Getter
    @NoArgsConstructor
    public static class ChapterData {

        @JsonProperty("chapter_name")
        private String chapterNumber;
        @JsonProperty("chapter_api_data")
        private String chapterApiUrl;
        @JsonProperty("chapter_title")
        private String title;

    }
}
