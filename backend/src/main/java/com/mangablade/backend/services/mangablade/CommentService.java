package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.request.CreateCommentRequest;
import com.mangablade.backend.dtos.response.CommentLikeResponse;
import com.mangablade.backend.dtos.response.MangaCommentResponse;
import com.mangablade.backend.dtos.response.RecentCommentResponse;
import com.mangablade.backend.entities.Comment;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.CommentLikeRepository;
import com.mangablade.backend.repositories.CommentRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final CommentRepository commentRepository;
    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final TaskService taskService;
    private final UserRepository userRepository;
    private final CommentLikeRepository commentLikeRepository;

    public List<RecentCommentResponse> findRecentDistinctUserComments() {
        return commentRepository.findRecentDistinctUserComments(CommentStatus.VISIBLE, PageRequest.of(0, 5));
    }

    public List<MangaCommentResponse> findByMangaSlug(String slug, User currentUser) {
        var manga = findMangaBySlugOrThrow(slug);
        var rootComments = commentRepository.findRootCommentsByMangaId(manga.getId(), CommentStatus.VISIBLE);
        return attachReplies(rootComments, manga.getOwnerUserId(), currentUser);
    }

    public List<MangaCommentResponse> findByMangaSlugAndChapterNumber(String slug, String chapterNumber, User currentUser) {
        var manga = findMangaBySlugOrThrow(slug);
        var chapter = chapterRepository.findByMangaIdAndChapterNumber(manga.getId(), chapterNumber)
                .orElseThrow(() -> {
                    log.warn("Chapter not found: mangaId={}, chapterNumber={}", manga.getId(), chapterNumber);
                    return new AppException(ErrorCode.CHAPTER_NOT_FOUND);
                });
        var rootComments = commentRepository.findRootCommentsByMangaIdAndChapterId(
                manga.getId(),
                chapter.getId(),
                CommentStatus.VISIBLE
        );
        return attachReplies(rootComments, manga.getOwnerUserId(), currentUser);
    }

    private List<MangaCommentResponse> attachReplies(List<Comment> rootComments, Long ownerUserId, User currentUser) {
        var parentIds = rootComments.stream()
                .map(Comment::getId)
                .toList();

        Map<Long, List<MangaCommentResponse>> repliesByParentId = parentIds.isEmpty()
                ? Map.of()
                : commentRepository.findRepliesByParentIds(parentIds, CommentStatus.VISIBLE)
                .stream()
                .collect(Collectors.groupingBy(
                        Comment::getParentId,
                        Collectors.mapping(c -> toResponse(c, ownerUserId, currentUser), Collectors.toList())
                ));

        return rootComments.stream()
                .map(comment -> {
                    var response = toResponse(comment, ownerUserId, currentUser);
                    response.setReplies(repliesByParentId.getOrDefault(comment.getId(), List.of()));
                    return response;
                })
                .toList();
    }

    @Transactional
    public MangaCommentResponse create(String slug, CreateCommentRequest request, User user) {
        return create(slug, null, request, user);
    }

    @Transactional
    public MangaCommentResponse create(String slug, String chapterNumber, CreateCommentRequest request, User user) {
        var now = Instant.now();
        var manga = findMangaBySlugOrThrow(slug);
        var chapterId = chapterNumber == null ? null : chapterRepository
                .findByMangaIdAndChapterNumber(manga.getId(), chapterNumber)
                .orElseThrow(() -> {
                    log.warn("Chapter not found: mangaId={}, chapterNumber={}", manga.getId(), chapterNumber);
                    return new AppException(ErrorCode.CHAPTER_NOT_FOUND);
                })
                .getId();

        User dbUser = userRepository.findById(user.getId()).orElse(user);

        var comment = Comment.builder()
                .userId(dbUser.getId())
                .mangaId(manga.getId())
                .chapterId(chapterId)
                .parentId(request.getParentId())
                .content(request.getContent().trim())
                .status(CommentStatus.VISIBLE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        var savedComment = commentRepository.save(comment);
        savedComment.setUser(dbUser);
        
        taskService.handleCommentPosted(dbUser.getId());

        return toResponse(savedComment, manga.getOwnerUserId(), dbUser);
    }

    @Transactional
    public CommentLikeResponse toggleLike(Long commentId, User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        var comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        if (comment.getStatus() == CommentStatus.DELETED || comment.getStatus() == CommentStatus.HIDDEN) {
            throw new AppException(ErrorCode.COMMENT_NOT_FOUND);
        }

        boolean exists = commentLikeRepository.existsByUserIdAndCommentId(user.getId(), commentId);
        if (exists) {
            commentLikeRepository.deleteByUserIdAndCommentId(user.getId(), commentId);
        } else {
            var like = new com.mangablade.backend.entities.CommentLike(user.getId(), commentId, null, null);
            commentLikeRepository.save(like);
        }

        long count = commentLikeRepository.countByCommentId(commentId);
        return new CommentLikeResponse(!exists, count);
    }

    @Transactional
    public void delete(Long commentId, User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        var comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        if (comment.getStatus() == CommentStatus.DELETED) {
            return;
        }

        boolean isOwner = comment.getUserId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        var now = Instant.now();
        comment.setStatus(CommentStatus.DELETED);
        comment.setDeletedAt(now);
        comment.setUpdatedAt(now);
    }

    private Manga findMangaBySlugOrThrow(String slug) {
        return mangaRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Manga not found: slug={}", slug);
                    return new AppException(ErrorCode.MANGA_NOT_FOUND);
                });
    }

    private MangaCommentResponse toResponse(Comment comment, Long ownerUserId, User currentUser) {
        User u = comment.getUser();
        String activeTitle = (u != null && u.getActiveTitle() != null) ? u.getActiveTitle().getName() : null;
        String activeTitleColor = (u != null && u.getActiveTitle() != null) ? u.getActiveTitle().getColorCode() : null;

        Long mangaOwnerId = ownerUserId;
        if (mangaOwnerId == null && comment.getManga() != null) {
            mangaOwnerId = comment.getManga().getOwnerUserId();
        }

        boolean isAuthor = mangaOwnerId != null && comment.getUserId() != null && mangaOwnerId.equals(comment.getUserId());

        Long userId = u != null ? u.getId() : comment.getUserId();
        String nameToDisplay = (u != null && u.getDisplayName() != null && !u.getDisplayName().isBlank())
                ? u.getDisplayName().trim()
                : toPublicUsername(u != null ? u.getUsername() : "");

        long likeCount = commentLikeRepository.countByCommentId(comment.getId());
        boolean isLiked = currentUser != null && commentLikeRepository.existsByUserIdAndCommentId(currentUser.getId(), comment.getId());

        return MangaCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .isAuthor(isAuthor)
                .likeCount(likeCount)
                .isLiked(isLiked)
                .user(MangaCommentResponse.User.builder()
                        .id(userId)
                        .username(nameToDisplay)
                        .activeTitle(activeTitle)
                        .activeTitleColor(activeTitleColor)
                        .isAuthor(isAuthor)
                        .build())
                .build();
    }

    private String toPublicUsername(String username) {
        if (username == null) {
            return "";
        }
        int atIndex = username.indexOf("@");
        if (atIndex > 0) {
            return username.substring(0, atIndex);
        }
        return username;
    }
}
