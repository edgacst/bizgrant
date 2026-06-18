package com.granthunter.util;

public final class BoardAuthorUtils {

    private BoardAuthorUtils() {
    }

    /** 게시판·댓글 노출용 작성자명 (가운데 글자 마스킹) */
    public static String maskDisplayName(String name) {
        if (name == null || name.isBlank()) {
            return "익명";
        }
        String value = name.trim();
        if (value.contains("*")) {
            return value;
        }
        if (value.contains("@")) {
            int at = value.indexOf('@');
            if (at <= 0) {
                return "***" + value.substring(at);
            }
            return value.charAt(0) + "***" + value.substring(at);
        }
        int len = value.codePointCount(0, value.length());
        if (len <= 1) {
            return value;
        }
        if (len == 2) {
            int firstEnd = value.offsetByCodePoints(0, 1);
            return value.substring(0, firstEnd) + "*";
        }
        int firstEnd = value.offsetByCodePoints(0, 1);
        int lastStart = value.offsetByCodePoints(0, len - 1);
        String stars = "*".repeat(len - 2);
        return value.substring(0, firstEnd) + stars + value.substring(lastStart);
    }

    public static String maskForStorage(String rawName) {
        return maskDisplayName(rawName);
    }
}
