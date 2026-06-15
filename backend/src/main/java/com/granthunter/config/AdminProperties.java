package com.granthunter.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "app.admin")
public class AdminProperties {

    private List<String> emails = new ArrayList<>(List.of("freecompr20@gmail.com"));
    private String initialPassword = "BizGrant2026!";
    private String initialName = "관리자";
    private String initialCompany = "에드가씨에스티";
}
