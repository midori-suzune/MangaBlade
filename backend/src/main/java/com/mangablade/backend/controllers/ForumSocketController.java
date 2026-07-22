package com.mangablade.backend.controllers;

import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.ForumPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ForumSocketController {
    private final ForumPresenceService forumPresenceService;

    @MessageMapping("/forum/threads/{threadId}/join")
    public void joinThread(@DestinationVariable Long threadId, SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        forumPresenceService.join(threadId, headerAccessor.getSessionId(), resolveUser(principal));
    }

    @MessageMapping("/forum/threads/leave")
    public void leaveThread(SimpMessageHeaderAccessor headerAccessor) {
        forumPresenceService.leave(headerAccessor.getSessionId());
    }

    private User resolveUser(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication
                && authentication.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }
}
