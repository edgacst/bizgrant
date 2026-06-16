package com.granthunter.controller;

import com.granthunter.service.SeoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "SEO")
public class SeoController {

    private final SeoService seoService;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "사이트맵 XML")
    public ResponseEntity<String> sitemap() {
        return ResponseEntity.ok(seoService.buildSitemapXml());
    }
}
