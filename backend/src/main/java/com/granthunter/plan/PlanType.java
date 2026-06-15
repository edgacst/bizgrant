package com.granthunter.plan;

import java.util.Locale;

public enum PlanType {
    FREE("free", "Free"),
    PRO("pro", "Pro"),
    ENTERPRISE("enterprise", "Enterprise"),
    ADMIN("admin", "Admin");

    private final String code;
    private final String label;

    PlanType(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static PlanType fromCode(String raw) {
        if (raw == null || raw.isBlank()) {
            return FREE;
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "pro" -> PRO;
            case "enterprise" -> ENTERPRISE;
            case "admin" -> ADMIN;
            default -> FREE;
        };
    }

    public boolean isAtLeast(PlanType other) {
        return this.ordinal() >= other.ordinal() || this == ADMIN;
    }
}
