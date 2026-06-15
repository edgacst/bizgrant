package com.granthunter.service;

import com.granthunter.dto.DocumentTemplateDto;
import com.granthunter.dto.OfficialFormEntryDto;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.User;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentTemplateService {

    private final UserRepository userRepository;
    private final OfficialFormCatalogService officialFormCatalogService;
    private final GrantNoticeRepository grantNoticeRepository;
    private final GrantFormMatchingService grantFormMatchingService;
    private final PlanService planService;

    private static final List<DocumentTemplateDto> GENERIC_TEMPLATES = List.of(
            template("BUSINESS_PLAN", "사업계획서(기본)", "지원사업 신청용 기본 사업계획서", "BUSINESS_PLAN", true),
            template("FINANCIAL", "재무제표(기본)", "최근 2개년 재무제표 작성 양식", "FINANCIAL", true),
            template("TAX", "세금증명(기본)", "국세·지방세 완납 증명 안내", "TAX", true),
            template("INSURANCE", "4대보험(기본)", "4대보험료 완납 증명 안내", "INSURANCE", true),
            template("APPLICATION", "신청서(기본)", "일반 지원사업 신청서", "APPLICATION", true)
    );

    public List<DocumentTemplateDto> listTemplates(Long grantId) {
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        List<DocumentTemplateDto> result = new ArrayList<>();

        if (grantId != null) {
            grantNoticeRepository.findById(grantId).ifPresent(grant -> {
                for (OfficialFormEntryDto entry : grantFormMatchingService.recommendedForms(grant)) {
                    if (seen.add(entry.getCode())) {
                        result.add(toTemplateDto(entry));
                    }
                }
            });
        }

        for (OfficialFormEntryDto entry : officialFormCatalogService.getAll()) {
            if (seen.add(entry.getCode())) {
                result.add(toTemplateDto(entry));
            }
        }

        for (DocumentTemplateDto generic : GENERIC_TEMPLATES) {
            if (seen.add(generic.getCode())) {
                result.add(generic);
            }
        }

        return result;
    }

    public DocumentTemplateDto resolveTemplate(String code) {
        OfficialFormEntryDto official = officialFormCatalogService.findByCode(code);
        if (official != null) {
            return toTemplateDto(official);
        }
        return GENERIC_TEMPLATES.stream()
                .filter(template -> template.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("템플릿을 찾을 수 없습니다."));
    }

    public Resource downloadTemplate(String code, String format, Long userId, Long grantId) throws IOException {
        DocumentTemplateDto template = resolveTemplate(code);
        OfficialFormEntryDto official = officialFormCatalogService.findByCode(code);
        String normalizedFormat = format == null ? "docx" : format.toLowerCase();
        String variant = resolveVariant(official, template.getCode(), grantId);

        if ("hwp".equals(normalizedFormat)) {
            return loadHwpTemplate(code, official, template);
        }

        Map<String, String> fields = Map.of();
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && planService.limitsFor(user).templateAutofillEnabled()) {
                fields = buildProfileFields(userId);
            }
        }
        byte[] docx = generateDocx(template, variant, fields, grantId);
        String filename = code.toLowerCase() + "-template.docx";
        return new ByteArrayResource(docx) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
    }

    private String resolveVariant(OfficialFormEntryDto official, String fallbackCode, Long grantId) {
        if (official != null && official.getDocxVariant() != null) {
            return official.getDocxVariant();
        }
        if (grantId != null) {
            GrantNotice grant = grantNoticeRepository.findById(grantId).orElse(null);
            if (grant != null) {
                OfficialFormEntryDto matched = officialFormCatalogService.findBestMatch(
                        grant.getSource(),
                        grant.getCategory(),
                        fallbackCode.contains("_") ? fallbackCode.substring(fallbackCode.lastIndexOf('_') + 1) : fallbackCode
                );
                if (matched != null && matched.getDocxVariant() != null) {
                    return matched.getDocxVariant();
                }
            }
        }
        return fallbackCode;
    }

    private Resource loadHwpTemplate(String code, OfficialFormEntryDto official, DocumentTemplateDto template) throws IOException {
        String[] candidates = {
                "templates/official/" + code.toLowerCase() + ".hwp",
                "templates/hwp/" + code.toLowerCase() + ".hwp"
        };
        for (String resourcePath : candidates) {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            if (resource.exists()) {
                return resource;
            }
        }

        if (official != null && official.getHwpOfficialUrl() != null) {
            throw new IllegalArgumentException("HWP 공식 양식은 기관 사이트에서 받을 수 있습니다: " + official.getHwpOfficialUrl());
        }

        byte[] rtf = generateRtfTemplate(template, official);
        return new ByteArrayResource(rtf) {
            @Override
            public String getFilename() {
                return code.toLowerCase() + "-template.hwp";
            }
        };
    }

    private DocumentTemplateDto toTemplateDto(OfficialFormEntryDto entry) {
        String type = entry.getDocumentTypes() != null && !entry.getDocumentTypes().isEmpty()
                ? entry.getDocumentTypes().get(0)
                : "OTHER";
        return DocumentTemplateDto.builder()
                .code(entry.getCode())
                .name(entry.getName())
                .description(entry.getSourceLabel() + " 공식 양식 · 자동완성 DOCX 제공")
                .type(type)
                .autoFillSupported(true)
                .officialUrl(entry.getOfficialUrl())
                .hwpOfficialUrl(entry.getHwpOfficialUrl())
                .sourceLabel(entry.getSourceLabel())
                .build();
    }

    private Map<String, String> buildProfileFields(Long userId) {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("companyName", "");
        fields.put("bizNumber", "");
        fields.put("ceoName", "");
        fields.put("phone", "");
        fields.put("industry", "");
        fields.put("companySize", "");
        fields.put("email", "");

        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> fillUserFields(fields, user));
        }
        return fields;
    }

    private void fillUserFields(Map<String, String> fields, User user) {
        fields.put("companyName", nullToEmpty(user.getCompanyName()));
        fields.put("bizNumber", formatBizNumber(user.getBizNumber()));
        fields.put("ceoName", nullToEmpty(user.getName()));
        fields.put("phone", nullToEmpty(user.getPhone()));
        fields.put("industry", nullToEmpty(user.getIndustry()));
        fields.put("companySize", nullToEmpty(user.getCompanySize()));
        fields.put("email", nullToEmpty(user.getEmail()));
    }

    private byte[] generateDocx(DocumentTemplateDto template, String variant, Map<String, String> fields, Long grantId)
            throws IOException {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            addTitle(document, template.getName());
            if (template.getSourceLabel() != null) {
                addParagraph(document, template.getSourceLabel() + " 연계 양식 · BizGrant 자동완성");
            } else {
                addParagraph(document, "BizGrant 자동완성 템플릿");
            }
            if (grantId != null) {
                grantNoticeRepository.findById(grantId).ifPresent(grant ->
                        addParagraph(document, "대상 공고: " + grant.getTitle()));
            }
            addBlankLine(document);

            switch (variant) {
                case "MSS_BUSINESS_PLAN", "KSTARTUP_BUSINESS_PLAN", "BUSINESS_PLAN" -> writeBusinessPlan(document, fields, variant);
                case "MSS_FINANCIAL", "FINANCIAL" -> writeFinancial(document, fields, variant);
                case "BIZINFO_TAX", "TAX" -> writeTax(document, fields);
                case "MSS_INSURANCE", "INSURANCE" -> writeInsurance(document, fields);
                case "KSTARTUP_APPLICATION", "MSS_APPLICATION", "APPLICATION" -> writeApplication(document, fields, variant);
                case "BIZINFO_CERTIFICATE" -> writeCertificate(document, fields);
                default -> addParagraph(document, "작성 항목을 입력하세요.");
            }

            document.write(out);
            return out.toByteArray();
        }
    }

    private void writeBusinessPlan(XWPFDocument document, Map<String, String> fields, String variant) {
        addSection(document, variant.startsWith("KSTARTUP") ? "K-Startup 사업화계획서" : "중소벤처기업부 R&D 사업계획서");
        addField(document, "회사명", fields.get("companyName"));
        addField(document, "대표자", fields.get("ceoName"));
        addField(document, "사업자번호", fields.get("bizNumber"));
        addField(document, "업종", fields.get("industry"));
        addField(document, "기업규모", fields.get("companySize"));
        addField(document, "연락처", fields.get("phone"));
        addSection(document, "1. 사업 목적 및 필요성");
        addParagraph(document, "(작성)");
        addSection(document, "2. 사업 내용 및 추진 방법");
        addParagraph(document, "(작성)");
        addSection(document, "3. 추진 일정");
        addParagraph(document, "(작성)");
        addSection(document, "4. 기대 효과");
        addParagraph(document, "(작성)");
    }

    private void writeFinancial(XWPFDocument document, Map<String, String> fields, String variant) {
        addSection(document, variant.startsWith("MSS") ? "중소기업 재무제표 제출 양식" : "재무제표 요약");
        addField(document, "회사명", fields.get("companyName"));
        addField(document, "사업자번호", fields.get("bizNumber"));
        addParagraph(document, "※ 최근 2개년 재무상태표·손익계산서를 첨부하세요.");
        addParagraph(document, "항목 | 전전기 | 전기");
        addParagraph(document, "매출액 |  |  ");
        addParagraph(document, "영업이익 |  |  ");
        addParagraph(document, "당기순이익 |  |  ");
    }

    private void writeTax(XWPFDocument document, Map<String, String> fields) {
        addSection(document, "국세·지방세 완납 증명");
        addField(document, "회사명", fields.get("companyName"));
        addField(document, "사업자번호", fields.get("bizNumber"));
        addParagraph(document, "□ 국세 완납증명서 (홈택스 발급)");
        addParagraph(document, "□ 지방세 완납증명서 (위택스 발급)");
    }

    private void writeInsurance(XWPFDocument document, Map<String, String> fields) {
        addSection(document, "4대보험 완납증명");
        addField(document, "회사명", fields.get("companyName"));
        addField(document, "사업자번호", fields.get("bizNumber"));
        addParagraph(document, "□ 국민연금 □ 건강보험 □ 고용보험 □ 산재보험");
    }

    private void writeApplication(XWPFDocument document, Map<String, String> fields, String variant) {
        addSection(document, variant.startsWith("KSTARTUP") ? "K-Startup 지원사업 신청서" : "지원사업 신청서");
        addField(document, "신청기업", fields.get("companyName"));
        addField(document, "대표자", fields.get("ceoName"));
        addField(document, "사업자번호", fields.get("bizNumber"));
        addField(document, "업종", fields.get("industry"));
        addField(document, "연락처", fields.get("phone"));
        addField(document, "이메일", fields.get("email"));
        addSection(document, "신청 사유");
        addParagraph(document, "(작성)");
    }

    private void writeCertificate(XWPFDocument document, Map<String, String> fields) {
        addSection(document, "증명서류 체크리스트");
        addField(document, "회사명", fields.get("companyName"));
        addField(document, "사업자번호", fields.get("bizNumber"));
        addParagraph(document, "□ 사업자등록증 사본");
        addParagraph(document, "□ 법인등기부등본(해당 시)");
        addParagraph(document, "□ 중소기업·벤처 확인서(해당 시)");
    }

    private byte[] generateRtfTemplate(DocumentTemplateDto template, OfficialFormEntryDto official) {
        String source = official != null ? official.getSourceLabel() : "BizGrant";
        String content = template.getName() + " 양식\\par "
                + source + " 연계 양식입니다.\\par "
                + "회사명: \\par 대표자: \\par 사업자번호: \\par "
                + "작성 내용을 입력하세요.";
        return ("{\\rtf1\\ansi\\deff0 " + content + "}").getBytes(StandardCharsets.UTF_8);
    }

    private void addTitle(XWPFDocument document, String text) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun run = paragraph.createRun();
        run.setBold(true);
        run.setFontSize(16);
        run.setText(text);
    }

    private void addSection(XWPFDocument document, String text) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setBold(true);
        run.setFontSize(12);
        run.setText(text);
    }

    private void addField(XWPFDocument document, String label, String value) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText(label + " : " + (value == null || value.isBlank() ? "(작성)" : value));
    }

    private void addParagraph(XWPFDocument document, String text) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText(text);
    }

    private void addBlankLine(XWPFDocument document) {
        document.createParagraph();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String formatBizNumber(String bizNumber) {
        if (bizNumber == null || bizNumber.length() != 10) {
            return nullToEmpty(bizNumber);
        }
        return bizNumber.substring(0, 3) + "-" + bizNumber.substring(3, 5) + "-" + bizNumber.substring(5);
    }

    private static DocumentTemplateDto template(String code, String name, String description, String type, boolean autoFill) {
        return DocumentTemplateDto.builder()
                .code(code)
                .name(name)
                .description(description)
                .type(type)
                .autoFillSupported(autoFill)
                .build();
    }
}
