package com.mangablade.backend.services.mangablade;

import java.time.Instant;
import java.util.Optional;
import com.mangablade.backend.dtos.request.AuthorRequestCreateRequest;
import com.mangablade.backend.dtos.request.AuthorRequestReviewRequest;
import com.mangablade.backend.dtos.response.AuthorRequestResponse;
import com.mangablade.backend.entities.AuthorRequest;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.AuthorRequestStatus;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.AuthorRequestRepository;
import com.mangablade.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthorRequestService {

    private final AuthorRequestRepository authorRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public AuthorRequestResponse submitRequest(User user, AuthorRequestCreateRequest req) {
        if (user.getRole() == UserRole.AUTHOR) {
            throw new AppException(ErrorCode.ALREADY_AUTHOR);
        }

        if (authorRequestRepository.existsByUserIdAndStatus(user.getId(), AuthorRequestStatus.PENDING)) {
            throw new AppException(ErrorCode.AUTHOR_REQUEST_ALREADY_PENDING);
        }

        AuthorRequest authorRequest = AuthorRequest.builder()
                .userId(user.getId())
                .penName(req.getPenName())
                .phone(req.getPhone())
                .socialLink(req.getSocialLink())
                .status(AuthorRequestStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        authorRequestRepository.save(authorRequest);
        return toResponse(authorRequest, user);
    }

    @Transactional(readOnly = true)
    public Optional<AuthorRequestResponse> getMyRequest(User user) {
        return authorRequestRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .map(req -> toResponse(req, user));
    }

    @Transactional(readOnly = true)
    public Page<AuthorRequestResponse> getAllRequests(String status, Pageable pageable) {
        Page<AuthorRequest> requests;
        if (status == null || status.trim().isEmpty()) {
            requests = authorRequestRepository.findAll(pageable);
        } else {
            try {
                AuthorRequestStatus statusEnum = AuthorRequestStatus.valueOf(status.toUpperCase());
                requests = authorRequestRepository.findByStatus(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                requests = authorRequestRepository.findAll(pageable);
            }
        }
        return requests.map(this::toResponse);
    }

    @Transactional
    public void reviewRequest(Long requestId, User admin, AuthorRequestReviewRequest req) {
        AuthorRequest authorRequest = authorRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_REQUEST_NOT_FOUND));

        if (authorRequest.getStatus() != AuthorRequestStatus.PENDING) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        Instant now = Instant.now();
        if ("APPROVE".equalsIgnoreCase(req.getAction())) {
            authorRequest.setStatus(AuthorRequestStatus.APPROVED);
            authorRequest.setReviewedAt(now);
            authorRequest.setReviewedBy(admin.getId());

            User user = userRepository.findById(authorRequest.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            user.setRole(UserRole.AUTHOR);
            userRepository.save(user);
        } else if ("REJECT".equalsIgnoreCase(req.getAction())) {
            authorRequest.setStatus(AuthorRequestStatus.REJECTED);
            authorRequest.setRejectReason(req.getRejectReason());
            authorRequest.setReviewedAt(now);
            authorRequest.setReviewedBy(admin.getId());
        } else {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        authorRequestRepository.save(authorRequest);
    }

    private AuthorRequestResponse toResponse(AuthorRequest req) {
        User user = userRepository.findById(req.getUserId()).orElse(null);
        return toResponse(req, user);
    }

    private AuthorRequestResponse toResponse(AuthorRequest req, User user) {
        return AuthorRequestResponse.builder()
                .id(req.getId())
                .userId(req.getUserId())
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .penName(req.getPenName())
                .phone(req.getPhone())
                .socialLink(req.getSocialLink())
                .status(req.getStatus().name())
                .rejectReason(req.getRejectReason())
                .createdAt(req.getCreatedAt())
                .reviewedAt(req.getReviewedAt())
                .build();
    }
}
