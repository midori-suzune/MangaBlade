package com.mangablade.backend.search;

import com.mangablade.backend.search.document.MangaSearchDocument;

import org.checkerframework.checker.nullness.qual.NonNull;
import org.elasticsearch.client.Request;
import org.elasticsearch.client.ResponseException;
import org.elasticsearch.client.RestClient;
import org.apache.http.entity.ContentType;
import org.apache.http.nio.entity.NStringEntity;
import org.apache.http.util.EntityUtils;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MangaSearchIndexInitializer implements ApplicationRunner {

    private final ElasticsearchOperations elasticsearchOperations;
    private final RestClient restClient;

    @Override
    public void run(ApplicationArguments args) {
        var indexOps = elasticsearchOperations.indexOps(MangaSearchDocument.class);

        if (indexOps.exists()) {
            return;
        }
        createMangaIndex();
    }

    private void createMangaIndex() {
        var request = getRequest();

        try {
            restClient.performRequest(request);
        } catch (ResponseException exception) {
            if (!isIndexAlreadyExists(exception)) {
                throw new IllegalStateException("Failed to create Elasticsearch manga index", exception);
            }
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to create Elasticsearch manga index", exception);
        }
    }

    private static @NonNull Request getRequest() {
        var request = new Request("PUT", "/manga");
        request.setEntity(new NStringEntity("""
                {
                  "mappings": {
                    "properties": {
                      "slug": { "type": "keyword" },
                      "title": { "type": "text" },
                      "authors": { "type": "text" },
                      "thumbUrl": { "type": "keyword" },
                      "latestChapterNumber": { "type": "keyword" },
                      "updatedAt": { "type": "date" }
                    }
                  }
                }
                """, ContentType.APPLICATION_JSON));
        return request;
    }

    private boolean isIndexAlreadyExists(ResponseException exception) {
        try {
            return exception.getResponse().getStatusLine().getStatusCode() == 400
                    && EntityUtils.toString(exception.getResponse().getEntity()).contains("resource_already_exists_exception");
        } catch (Exception ignored) {
            return false;
        }
    }
}
