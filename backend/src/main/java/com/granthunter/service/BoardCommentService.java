package com.granthunter.service;

import com.granthunter.dto.BoardCommentRequest;
import com.granthunter.dto.BoardCommentResponse;
import com.granthunter.entity.BoardComment;
import com.granthunter.entity.BoardPost;
import com.granthunter.entity.User;
import com.granthunter.repository.BoardCommentRepository;
import com.granthunter.repository.BoardPostRepository;
import com.granthunter.repository.UserRepository;
import com.granthunter.util.BoardAuthorUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostRepository boardPostRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BoardCommentResponse> listByPost(Long postId, Long viewerUserId, boolean viewerAdmin) {
        assertPublishedPost(postId);
        List<BoardComment> comments = boardCommentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        Map<Long, BoardCommentResponse> byId = new LinkedHashMap<>();

        for (BoardComment comment : comments) {
            byId.put(comment.getId(), toResponse(comment, viewerUserId, viewerAdmin));
        }

        List<BoardCommentResponse> roots = new ArrayList<>();
        for (BoardComment comment : comments) {
            BoardCommentResponse node = byId.get(comment.getId());
            if (comment.getParentId() == null) {
                roots.add(node);
                continue;
            }
            BoardCommentResponse parent = byId.get(comment.getParentId());
            if (parent != null) {
                parent.getReplies().add(node);
            } else {
                roots.add(node);
            }
        }
        return roots;
    }

    @Transactional
    public BoardCommentResponse create(Long postId, Long userId, BoardCommentRequest request) {
        assertPublishedPost(postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        String content = validateContent(request == null ? null : request.getContent());

        Long parentId = request == null ? null : request.getParentId();
        if (parentId != null) {
            BoardComment parent = boardCommentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("답글 대상 댓글을 찾을 수 없습니다."));
            if (!postId.equals(parent.getPostId())) {
                throw new IllegalArgumentException("같은 게시글의 댓글에만 답글을 달 수 있습니다.");
            }
            if (parent.getParentId() != null) {
                throw new IllegalArgumentException("대댓글에는 답글을 달 수 없습니다.");
            }
        }

        BoardComment comment = BoardComment.builder()
                .postId(postId)
                .parentId(parentId)
                .authorId(user.getId())
                .authorName(resolveAuthorName(user))
                .content(content)
                .build();
        return toResponse(boardCommentRepository.save(comment), userId, false);
    }

    @Transactional
    public void delete(Long commentId, Long userId, boolean admin) {
        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        assertCanDelete(comment, userId, admin);
        boardCommentRepository.delete(comment);
    }

    @Transactional
    public void deleteByPostId(Long postId) {
        boardCommentRepository.deleteByPostId(postId);
    }

    private void assertPublishedPost(Long postId) {
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        if (!post.isPublished()) {
            throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
        }
    }

    private void assertCanDelete(BoardComment comment, Long userId, boolean admin) {
        if (admin) {
            return;
        }
        if (comment.getAuthorId() == null || !comment.getAuthorId().equals(userId)) {
            throw new AccessDeniedException("댓글 삭제 권한이 없습니다.");
        }
    }

    private String validateContent(String content) {
        String trimmed = content == null ? "" : content.trim();
        if (trimmed.length() < 1 || trimmed.length() > 2000) {
            throw new IllegalArgumentException("댓글은 1자 이상 2,000자 이하로 입력해 주세요.");
        }
        return trimmed;
    }

    private String resolveAuthorName(User user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName().trim();
        }
        return user.getEmail();
    }

    private BoardCommentResponse toResponse(BoardComment comment, Long viewerUserId, boolean viewerAdmin) {
        boolean mine = viewerUserId != null && viewerUserId.equals(comment.getAuthorId());
        boolean deletable = viewerAdmin || mine;
        return BoardCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .parentId(comment.getParentId())
                .authorId(comment.getAuthorId())
                .authorName(BoardAuthorUtils.maskDisplayName(comment.getAuthorName()))
                .content(comment.getContent())
                .mine(mine)
                .deletable(deletable)
                .createdAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null)
                .replies(new ArrayList<>())
                .build();
    }
}
