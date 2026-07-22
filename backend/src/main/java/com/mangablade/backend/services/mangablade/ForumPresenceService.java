package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ForumPresenceService {
    private final ForumRealtimePublisher realtimePublisher;
    private final Map<Long, Map<String, Set<String>>> sessionsByViewerByThreadId = new ConcurrentHashMap<>();
    private final Map<String, Long> threadIdBySessionId = new ConcurrentHashMap<>();
    private final Map<String, String> viewerKeyBySessionId = new ConcurrentHashMap<>();

    public void join(Long threadId, String sessionId, User user) {
        if (threadId == null || sessionId == null || sessionId.isBlank()) {
            return;
        }

        String viewerKey = resolveViewerKey(sessionId, user);
        Long previousThreadId = threadIdBySessionId.put(sessionId, threadId);
        if (previousThreadId != null && !previousThreadId.equals(threadId)) {
            removeSession(previousThreadId, sessionId);
        }
        viewerKeyBySessionId.put(sessionId, viewerKey);

        sessionsByViewerByThreadId
                .computeIfAbsent(threadId, id -> new ConcurrentHashMap<>())
                .computeIfAbsent(viewerKey, key -> ConcurrentHashMap.newKeySet())
                .add(sessionId);
        realtimePublisher.presenceUpdated(threadId, count(threadId));
    }

    public void leave(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        Long threadId = threadIdBySessionId.remove(sessionId);
        if (threadId == null) {
            viewerKeyBySessionId.remove(sessionId);
            return;
        }

        removeSession(threadId, sessionId);
        viewerKeyBySessionId.remove(sessionId);
    }

    public int count(Long threadId) {
        return sessionsByViewerByThreadId.getOrDefault(threadId, Map.of()).size();
    }

    private void removeSession(Long threadId, String sessionId) {
        String viewerKey = viewerKeyBySessionId.getOrDefault(sessionId, "guest:" + sessionId);
        sessionsByViewerByThreadId.computeIfPresent(threadId, (id, sessionsByViewer) -> {
            sessionsByViewer.computeIfPresent(viewerKey, (key, sessions) -> {
                sessions.remove(sessionId);
                return sessions.isEmpty() ? null : sessions;
            });
            return sessionsByViewer.isEmpty() ? null : sessionsByViewer;
        });
        realtimePublisher.presenceUpdated(threadId, count(threadId));
    }

    private String resolveViewerKey(String sessionId, User user) {
        if (user != null && user.getId() != null) {
            return "user:" + user.getId();
        }
        return "guest:" + sessionId;
    }
}
