package com.mangablade.backend.integration.otruyen;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class OTruyenClientConfig {
        @Bean
        public RestClient getRestClient(RestClient.Builder builder) {
            return builder
                    .baseUrl("https://otruyenapi.com/v1/api")
                    .defaultHeader("Accept", "application/json")
                    .build();
        }
}
