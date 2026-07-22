package com.mangablade.backend.utils.querysql;

public class AuthorRequestQuery {
    public static final String FIND_REQUESTS = """
            SELECT r FROM AuthorRequest r
            LEFT JOIN r.user u
            WHERE (:status IS NULL OR r.status = :status)
              AND (
                  :search IS NULL OR :search = ''
                  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(r.penName) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """;
}
