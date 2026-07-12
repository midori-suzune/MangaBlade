package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.request.CreateCommentRequest;
import com.mangablade.backend.dtos.response.MangaCommentResponse;
import com.mangablade.backend.entities.Comment;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.CommentRepository;
import com.mangablade.backend.repositories.MangaRepository;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final MangaRepository mangaRepository;

    public List<MangaCommentResponse> findByMangaSlug(String slug) {
        var manga = findMangaBySlugOrThrow(slug);
        var rootComments = commentRepository.findRootCommentsByMangaId(manga.getId(), CommentStatus.VISIBLE);
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

    public MangaCommentResponse create(String slug, CreateCommentRequest request, User user) {
        var now = Instant.now();
        var manga = findMangaBySlugOrThrow(slug);
        var comment = Comment.builder()
                .userId(user.getId())
                .mangaId(manga.getId())
                .parentId(request.getParentId())
                .content(request.getContent().trim())
                .status(CommentStatus.VISIBLE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        var savedComment = commentRepository.save(comment);
        savedComment.setUser(user);
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
        return MangaCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .user(MangaCommentResponse.User.builder()
                        .id(comment.getUser().getId())
                        .username(toPublicUsername(comment.getUser().getUsername()))
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
