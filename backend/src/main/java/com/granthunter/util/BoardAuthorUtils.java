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
        if (value.contains("@")) {
            int at = value.indexOf('@');
            if (at <= 0) {
                return "***" + value.substring(at);
            }
            return value.charAt(0) + "***" + value.substring(at);
        }
        int len = value.length();
        if (len == 1) {
            return value;
        }
        if (len == 2) {
            return value.charAt(0) + "*";
        }
        return value.charAt(0) + "*".repeat(len - 2) + value.charAt(len - 1);
    }
}
