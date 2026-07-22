package com.mangablade.backend.utils.querysql;

public class UserQuery {
    public static final String FIND_BY_ROLE_WITH_FILTERS = """
            SELECT u
            FROM User u
            LEFT JOIN FETCH u.activeTitle
            WHERE (:role IS NULL OR u.role = :role)
              AND (:search IS NULL OR u.username LIKE %:search% OR u.email LIKE %:search%)
              AND (:isBanned IS NULL OR u.isBanned = :isBanned)
            """;

    public static final String COUNT_BY_ROLE_WITH_FILTERS = """
            SELECT COUNT(u)
            FROM User u
            WHERE (:role IS NULL OR u.role = :role)
              AND (:search IS NULL OR u.username LIKE %:search% OR u.email LIKE %:search%)
              AND (:isBanned IS NULL OR u.isBanned = :isBanned)
            """;
}
