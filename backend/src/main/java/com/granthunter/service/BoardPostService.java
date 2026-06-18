package com.granthunter.service;

import com.granthunter.dto.BoardPostRequest;
import com.granthunter.dto.BoardPostResponse;
import com.granthunter.entity.BoardPost;
import com.granthunter.entity.User;
import com.granthunter.repository.BoardPostRepository;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BoardPostService {

    private final BoardPostRepository boardPostRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<BoardPostResponse> listPublished(String keyword, int page, int size, Long viewerUserId, boolean viewerAdmin) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("createdAt")));
        String q = keyword == null ? "" : keyword.trim();
        Page<BoardPost> posts = q.isEmpty()
                ? boardPostRepository.findByPublishedTrue(pageable)
                : boardPostRepository.searchPublished(q, pageable);
        return posts.map(post -> toResponse(post, viewerUserId, viewerAdmin, false));
    }

    @Transactional
    public BoardPostResponse getPublished(Long id, Long viewerUserId, boolean viewerAdmin) {
        BoardPost post = boardPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        if (!post.isPublished()) {
            throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
        }
        post.setViewCount(post.getViewCount() + 1);
        boardPostRepository.save(post);
        return toResponse(post, viewerUserId, viewerAdmin, true);
    }

    @Transactional
    public BoardPostResponse create(Long userId, BoardPostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        validateRequest(request);

        BoardPost post = BoardPost.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .authorId(user.getId())
                .authorName(resolveAuthorName(user))
                .pinned(false)
                .published(true)
                .build();
        return toResponse(boardPostRepository.save(post), userId, false, true);
    }

    @Transactional
    public BoardPostResponse update(Long id, Long userId, boolean admin, BoardPostRequest request) {
        BoardPost post = boardPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        assertCanEdit(post, userId, admin);
        validateRequest(request);
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        return toResponse(boardPostRepository.save(post), userId, admin, true);
    }

    @Transactional
    public void delete(Long id, Long userId, boolean admin) {
        BoardPost post = boardPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        assertCanEdit(post, userId, admin);
        boardPostRepository.delete(post);
    }

    @Transactional
    public BoardPostResponse setPinned(Long id, boolean pinned) {
        BoardPost post = boardPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        post.setPinned(pinned);
        return toResponse(boardPostRepository.save(post), null, true, true);
    }

    private void validateRequest(BoardPostRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("요청 본문이 필요합니다.");
        }
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (title.length() < 2 || title.length() > 200) {
            throw new IllegalArgumentException("제목은 2자 이상 200자 이하로 입력해 주세요.");
        }
        if (content.length() < 2 || content.length() > 20000) {
            throw new IllegalArgumentException("내용은 2자 이상 20,000자 이하로 입력해 주세요.");
        }
    }

    private void assertCanEdit(BoardPost post, Long userId, boolean admin) {
        if (admin) {
            return;
        }
        if (post.getAuthorId() == null || !post.getAuthorId().equals(userId)) {
            throw new AccessDeniedException("수정·삭제 권한이 없습니다.");
        }
    }

    private String resolveAuthorName(User user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName().trim();
        }
        return user.getEmail();
    }

    private BoardPostResponse toResponse(BoardPost post, Long viewerUserId, boolean viewerAdmin, boolean includeContent) {
        boolean mine = viewerUserId != null && viewerUserId.equals(post.getAuthorId());
        boolean editable = viewerAdmin || mine;
        String plain = post.getContent().replaceAll("\\s+", " ").trim();
        String excerpt = plain.length() > 120 ? plain.substring(0, 120) + "…" : plain;

        return BoardPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(includeContent ? post.getContent() : null)
                .excerpt(excerpt)
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .pinned(post.isPinned())
                .viewCount(post.getViewCount())
                .published(post.isPublished())
                .mine(mine)
                .editable(editable)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null)
                .updatedAt(post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : null)
                .build();
    }
}
