-- 게시판 댓글·대댓글
CREATE TABLE IF NOT EXISTS site_board_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES site_board_posts(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES site_board_comments(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_board_comments_post
    ON site_board_comments (post_id, created_at);
