package com.mangablade.backend.services.mangablade;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class ForumWebSocketEventListener {
    private final ForumPresenceService forumPresenceService;

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        forumPresenceService.leave(event.getSessionId());
    }
}
