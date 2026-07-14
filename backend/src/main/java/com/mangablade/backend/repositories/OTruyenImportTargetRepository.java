package com.mangablade.backend.repositories;

import java.util.List;

import com.mangablade.backend.entities.OTruyenImportTarget;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OTruyenImportTargetRepository extends JpaRepository<OTruyenImportTarget, Long> {
    @Query("""
            SELECT target
            FROM OTruyenImportTarget target
            WHERE target.enabled = true
            ORDER BY
                CASE WHEN target.lastImportedAt IS NULL THEN 0 ELSE 1 END,
                target.priority DESC,
                target.lastImportedAt ASC,
                target.id ASC
            """)
    List<OTruyenImportTarget> findNextTargets(Pageable pageable);
}
