package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.ForumCommentDeletedPayload;
import com.mangablade.backend.dtos.response.ForumCommentLikePayload;
import com.mangablade.backend.dtos.response.ForumCommentResponse;
import com.mangablade.backend.dtos.response.ForumPresenceResponse;
import com.mangablade.backend.dtos.response.ForumRealtimeEvent;
import com.mangablade.backend.dtos.response.ForumThreadDeletedPayload;
import com.mangablade.backend.dtos.response.ForumThreadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ForumRealtimePublisher {
    public static final String THREAD_CREATED = "THREAD_CREATED";
    public static final String THREAD_DELETED = "THREAD_DELETED";
    public static final String COMMENT_CREATED = "COMMENT_CREATED";
    public static final String COMMENT_DELETED = "COMMENT_DELETED";
    public static final String COMMENT_LIKE_UPDATED = "COMMENT_LIKE_UPDATED";
    public static final String PRESENCE_UPDATED = "PRESENCE_UPDATED";

    private final SimpMessagingTemplate messagingTemplate;

    public void threadCreated(ForumThreadResponse thread) {
        messagingTemplate.convertAndSend(
                "/topic/forum/threads",
                ForumRealtimeEvent.of(THREAD_CREATED, thread)
        );
    }

    public void threadDeleted(Long threadId) {
        var payload = ForumThreadDeletedPayload.builder()
                .threadId(threadId)
                .build();
        messagingTemplate.convertAndSend(
                "/topic/forum/threads",
                ForumRealtimeEvent.of(THREAD_DELETED, payload)
        );
        messagingTemplate.convertAndSend(
                threadTopic(threadId),
                ForumRealtimeEvent.of(THREAD_DELETED, payload)
        );
    }

    public void commentCreated(ForumCommentResponse comment) {
        messagingTemplate.convertAndSend(
                threadTopic(comment.getThreadId()),
                ForumRealtimeEvent.of(COMMENT_CREATED, comment)
        );
    }

    public void commentDeleted(Long threadId, Long commentId, Integer commentCount) {
        var payload = ForumCommentDeletedPayload.builder()
                .threadId(threadId)
                .commentId(commentId)
                .commentCount(commentCount)
                .build();
        messagingTemplate.convertAndSend(
                threadTopic(threadId),
                ForumRealtimeEvent.of(COMMENT_DELETED, payload)
        );
    }

    public void commentLikeUpdated(Long threadId, Long commentId, boolean liked, long likeCount) {
        var payload = ForumCommentLikePayload.builder()
                .threadId(threadId)
                .commentId(commentId)
                .liked(liked)
                .likeCount(likeCount)
                .build();
        messagingTemplate.convertAndSend(
                threadTopic(threadId),
                ForumRealtimeEvent.of(COMMENT_LIKE_UPDATED, payload)
        );
    }

    public void presenceUpdated(Long threadId, int onlineCount) {
        messagingTemplate.convertAndSend(
                threadTopic(threadId),
                ForumRealtimeEvent.of(
                        PRESENCE_UPDATED,
                        ForumPresenceResponse.builder()
                                .threadId(threadId)
                                .onlineCount(onlineCount)
                                .build()
                )
        );
    }

    private String threadTopic(Long threadId) {
        return "/topic/forum/threads/" + threadId;
    }
}
