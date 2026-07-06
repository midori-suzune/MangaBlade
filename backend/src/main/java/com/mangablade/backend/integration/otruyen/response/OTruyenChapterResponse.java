package com.mangablade.backend.integration.otruyen.response;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class OTruyenChapterResponse {

    @JsonProperty("server_name")
    private String serverName;

    @JsonProperty("server_data")
    @JsonSetter(nulls = Nulls.AS_EMPTY) // Convert null to an empty list.
    private List<ChapterData> severData = new ArrayList<>();

    @Getter
    @Setter
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
