package com.granthunter.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 초기 SQL 스키마(grants)와 실제 JPA 엔티티(grant_notices) 불일치로
 * 북마크·파이프라인 FK가 깨진 DB를 자동 복구합니다.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class GrantForeignKeyRepair implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        repairTable("bookmarks", "bookmarks_grant_id_fkey");
        repairTable("pipeline_items", "pipeline_items_grant_id_fkey");
        repairTable("user_grant_checklists", "user_grant_checklists_grant_id_fkey");
    }

    private void repairTable(String table, String constraintName) {
        if (!tableExists(table)) {
            return;
        }

        if (!constraintExists(table, constraintName)) {
            return;
        }

        String referencedTable = findReferencedTable(constraintName);
        if ("grant_notices".equals(referencedTable)) {
            return;
        }

        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " DROP CONSTRAINT " + constraintName);
            log.warn("잘못된 FK 제거: {}.{} (기존 참조: {}) → grant_notices 기준으로 앱에서 검증합니다.",
                    table, constraintName, referencedTable);
        } catch (Exception ex) {
            log.error("FK 복구 실패: {}.{} - {}", table, constraintName, ex.getMessage());
        }
    }

    private boolean tableExists(String table) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = ?
                """,
                Integer.class,
                table
        );
        return count != null && count > 0;
    }

    private boolean constraintExists(String table, String constraintName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*) FROM information_schema.table_constraints
                WHERE table_schema = 'public' AND table_name = ? AND constraint_name = ?
                """,
                Integer.class,
                table,
                constraintName
        );
        return count != null && count > 0;
    }

    private String findReferencedTable(String constraintName) {
        try {
            return jdbcTemplate.queryForObject(
                    """
                    SELECT ccu.table_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu
                      ON ccu.constraint_name = tc.constraint_name
                     AND ccu.table_schema = tc.table_schema
                    WHERE tc.table_schema = 'public' AND tc.constraint_name = ?
                    LIMIT 1
                    """,
                    String.class,
                    constraintName
            );
        } catch (Exception ex) {
            return null;
        }
    }
}
