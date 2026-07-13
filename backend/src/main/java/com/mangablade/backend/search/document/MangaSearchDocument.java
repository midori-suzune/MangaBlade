package com.mangablade.backend.search.document;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "manga", createIndex = false)
public class MangaSearchDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Keyword)
    private String slug;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private List<String> authors;

    @Field(type = FieldType.Keyword)
    private String thumbUrl;

    @Field(type = FieldType.Keyword)
    private String latestChapterNumber;

    @Field(type = FieldType.Date)
    private Instant updatedAt;
}
