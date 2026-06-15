-- 북마크/파이프라인 FK가 구 grants 테이블을 참조해 insert가 실패하는 문제 수정
-- 실제 공고 데이터는 grant_notices 테이블에 있습니다.

ALTER TABLE IF EXISTS bookmarks DROP CONSTRAINT IF EXISTS bookmarks_grant_id_fkey;
ALTER TABLE IF EXISTS pipeline_items DROP CONSTRAINT IF EXISTS pipeline_items_grant_id_fkey;
ALTER TABLE IF EXISTS user_grant_checklists DROP CONSTRAINT IF EXISTS user_grant_checklists_grant_id_fkey;
