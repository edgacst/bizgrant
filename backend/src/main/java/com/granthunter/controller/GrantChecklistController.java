package com.granthunter.controller;

import com.granthunter.dto.GrantChecklistResponse;
import com.granthunter.dto.UpdateGrantChecklistRequest;
import com.granthunter.service.GrantChecklistService;
import com.granthunter.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grants")
@RequiredArgsConstructor
@Tag(name = "공고 서류")
public class GrantChecklistController {

    private final GrantChecklistService grantChecklistService;

    @GetMapping("/{grantId}/checklist")
    @Operation(summary = "공고별 필요 서류 및 체크리스트")
    public ResponseEntity<GrantChecklistResponse> getChecklist(
            @PathVariable Long grantId,
            Authentication authentication) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() != null) {
            userId = Long.parseLong(authentication.getPrincipal().toString());
        }
        return ResponseEntity.ok(grantChecklistService.getChecklist(grantId, userId));
    }

    @PutMapping("/{grantId}/checklist")
    @Operation(summary = "체크리스트 저장")
    public ResponseEntity<GrantChecklistResponse> updateChecklist(
            @PathVariable Long grantId,
            Authentication authentication,
            @RequestBody UpdateGrantChecklistRequest request) {
        Long userId = AuthUtils.requireUserId(authentication);
        return ResponseEntity.ok(grantChecklistService.updateChecklist(grantId, userId, request));
    }
}
