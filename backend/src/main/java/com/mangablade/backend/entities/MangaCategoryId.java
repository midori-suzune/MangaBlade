package com.mangablade.backend.entities;

import java.io.Serializable;

import lombok.*;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Data
public class MangaCategoryId implements Serializable {
    private Long mangaId;
    private Long categoryId;
}
