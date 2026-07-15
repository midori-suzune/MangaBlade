package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.request.CreateCommentRequest;
import com.mangablade.backend.dtos.response.MangaCommentResponse;
import com.mangablade.backend.dtos.response.RecentCommentResponse;
import com.mangablade.backend.entities.Comment;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.CommentRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.repositories.UserRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final TaskService taskService;
    private final UserRepository userRepository;

    public List<RecentCommentResponse> findRecentDistinctUserComments() {
        return commentRepository.findRecentDistinctUserComments(CommentStatus.VISIBLE, PageRequest.of(0, 5));
    }

    public List<MangaCommentResponse> findByMangaSlug(String slug) {
        var manga = findMangaBySlugOrThrow(slug);
        var rootComments = commentRepository.findRootCommentsByMangaId(manga.getId(), CommentStatus.VISIBLE);
        return attachReplies(rootComments);
    }

    public List<MangaCommentResponse> findByMangaSlugAndChapterNumber(String slug, String chapterNumber) {
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
        return attachReplies(rootComments);
    }

    private List<MangaCommentResponse> attachReplies(List<Comment> rootComments) {
        var parentIds = rootComments.stream()
                .map(Comment::getId)
                .toList();

        Map<Long, List<MangaCommentResponse>> repliesByParentId = parentIds.isEmpty()
                ? Map.of()
                : commentRepository.findRepliesByParentIds(parentIds, CommentStatus.VISIBLE)
                .stream()
                .collect(Collectors.groupingBy(
                        Comment::getParentId,
                        Collectors.mapping(this::toResponse, Collectors.toList())
                ));

        return rootComments.stream()
                .map(comment -> {
                    var response = toResponse(comment);
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

        return toResponse(savedComment);
    }

    private Manga findMangaBySlugOrThrow(String slug) {
        return mangaRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Manga not found: slug={}", slug);
                    return new AppException(ErrorCode.MANGA_NOT_FOUND);
                });
    }

    private MangaCommentResponse toResponse(Comment comment) {
        String activeTitle = comment.getUser().getActiveTitle() != null ? comment.getUser().getActiveTitle().getName() : null;
        String activeTitleColor = comment.getUser().getActiveTitle() != null ? comment.getUser().getActiveTitle().getColorCode() : null;

        return MangaCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .user(MangaCommentResponse.User.builder()
                        .id(comment.getUser().getId())
                        .username(toPublicUsername(comment.getUser().getUsername()))
                        .activeTitle(activeTitle)
                        .activeTitleColor(activeTitleColor)
                        .build())
                .build();
    }

    private String toPublicUsername(String username) {
        if (username == null) {
            return "";
        }

        var atIndex = username.indexOf("@");
        if (atIndex > 0) {
            return username.substring(0, atIndex);
        }

        return username;
    }
}
