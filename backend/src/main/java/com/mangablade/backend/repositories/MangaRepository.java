package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.MangaRankingProjection;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.enums.ApprovalStatus;
import com.mangablade.backend.enums.MangaSourceType;
import com.mangablade.backend.utils.querysql.MangaQuery;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface MangaRepository extends JpaRepository<Manga, Long> {
    Optional<Manga> findByOtruyenMangaId(String id);

    Optional<Manga> findBySlug(String slug);

    Optional<Manga> findBySlugAndDeletedAtIsNull(String slug);

    @Query("SELECT m FROM Manga m WHERE m.deletedAt IS NULL")
    List<Manga> findAllVisible();

    boolean existsBySlug(String slug);

    org.springframework.data.domain.Page<Manga> findByOwnerUserIdAndDeletedAtIsNull(Long ownerUserId, Pageable pageable);

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant startAt, Instant endAt);

    long countByStatus(String status);

    long countByDeletedAtIsNotNull();

    @EntityGraph(attributePaths = {"owner"})
    @Query(
            value = """
                    SELECT m
                    FROM Manga m
                    LEFT JOIN m.owner owner
                    WHERE (:search IS NULL
                        OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(m.slug) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.email) LIKE LOWER(CONCAT('%', :search, '%')))
                    AND (:sourceType IS NULL OR m.metadataSource = :sourceType)
                    AND (:hidden IS NULL
                        OR (:hidden = TRUE AND m.deletedAt IS NOT NULL)
                        OR (:hidden = FALSE AND m.deletedAt IS NULL))
                    AND (:status IS NULL OR m.status = :status)
                    """,
            countQuery = """
                    SELECT COUNT(m)
                    FROM Manga m
                    LEFT JOIN m.owner owner
                    WHERE (:search IS NULL
                        OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(m.slug) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.email) LIKE LOWER(CONCAT('%', :search, '%')))
                    AND (:sourceType IS NULL OR m.metadataSource = :sourceType)
                    AND (:hidden IS NULL
                        OR (:hidden = TRUE AND m.deletedAt IS NOT NULL)
                        OR (:hidden = FALSE AND m.deletedAt IS NULL))
                    AND (:status IS NULL OR m.status = :status)
                    """
    )
    Page<Manga> findAdminManga(
            @Param("search") String search,
            @Param("status") String status,
            @Param("sourceType") MangaSourceType sourceType,
            @Param("hidden") Boolean hidden,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"owner"})
    @Query(
            value = """
                    SELECT m
                    FROM Manga m
                    LEFT JOIN m.owner owner
                    WHERE m.deletedAt IS NULL
                    AND m.ownerUserId IS NOT NULL
                    AND (:status IS NULL OR m.approvalStatus = :status)
                    AND (:search IS NULL
                        OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(m.slug) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.email) LIKE LOWER(CONCAT('%', :search, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(m)
                    FROM Manga m
                    LEFT JOIN m.owner owner
                    WHERE m.deletedAt IS NULL
                    AND m.ownerUserId IS NOT NULL
                    AND (:status IS NULL OR m.approvalStatus = :status)
                    AND (:search IS NULL
                        OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(m.slug) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.username) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(owner.email) LIKE LOWER(CONCAT('%', :search, '%')))
                    """
    )
    Page<Manga> findModerationManga(
            @Param("status") ApprovalStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query(MangaQuery.FIND_TOP_RANKED_BY_FOLLOWS)
    List<MangaRankingProjection> findTopRankedByFollows();

    @Query(MangaQuery.FIND_TOP_RANKED_BY_VIEWS)
    List<MangaRankingProjection> findTopRankedByViews();

    @Query(MangaQuery.FIND_FOLLOWED_MANGA_BY_USER_ID)
    List<Manga> findFollowedMangaByUserId(@Param("userId") Long userId);

    @Query(MangaQuery.FIND_FILTERED_ORDER_BY_UPDATED_AT)
    List<Manga> findFilteredOrderByUpdatedAt(
            @Param("categorySlug") String categorySlug,
            @Param("authorKeyword") String authorKeyword,
            Pageable pageable
    );

    @Query(MangaQuery.FIND_FILTERED_ORDER_BY_CHAPTERS)
    List<Manga> findFilteredOrderByChapters(
            @Param("categorySlug") String categorySlug,
            @Param("authorKeyword") String authorKeyword,
            Pageable pageable
    );

    @Query(MangaQuery.FIND_FILTERED_ORDER_BY_FOLLOWS)
    List<Manga> findFilteredOrderByFollows(
            @Param("categorySlug") String categorySlug,
            @Param("authorKeyword") String authorKeyword,
            Pageable pageable
    );

    @Query(MangaQuery.FIND_FILTERED_ORDER_BY_COMMENTS)
    List<Manga> findFilteredOrderByComments(
            @Param("categorySlug") String categorySlug,
            @Param("authorKeyword") String authorKeyword,
            Pageable pageable
    );
}
