-- 게시판·댓글 작성자명 일부 마스킹 (DB 저장값 갱신, 재실행 가능)
-- 예: 김기철 → 김*철, 김지영 → 김*영

UPDATE site_board_posts
SET author_name = CASE
    WHEN author_name IS NULL OR btrim(author_name) = '' THEN '익명'
    WHEN author_name LIKE '%*%' THEN author_name
    WHEN author_name LIKE '%@%' THEN left(author_name, 1) || '***' || substring(author_name from position('@' in author_name))
    WHEN char_length(author_name) = 1 THEN author_name
    WHEN char_length(author_name) = 2 THEN left(author_name, 1) || '*'
    ELSE left(author_name, 1)
         || repeat('*', char_length(author_name) - 2)
         || right(author_name, 1)
END,
updated_at = NOW()
WHERE author_name IS NOT NULL
  AND author_name NOT LIKE '%*%';

UPDATE site_board_comments
SET author_name = CASE
    WHEN author_name IS NULL OR btrim(author_name) = '' THEN '익명'
    WHEN author_name LIKE '%*%' THEN author_name
    WHEN author_name LIKE '%@%' THEN left(author_name, 1) || '***' || substring(author_name from position('@' in author_name))
    WHEN char_length(author_name) = 1 THEN author_name
    WHEN char_length(author_name) = 2 THEN left(author_name, 1) || '*'
    ELSE left(author_name, 1)
         || repeat('*', char_length(author_name) - 2)
         || right(author_name, 1)
END,
updated_at = NOW()
WHERE author_name IS NOT NULL
  AND author_name NOT LIKE '%*%';
