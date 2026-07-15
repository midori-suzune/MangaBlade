package com.mangablade.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "total_chapters_read", nullable = false)
    @Builder.Default
    private Integer totalChaptersRead = 0;

    @Column(name = "total_manga_followed", nullable = false)
    @Builder.Default
    private Integer totalMangaFollowed = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @PrimaryKeyJoinColumn(name = "user_id")
    private User user;
}
