package com.mangablade.backend.dtos.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TitleResponse {
    private Long id;
    private String name;
    private Integer requiredLevel;
    private String colorCode;
    private Boolean equipped;
}
