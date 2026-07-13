package com.mangablade.backend.configurations;

import org.apache.http.Header;
import org.apache.http.message.BasicHeader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.elasticsearch.RestClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public RestClientBuilderCustomizer elasticsearchApiKeyCustomizer(
            @Value("${ELASTICSEARCH_API_KEY:}") String apiKey
    ) {
        return builder -> {
            if (!apiKey.isBlank()) {
                builder.setDefaultHeaders(new Header[]{
                        new BasicHeader("Authorization", "ApiKey " + apiKey)
                });
            }
        };
    }
}
