package com.mangablade.backend.dtos.response;

import java.time.LocalDate;

public interface DailyReadCountProjection {
    LocalDate getReadDate();

    Long getReadCount();
}
