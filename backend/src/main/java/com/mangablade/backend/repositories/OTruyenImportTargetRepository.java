package com.mangablade.backend.repositories;

import java.util.List;

import com.mangablade.backend.entities.OTruyenImportTarget;
import com.mangablade.backend.utils.querysql.OTruyenImportTargetQuery;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OTruyenImportTargetRepository extends JpaRepository<OTruyenImportTarget, Long> {
    @Query(OTruyenImportTargetQuery.FIND_NEXT_TARGETS)
    List<OTruyenImportTarget> findNextTargets(Pageable pageable);
}
