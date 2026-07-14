package com.mangablade.backend.utils.querysql;

public class OTruyenImportTargetQuery {
    public static final String FIND_NEXT_TARGETS = """
            SELECT target
            FROM OTruyenImportTarget target
            WHERE target.enabled = true
            ORDER BY
                CASE WHEN target.lastImportedAt IS NULL THEN 0 ELSE 1 END,
                target.priority DESC,
                target.lastImportedAt ASC,
                target.id ASC
            """;
}
