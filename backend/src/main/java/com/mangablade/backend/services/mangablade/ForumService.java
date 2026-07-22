package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.request.CreateForumCommentRequest;
import com.mangablade.backend.dtos.request.CreateForumThreadRequest;
import com.mangablade.backend.dtos.response.CommentLikeResponse;
import com.mangablade.backend.dtos.response.ForumCommentResponse;
import com.mangablade.backend.dtos.response.ForumThreadResponse;
import com.mangablade.backend.dtos.response.PageResponse;
import com.mangablade.backend.entities.ForumComment;
import com.mangablade.backend.entities.ForumCommentLike;
import com.mangablade.backend.entities.ForumThread;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.enums.ForumThreadCategory;
import com.mangablade.backend.enums.ForumThreadStatus;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ForumCommentLikeRepository;
import com.mangablade.backend.repositories.ForumCommentRepository;
import com.mangablade.backend.repositories.ForumThreadRepository;
import com.mangablade.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {
    private static final List<ForumThreadStatus> READABLE_THREAD_STATUSES = List.of(
            ForumThreadStatus.VISIBLE,
            ForumThreadStatus.LOCKED
    );

    private final ForumThreadRepository forumThreadRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ForumCommentLikeRepository forumCommentLikeRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final ForumRealtimePublisher realtimePublisher;

    @Transactional(readOnly = true)
    public PageResponse<ForumThreadResponse> findThreads(ForumThreadCategory category, int page, int size) {
        var pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Order.desc("lastCommentedAt"), Sort.Order.desc("createdAt"))
        );

        var threads = category == null
                ? forumThreadRepository.findByStatusIn(READABLE_THREAD_STATUSES, pageable)
                : forumThreadRepository.findByCategoryAndStatusIn(category, READABLE_THREAD_STATUSES, pageable);

        return PageResponse.from(threads.map(this::toThreadResponse));
    }

    @Transactional
    public ForumThreadResponse findThread(Long threadId) {
        var thread = findReadableThreadOrThrow(threadId);
        thread.setViewCount(thread.getViewCount() + 1);
        thread.setUpdatedAt(Instant.now());
        return toThreadResponse(thread);
    }

    @Transactional
    public ForumThreadResponse createThread(CreateForumThreadRequest request, User user) {
        requireAuthenticated(user);

        var now = Instant.now();
        var dbUser = userRepository.findById(user.getId()).orElse(user);
        var thread = ForumThread.builder()
                .userId(dbUser.getId())
                .category(request.getCategory())
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .status(ForumThreadStatus.VISIBLE)
                .viewCount(0)
                .commentCount(0)
                .lastCommentedAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        var savedThread = forumThreadRepository.save(thread);
        savedThread.setUser(dbUser);
        var response = toThreadResponse(savedThread);
        realtimePublisher.threadCreated(response);
        return response;
    }

    @Transactional
    public void deleteThread(Long threadId, User user) {
        requireAuthenticated(user);

        var thread = findReadableThreadOrThrow(threadId);
        boolean isOwner = thread.getUserId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        var now = Instant.now();
        thread.setStatus(ForumThreadStatus.DELETED);
        thread.setDeletedAt(now);
        thread.setUpdatedAt(now);
        realtimePublisher.threadDeleted(threadId);
    }

    @Transactional(readOnly = true)
    public List<ForumCommentResponse> findComments(Long threadId, User currentUser) {
        findReadableThreadOrThrow(threadId);

        var rootComments = forumCommentRepository
                .findByThreadIdAndReplyToCommentIdIsNullAndStatusOrderByCreatedAtAsc(threadId, CommentStatus.VISIBLE);
        var parentIds = rootComments.stream().map(ForumComment::getId).toList();

        Map<Long, List<ForumCommentResponse>> repliesByParentId = parentIds.isEmpty()
                ? Map.of()
                : forumCommentRepository
                .findByReplyToCommentIdInAndStatusOrderByCreatedAtAsc(parentIds, CommentStatus.VISIBLE)
                .stream()
                .collect(Collectors.groupingBy(
                        ForumComment::getReplyToCommentId,
                        Collectors.mapping(comment -> toCommentResponse(comment, currentUser), Collectors.toList())
                ));

        return rootComments.stream()
                .map(comment -> {
                    var response = toCommentResponse(comment, currentUser);
                    response.setReplies(repliesByParentId.getOrDefault(comment.getId(), List.of()));
                    return response;
                })
                .toList();
    }

    @Transactional
    public ForumCommentResponse createComment(Long threadId, CreateForumCommentRequest request, User user) {
        requireAuthenticated(user);

        var thread = findReadableThreadOrThrow(threadId);
        if (thread.getStatus() == ForumThreadStatus.LOCKED) {
            throw new AppException(ErrorCode.FORUM_THREAD_LOCKED);
        }

        if (request.getReplyToCommentId() != null) {
            var parent = forumCommentRepository.findByIdAndStatus(request.getReplyToCommentId(), CommentStatus.VISIBLE)
                    .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
            if (!threadId.equals(parent.getThreadId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
        }

        var now = Instant.now();
        var dbUser = userRepository.findById(user.getId()).orElse(user);
        var comment = ForumComment.builder()
                .threadId(threadId)
                .userId(dbUser.getId())
                .replyToCommentId(request.getReplyToCommentId())
                .content(request.getContent().trim())
                .status(CommentStatus.VISIBLE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        var savedComment = forumCommentRepository.save(comment);
        savedComment.setUser(dbUser);

        thread.setCommentCount(thread.getCommentCount() + 1);
        thread.setLastCommentedAt(now);
        thread.setUpdatedAt(now);
        taskService.handleCommentPosted(dbUser.getId());

        var response = toCommentResponse(savedComment, dbUser);
        realtimePublisher.commentCreated(response);
        return response;
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        requireAuthenticated(user);

        var comment = forumCommentRepository.findById(commentId)
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

        final int[] commentCount = {0};
        forumThreadRepository.findById(comment.getThreadId()).ifPresent(thread -> {
            thread.setCommentCount(Math.max(thread.getCommentCount() - 1, 0));
            thread.setUpdatedAt(now);
            commentCount[0] = thread.getCommentCount();
        });
        realtimePublisher.commentDeleted(comment.getThreadId(), commentId, commentCount[0]);
    }

    @Transactional
    public CommentLikeResponse toggleCommentLike(Long commentId, User user) {
        requireAuthenticated(user);

        var comment = forumCommentRepository.findByIdAndStatus(commentId, CommentStatus.VISIBLE)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
        findReadableThreadOrThrow(comment.getThreadId());

        boolean exists = forumCommentLikeRepository.existsByUserIdAndCommentId(user.getId(), commentId);
        if (exists) {
            forumCommentLikeRepository.deleteByUserIdAndCommentId(user.getId(), commentId);
        } else {
            forumCommentLikeRepository.save(new ForumCommentLike(user.getId(), commentId, Instant.now(), null, null));
        }

        long count = forumCommentLikeRepository.countByCommentId(commentId);
        boolean liked = !exists;
        realtimePublisher.commentLikeUpdated(comment.getThreadId(), commentId, liked, count);
        return new CommentLikeResponse(liked, count);
    }

    private ForumThread findReadableThreadOrThrow(Long threadId) {
        return forumThreadRepository.findByIdAndStatusIn(threadId, READABLE_THREAD_STATUSES)
                .orElseThrow(() -> new AppException(ErrorCode.FORUM_THREAD_NOT_FOUND));
    }

    private void requireAuthenticated(User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private ForumThreadResponse toThreadResponse(ForumThread thread) {
        return ForumThreadResponse.builder()
                .id(thread.getId())
                .category(thread.getCategory())
                .title(thread.getTitle())
                .content(thread.getContent())
                .status(thread.getStatus())
                .viewCount(thread.getViewCount())
                .commentCount(thread.getCommentCount())
                .lastCommentedAt(thread.getLastCommentedAt())
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getUpdatedAt())
                .user(toThreadUserResponse(thread.getUser()))
                .build();
    }

    private ForumCommentResponse toCommentResponse(ForumComment comment, User currentUser) {
        long likeCount = forumCommentLikeRepository.countByCommentId(comment.getId());
        boolean isLiked = currentUser != null
                && forumCommentLikeRepository.existsByUserIdAndCommentId(currentUser.getId(), comment.getId());

        return ForumCommentResponse.builder()
                .id(comment.getId())
                .threadId(comment.getThreadId())
                .replyToCommentId(comment.getReplyToCommentId())
                .content(comment.getContent())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .likeCount(likeCount)
                .isLiked(isLiked)
                .user(toCommentUserResponse(comment.getUser()))
                .build();
    }

    private ForumThreadResponse.User toThreadUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return ForumThreadResponse.User.builder()
                .id(user.getId())
                .username(toDisplayName(user))
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .activeTitle(user.getActiveTitle() != null ? user.getActiveTitle().getName() : null)
                .activeTitleColor(user.getActiveTitle() != null ? user.getActiveTitle().getColorCode() : null)
                .build();
    }

    private ForumCommentResponse.User toCommentUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return ForumCommentResponse.User.builder()
                .id(user.getId())
                .username(toDisplayName(user))
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .activeTitle(user.getActiveTitle() != null ? user.getActiveTitle().getName() : null)
                .activeTitleColor(user.getActiveTitle() != null ? user.getActiveTitle().getColorCode() : null)
                .build();
    }

    private String toDisplayName(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName().trim();
        }
        var username = user.getUsername();
        if (username == null) {
            return "";
        }
        int atIndex = username.indexOf("@");
        return atIndex > 0 ? username.substring(0, atIndex) : username;
    }
}
