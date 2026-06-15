package com.granthunter.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.granthunter.dto.GrantChecklistResponse;
import com.granthunter.dto.GrantDocumentItemDto;
import com.granthunter.dto.OfficialFormEntryDto;
import com.granthunter.dto.UpdateGrantChecklistRequest;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.User;
import com.granthunter.entity.UserGrantChecklist;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.UserGrantChecklistRepository;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GrantChecklistService {

    private final GrantNoticeRepository grantNoticeRepository;
    private final UserGrantChecklistRepository checklistRepository;
    private final UserRepository userRepository;
    private final RequirementsParserService requirementsParserService;
    private final GrantFormMatchingService grantFormMatchingService;
    private final ObjectMapper objectMapper;
    private final PlanService planService;

    public GrantChecklistResponse getChecklist(Long grantId, Long userId) {
        GrantNotice grant = grantNoticeRepository.findById(grantId)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));

        List<GrantDocumentItemDto> items = requirementsParserService.parse(grant.getRequirements());
        items = grantFormMatchingService.enrichItems(grant, items);
        List<String> grantAttachmentUrls = grantFormMatchingService.extractAttachmentUrls(grant);
        List<OfficialFormEntryDto> recommendedOfficialForms = grantFormMatchingService.recommendedForms(grant);
        UserGrantChecklist saved = userId != null
                ? checklistRepository.findByUserIdAndGrantId(userId, grantId).orElse(null)
                : null;

        List<String> checkedKeys = saved != null ? readCheckedKeys(saved.getCheckedKeysJson()) : List.of();
        Map<String, Long> attachments = saved != null ? readAttachments(saved.getAttachmentsJson()) : Map.of();

        return GrantChecklistResponse.builder()
                .grantId(grantId)
                .grantTitle(grant.getTitle())
                .grantSource(grant.getSource())
                .grantUrl(grant.getUrl())
                .requirementsRaw(grant.getRequirements())
                .items(items)
                .checkedKeys(checkedKeys)
                .attachments(attachments)
                .grantAttachmentUrls(grantAttachmentUrls)
                .recommendedOfficialForms(recommendedOfficialForms)
                .totalCount(items.size())
                .checkedCount(checkedKeys.size())
                .build();
    }

    @Transactional
    public GrantChecklistResponse updateChecklist(Long grantId, Long userId, UpdateGrantChecklistRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        planService.assertCanSaveChecklist(user);

        grantNoticeRepository.findById(grantId)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));

        UserGrantChecklist checklist = checklistRepository.findByUserIdAndGrantId(userId, grantId)
                .orElseGet(() -> UserGrantChecklist.builder()
                        .userId(userId)
                        .grantId(grantId)
                        .build());

        if (request.getCheckedKeys() != null) {
            checklist.setCheckedKeysJson(writeJson(request.getCheckedKeys()));
        }
        if (request.getAttachments() != null) {
            checklist.setAttachmentsJson(writeJson(request.getAttachments()));
        }

        checklistRepository.save(checklist);
        return getChecklist(grantId, userId);
    }

    private List<String> readCheckedKeys(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private Map<String, Long> readAttachments(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Long>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException("체크리스트 저장에 실패했습니다.", e);
        }
    }
}
