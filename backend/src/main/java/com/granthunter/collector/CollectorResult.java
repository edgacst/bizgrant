package com.granthunter.collector;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CollectorResult {
    private GrantSource source;
    private int fetched;
    private int created;
    private int updated;
    private int skipped;
    private int failed;
    private String message;

    public int getProcessed() {
        return created + updated;
    }
}
