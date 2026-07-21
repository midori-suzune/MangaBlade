package com.mangablade.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mangablade.backend.entities.ChapterReport;

@Repository
public interface ChapterReportRepository extends JpaRepository<ChapterReport, Long> {
}
