package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 정보 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String companyName;
    private String bizNumber;
    private String industry;
    private String companySize;
    private String plan;
    private String role;
}
