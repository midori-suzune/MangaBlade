package com.mangablade.backend.entities;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class MangaAuthorId implements Serializable {
    private Long mangaId;
    private Long authorId;
}
