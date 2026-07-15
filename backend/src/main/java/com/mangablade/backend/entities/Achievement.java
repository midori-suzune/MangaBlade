package com.mangablade.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "achievements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @Column(name = "exp_reward", nullable = false)
    private Integer expReward;
}
