package com.granthunter.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.newsletter")
public class NewsletterProperties {
    private boolean enabled = true;
    private String cron = "0 0 9 * * MON";
    private String from = "noreply@bizgrant.kr";
    private String siteUrl = "http://localhost:3000";
    private int topCount = 10;
    private int urgentCount = 5;
    private int lookbackDays = 7;
}
