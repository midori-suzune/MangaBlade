package com.mangablade.backend.integration.otruyen.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
@AllArgsConstructor
public class OtruyenCategoryResponse {
    @JsonProperty("id")
    private String otruyenCategoryId ;

    @JsonProperty("name")
    private String name;

    @JsonProperty("slug")
    private String slug ;
}
