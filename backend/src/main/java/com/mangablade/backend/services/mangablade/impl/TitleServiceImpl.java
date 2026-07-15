package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.TitleResponse;
import com.mangablade.backend.entities.Title;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.TitleRepository;
import com.mangablade.backend.repositories.UserRepository;
import com.mangablade.backend.services.mangablade.TitleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TitleServiceImpl implements TitleService {

    private final UserRepository userRepository;
    private final TitleRepository titleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TitleResponse> getUnlockedTitles(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Title> allTitles = titleRepository.findAll();
        Long equippedId = user.getActiveTitleId();

        return allTitles.stream()
                .filter(t -> user.getLevel() >= t.getRequiredLevel())
                .map(t -> TitleResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .requiredLevel(t.getRequiredLevel())
                        .colorCode(t.getColorCode())
                        .equipped(t.getId().equals(equippedId))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void equipTitle(Long userId, Long titleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (titleId == null) {
            user.setActiveTitleId(null);
            userRepository.save(user);
            return;
        }

        Title title = titleRepository.findById(titleId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_PASSWORD));

        if (user.getLevel() < title.getRequiredLevel()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        user.setActiveTitleId(titleId);
        userRepository.save(user);
    }
}
