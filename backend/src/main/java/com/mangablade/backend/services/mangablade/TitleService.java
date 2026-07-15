package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.TitleResponse;
import java.util.List;

public interface TitleService {
    List<TitleResponse> getUnlockedTitles(Long userId);
    void equipTitle(Long userId, Long titleId);
}
