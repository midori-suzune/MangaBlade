package com.mangablade.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "titles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Title {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "required_level", nullable = false)
    private Integer requiredLevel;

    @Column(name = "color_code", length = 20)
    private String colorCode;
}
