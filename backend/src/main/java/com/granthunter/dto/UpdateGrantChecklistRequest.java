package com.granthunter.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class UpdateGrantChecklistRequest {
    private List<String> checkedKeys;
    private Map<String, Long> attachments;
}
