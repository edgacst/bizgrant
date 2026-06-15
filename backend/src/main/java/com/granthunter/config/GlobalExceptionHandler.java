package com.granthunter.config;

import com.granthunter.exception.PlanLimitException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = "데이터 저장 중 제약 조건 오류가 발생했습니다.";
        if (ex.getMessage() != null && ex.getMessage().contains("bookmarks")) {
            message = "북마크 저장에 실패했습니다. 공고 정보를 확인해주세요.";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
    }

    @ExceptionHandler(PlanLimitException.class)
    public ResponseEntity<Map<String, String>> handlePlanLimit(PlanLimitException ex) {
        Map<String, String> body = new java.util.LinkedHashMap<>();
        body.put("message", ex.getMessage());
        if (ex.getPlan() != null) {
            body.put("plan", ex.getPlan());
        }
        if (ex.getRequiredPlan() != null) {
            body.put("requiredPlan", ex.getRequiredPlan());
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("message", "파일 크기는 20MB 이하여야 합니다."));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleIOException(IOException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "파일 처리 중 오류가 발생했습니다."));
    }
}
