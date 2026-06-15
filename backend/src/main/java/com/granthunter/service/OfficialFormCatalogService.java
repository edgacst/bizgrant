package com.granthunter.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.granthunter.dto.OfficialFormEntryDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OfficialFormCatalogService {

    private final ObjectMapper objectMapper;
    private List<OfficialFormEntryDto> catalog = List.of();

    @PostConstruct
    void loadCatalog() throws IOException {
        ClassPathResource resource = new ClassPathResource("official-forms.json");
        try (InputStream inputStream = resource.getInputStream()) {
            catalog = objectMapper.readValue(inputStream, new TypeReference<List<OfficialFormEntryDto>>() {});
        }
    }

    public List<OfficialFormEntryDto> getAll() {
        return catalog;
    }

    public OfficialFormEntryDto findByCode(String code) {
        if (code == null) {
            return null;
        }
        return catalog.stream()
                .filter(entry -> code.equalsIgnoreCase(entry.getCode()))
                .findFirst()
                .orElse(null);
    }

    public List<OfficialFormEntryDto> findForGrant(String source, String category) {
        String normalizedSource = normalize(source);
        String normalizedCategory = normalize(category);
        List<OfficialFormEntryDto> matches = new ArrayList<>();

        for (OfficialFormEntryDto entry : catalog) {
            if (matchesSource(entry, normalizedSource) && matchesCategory(entry, normalizedCategory)) {
                matches.add(entry);
            }
        }

        if (matches.isEmpty()) {
            for (OfficialFormEntryDto entry : catalog) {
                if (matchesSource(entry, normalizedSource)) {
                    matches.add(entry);
                }
            }
        }

        return matches.stream()
                .sorted(Comparator.comparing(OfficialFormEntryDto::getName))
                .toList();
    }

    public OfficialFormEntryDto findBestMatch(String source, String category, String documentType) {
        String normalizedSource = normalize(source);
        String normalizedCategory = normalize(category);
        String normalizedType = normalize(documentType);

        return catalog.stream()
                .filter(entry -> entry.getDocumentTypes() != null
                        && entry.getDocumentTypes().stream().anyMatch(type -> normalize(type).equals(normalizedType)))
                .sorted(Comparator
                        .comparingInt((OfficialFormEntryDto entry) -> score(entry, normalizedSource, normalizedCategory))
                        .reversed())
                .findFirst()
                .orElse(null);
    }

    private int score(OfficialFormEntryDto entry, String source, String category) {
        int score = 0;
        if (matchesSource(entry, source)) {
            score += 10;
        }
        if (matchesCategory(entry, category)) {
            score += 5;
        }
        return score;
    }

    private boolean matchesSource(OfficialFormEntryDto entry, String source) {
        if (source == null || source.isBlank() || entry.getSources() == null) {
            return false;
        }
        return entry.getSources().stream().anyMatch(item -> normalize(item).equals(source));
    }

    private boolean matchesCategory(OfficialFormEntryDto entry, String category) {
        if (category == null || category.isBlank() || entry.getCategories() == null || entry.getCategories().isEmpty()) {
            return true;
        }
        return entry.getCategories().stream().anyMatch(item -> category.contains(normalize(item))
                || normalize(item).contains(category));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
