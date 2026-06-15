package com.granthunter.service;

import com.granthunter.dto.BookmarkResponse;
import com.granthunter.entity.Bookmark;
import com.granthunter.entity.GrantNotice;
import com.granthunter.repository.BookmarkRepository;
import com.granthunter.repository.GrantNoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final GrantNoticeRepository grantRepository;
    private final PlanService planService;

    public List<BookmarkResponse> listForUser(Long userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<Long> grantIdsForUser(Long userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(Bookmark::getGrantId)
                .toList();
    }

    public boolean isBookmarked(Long userId, Long grantId) {
        return bookmarkRepository.findByUserIdAndGrantId(userId, grantId).isPresent();
    }

    @Transactional
    public BookmarkResponse addBookmark(Long userId, Long grantId) {
        if (bookmarkRepository.findByUserIdAndGrantId(userId, grantId).isPresent()) {
            throw new IllegalArgumentException("이미 북마크한 공고입니다.");
        }

        planService.assertCanAddBookmark(userId);

        GrantNotice grant = grantRepository.findById(grantId)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));

        Bookmark bookmark = Bookmark.builder()
                .userId(userId)
                .grantId(grant.getId())
                .build();

        return toResponse(bookmarkRepository.save(bookmark));
    }

    @Transactional
    public void removeBookmark(Long userId, Long grantId) {
        Bookmark bookmark = bookmarkRepository.findByUserIdAndGrantId(userId, grantId)
                .orElseThrow(() -> new IllegalArgumentException("북마크를 찾을 수 없습니다."));
        bookmarkRepository.delete(bookmark);
    }

    private BookmarkResponse toResponse(Bookmark bookmark) {
        GrantNotice grant = grantRepository.findById(bookmark.getGrantId()).orElse(null);

        return BookmarkResponse.builder()
                .id(bookmark.getId())
                .grantId(bookmark.getGrantId())
                .title(grant != null ? grant.getTitle() : "공고 #" + bookmark.getGrantId())
                .organization(grant != null ? grant.getOrganization() : "")
                .category(grant != null ? grant.getCategory() : "기타")
                .budget(grant != null ? grant.getBudget() : "")
                .applyEnd(grant != null && grant.getApplyEnd() != null ? grant.getApplyEnd().toString() : "")
                .originalUrl(grant != null ? grant.getUrl() : null)
                .createdAt(bookmark.getCreatedAt() != null ? bookmark.getCreatedAt().toString() : "")
                .build();
    }
}
