package com.granthunter.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String companyName;
    private String bizNumber;
    private String industry;
    private String companySize;
}
