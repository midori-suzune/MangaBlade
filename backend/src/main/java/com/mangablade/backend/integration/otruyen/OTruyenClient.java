package com.mangablade.backend.integration.otruyen;


import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OTruyenClient {

    private final RestClient restClient;

    public OTruyenMangaResponse fetchApiMangaBySlug(String slug) {
        return restClient
                .get()
                .uri("/truyen-tranh/{slug}", slug)
                .retrieve() // sent request and receive response
                .body(OTruyenMangaResponse .class);         // convert JSON  to Object Class
    }

}
