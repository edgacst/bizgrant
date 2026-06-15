package com.granthunter.controller;

import com.granthunter.dto.PlanInfoResponse;
import com.granthunter.service.AuthenticatedUserResolver;
import com.granthunter.service.PlanService;
import com.granthunter.plan.PlanType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
@Tag(name = "요금제")
public class PlanController {

    private final PlanService planService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    @GetMapping
    @Operation(summary = "현재 플랜 및 한도")
    public ResponseEntity<PlanInfoResponse> getPlan(Authentication auth) {
        Long userId = resolveOptionalUserId(auth);
        if (userId == null) {
            PlanInfoResponse free = PlanInfoResponse.builder()
                    .plan(PlanType.FREE.getCode())
                    .planLabel(PlanType.FREE.getLabel())
                    .limits(PlanInfoResponse.toLimitsDto(com.granthunter.plan.PlanLimits.forPlan(PlanType.FREE)))
                    .build();
            return ResponseEntity.ok(free);
        }
        return ResponseEntity.ok(planService.getPlanInfo(userId));
    }

    private Long resolveOptionalUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        try {
            return authenticatedUserResolver.resolveUser(Long.parseLong(auth.getName())).getId();
        } catch (Exception e) {
            return null;
        }
    }
}
