import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

// ── 실제 정부지원 공고 샘플 데이터 (2026년 기준, 정부 공식 발표자료에서 수집) ──
const grants = [
  // ═══════════ R&D/기술 분야 (9건) ═══════════
  {
    id: 1,
    title: '중소기업 기술혁신개발사업',
    organization: '중소벤처기업부',
    category: 'R&D',
    applyStart: '2026-04-01',
    applyEnd: '2026-09-15',
    budget: '최대 4.5억원 (총 예산 3,500억원)',
    eligibility: '중소기업기본법 제2조에 따른 중소기업\n기업부설연구소 또는 연구개발전담부서 보유\n최근 3년간 정부 R&D 과제 참여제한 대상이 아닌 기업',
    requirements: '사업계획서, R&D 과제기획서, 연구원 이력서, 재무제표, 사업자등록증',
    content: '중소기업의 기술혁신 역량 강화를 위해 시장 지향형 R&D 과제의 기획·개발을 최대 4.5억원까지 지원하는 대표적인 기술혁신 지원사업입니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 2,
    title: '소재부품기술개발사업',
    organization: '산업통상자원부',
    category: 'R&D',
    applyStart: '2026-05-15',
    applyEnd: '2026-10-30',
    budget: '최대 15억원 (총 예산 5,000억원)',
    eligibility: '소재·부품·장비 분야 중소·중견기업\n국내 제조시설 보유 기업\n수요기업-공급기업 컨소시엄 구성 가능',
    requirements: 'R&D 사업계획서, 기술개발계획서, 수요처 확인서, 재무제표',
    content: '소재·부품·장비 산업의 기술 자립화와 글로벌 공급망 안정화를 위한 핵심 기술개발을 지원합니다.',
    originalUrl: 'https://www.motie.go.kr'
  },
  {
    id: 3,
    title: '중소기업 R&D 역량강화 바우처',
    organization: '중소벤처기업부',
    category: 'R&D',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-31',
    budget: '최대 5천만원',
    eligibility: '중소기업기본법상 중소기업\nR&D 역량 진단 결과 개선 필요 기업\n기술 컨설팅 및 연구장비 활용 희망 기업',
    requirements: '사업계획서, R&D 역량진단보고서, 사업자등록증',
    content: '중소기업이 필요로 하는 R&D 서비스를 바우처 형태로 자유롭게 선택·활용할 수 있는 수요자 맞춤형 지원사업입니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 4,
    title: '규제자유특구 혁신사업',
    organization: '중소벤처기업부',
    category: 'R&D',
    applyStart: '2026-06-01',
    applyEnd: '2026-11-15',
    budget: '최대 30억원',
    eligibility: '규제자유특구 내 사업자\n신기술 실증 및 사업화 계획 보유\n특구사업자 등록 완료',
    requirements: '사업계획서, 특구사업자 등록증, 실증계획서, 안전성 검증자료',
    content: '규제자유특구 내에서 신기술·신제품의 실증과 사업화를 위한 혁신 과제를 대규모로 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 5,
    title: '산업융합 혁신기술개발',
    organization: '산업통상자원부',
    category: 'R&D',
    applyStart: '2026-04-15',
    applyEnd: '2026-10-15',
    budget: '최대 20억원 (총 예산 2,000억원)',
    eligibility: '산업융합 분야(제조-IT, 바이오-전자 등) 기업\nR&D 전담부서 및 박사급 연구인력 보유\n산업융합촉진법상 융합신제품 인증 기업 우대',
    requirements: 'R&D 과제제안서, 융합기술 로드맵, IP 보유현황, 재무제표',
    content: '이종 산업 간 융합을 통한 신시장 창출형 혁신기술 개발을 최대 20억원까지 지원하는 대형 R&D 사업입니다.',
    originalUrl: 'https://www.motie.go.kr'
  },
  {
    id: 6,
    title: '중소기업 융복합기술개발사업',
    organization: '중소벤처기업부',
    category: 'R&D',
    applyStart: '2026-03-15',
    applyEnd: '2026-08-15',
    budget: '최대 2억원',
    eligibility: '중소기업기본법상 중소기업\n이종 기술 융복합 과제 수행 역량 보유\n기술개발 완료 후 1년 이내 사업화 계획 필수',
    requirements: '융복합기술개발계획서, 사업화계획서, 특허출원 증빙',
    content: '중소기업의 이종 기술 융복합을 통한 신제품·신서비스 개발과 조기 사업화를 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 7,
    title: 'ICT R&D 기술개발지원',
    organization: '과학기술정보통신부',
    category: 'R&D',
    applyStart: '2026-04-01',
    applyEnd: '2026-09-30',
    budget: '최대 10억원',
    eligibility: 'ICT 분야 중소·중견기업\nAI, 빅데이터, 클라우드, IoT, 5G/6G 등 ICT 기술 보유\n기업부설연구소 운영 1년 이상',
    requirements: 'ICT R&D 제안서, 기술특허 목록, 연구실적 증빙, 재무제표',
    content: 'AI·빅데이터·클라우드·차세대통신 등 ICT 핵심기술의 연구개발과 상용화를 지원합니다.',
    originalUrl: 'https://www.msit.go.kr'
  },
  {
    id: 8,
    title: '바이오헬스 R&D 지원',
    organization: '보건복지부',
    category: 'R&D',
    applyStart: '2026-06-15',
    applyEnd: '2026-11-30',
    budget: '최대 8억원',
    eligibility: '바이오헬스 분야 기업\n의약품, 의료기기, 디지털헬스 등 연구개발 실적 보유\n식약처 임상시험 승인 또는 계획 보유 기업 우대',
    requirements: '바이오헬스 R&D 계획서, 임상시험계획서(IND), 특허 리스트, 재무제표',
    content: '바이오헬스 분야 신약·의료기기·디지털헬스 기술의 연구개발과 글로벌 시장 진출을 지원합니다.',
    originalUrl: 'https://www.mohw.go.kr'
  },
  {
    id: 9,
    title: '탄소중립 기술혁신 R&D',
    organization: '환경부',
    category: 'R&D',
    applyStart: '2026-07-01',
    applyEnd: '2026-12-15',
    budget: '최대 25억원 (총 예산 3,000억원)',
    eligibility: '탄소중립 기술 분야 기업\nCCUS, 수소, 재생에너지, 에너지효율화 등 그린기술 보유\n온실가스 배출권 거래제 참여 기업 우대',
    requirements: '탄소중립 기술 R&D 계획서, 온실가스 배출량 보고서, 환경영향평가서, 재무제표',
    content: '2050 탄소중립 목표 달성을 위한 CCUS·수소·에너지효율화 등 핵심 그린기술 R&D를 대규모 지원합니다.',
    originalUrl: 'https://www.me.go.kr'
  },

  // ═══════════ 창업 분야 (6건) ═══════════
  {
    id: 10,
    title: '창업성공패키지 (청년창업사관학교)',
    organization: '창업진흥원',
    category: '창업',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-31',
    budget: '최대 1억원 (사업화 자금 + 멘토링)',
    eligibility: '만 39세 이하 청년 예비창업자 또는 창업 3년 미만 기업\n기술창업 아이템 보유\n전국 18개 청년창업사관학교 입교',
    requirements: '사업계획서, 창업아이템 소개서, 대표자 이력서, 시장조사 보고서',
    content: '유망 기술창업 아이템을 보유한 청년 창업자에게 사업화 자금과 창업교육·멘토링을 패키지로 지원하는 대표 창업 프로그램입니다.',
    originalUrl: 'https://www.kised.or.kr'
  },
  {
    id: 11,
    title: '초기창업패키지',
    organization: '창업진흥원',
    category: '창업',
    applyStart: '2026-04-01',
    applyEnd: '2026-09-30',
    budget: '최대 1억원 (시제품 제작 + 마케팅)',
    eligibility: '창업 3년 미만 초기기업\n창업아이템의 시장성·기술성 검증 완료\n주관기관(창업지원기관)을 통한 신청',
    requirements: '사업계획서, 시제품 계획서, 창업팀 구성 현황, 지식재산권 증빙',
    content: '초기 창업기업의 시제품 제작, 마케팅, 투자유치 등 성장 단계별 맞춤형 지원을 제공합니다.',
    originalUrl: 'https://www.kised.or.kr'
  },
  {
    id: 12,
    title: 'TIPS (민간투자연계형 기술창업지원)',
    organization: '중소벤처기업부',
    category: '창업',
    applyStart: '2026-05-01',
    applyEnd: '2026-10-31',
    budget: '최대 5억원 (R&D 자금 2억 + 사업화 1억 + 후속 투자 연계)',
    eligibility: 'TIPS 운영사로부터 1억원 이상 투자 유치 완료\n기술창업 분야 7년 미만 기업\n운영사 추천 필수',
    requirements: 'TIPS 운영사 추천서, 투자계약서, 사업계획서, 기술설명서',
    content: '민간 투자사가 발굴한 유망 기술창업 기업에 정부가 R&D 자금을 매칭 지원하는 글로벌 스타트업 육성 프로그램입니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 13,
    title: '사회적기업가 육성사업',
    organization: '한국사회적기업진흥원',
    category: '창업',
    applyStart: '2026-02-01',
    applyEnd: '2026-07-31',
    budget: '최대 1억원 (창업공간 + 사업비 + 멘토링)',
    eligibility: '사회적 목적 실현을 위한 창업 아이디어 보유자\n사회적기업 창업을 희망하는 예비창업자\n사회적경제 분야 창업교육 수료자 우대',
    requirements: '사회적기업 창업계획서, 사회적가치 측정계획서, 대표자 이력서',
    content: '사회문제 해결을 위한 사회적기업 창업 아이디어를 발굴하고 창업부터 성장까지 전 과정을 지원합니다.',
    originalUrl: 'https://www.socialenterprise.or.kr'
  },
  {
    id: 14,
    title: '제조창업혁신랩',
    organization: '중소벤처기업부',
    category: '창업',
    applyStart: '2026-03-15',
    applyEnd: '2026-08-15',
    budget: '최대 3천만원 (시제품 제작 지원)',
    eligibility: '제조업 분야 예비창업자 또는 창업 3년 미만 기업\n시제품 제작이 필요한 아이디어 보유\n제조창업혁신랩 입주 승인',
    requirements: '시제품 제작계획서, 아이디어 스케치/도면, 사업자등록증(법인 설립 시)',
    content: '제조창업자의 혁신 아이디어를 시제품으로 제작할 수 있도록 3D프린터·레이저가공기 등 제작인프라와 자금을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 15,
    title: '소상공인 재창업 도전장려금',
    organization: '소상공인시장진흥공단',
    category: '창업',
    applyStart: '2026-07-15',
    applyEnd: '2026-12-31',
    budget: '최대 2천만원',
    eligibility: '폐업(예정) 소상공인\n재창업 교육 수료자\n희망리턴패키지 경영진단 완료자',
    requirements: '재창업계획서, 폐업증명원(또는 폐업예정확인서), 재창업교육 수료증',
    content: '폐업 소상공인의 재기를 지원하기 위해 재창업 희망자에게 도전장려금과 교육·컨설팅을 제공합니다.',
    originalUrl: 'https://www.semas.or.kr'
  },

  // ═══════════ 수출 분야 (6건) ═══════════
  {
    id: 16,
    title: '글로벌 강소기업 육성',
    organization: '중소벤처기업부',
    category: '수출',
    applyStart: '2026-03-15',
    applyEnd: '2026-09-30',
    budget: '최대 2억원 (해외마케팅 + R&D 연계)',
    eligibility: '직전년도 수출액 100만불~5천만불 중소기업\n수출 비중 10% 이상\n글로벌 강소기업 지정 기업 또는 신청 기업',
    requirements: '수출실적증명서, 해외진출계획서, 재무제표, 사업계획서',
    content: '수출 유망 중소기업을 발굴하여 해외마케팅·R&D 연계 지원을 통해 글로벌 전문기업으로 육성합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 17,
    title: '수출바우처 사업',
    organization: 'KOTRA',
    category: '수출',
    applyStart: '2026-02-01',
    applyEnd: '2026-07-31',
    budget: '최대 3천만원 (바우처 70% + 자부담 30%)',
    eligibility: '중소·중견기업 중 전년도 수출실적 5천만불 미만\n수출바우처 수행기관이 제공하는 서비스 이용 가능 기업',
    requirements: '수출바우처 사업계획서, 수출실적증명서, 사업자등록증',
    content: '중소기업이 원하는 수출지원 서비스를 바우처 형태로 선택하여 해외전시회·바이어발굴·물류비 등을 자유롭게 이용할 수 있는 사업입니다.',
    originalUrl: 'https://www.kotra.or.kr'
  },
  {
    id: 18,
    title: '해외규격인증획득 지원사업',
    organization: 'KOTRA',
    category: '수출',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-31',
    budget: '최대 5천만원 (인증비용 70% 지원)',
    eligibility: '중소·중견기업\n해외 규격인증(CE, FDA, UL, CCC 등) 획득이 필요한 기업\n인증기관 견적서 보유',
    requirements: '인증획득계획서, 인증기관 견적서, 수출계획서, 사업자등록증',
    content: '중소기업의 해외시장 진출에 필수적인 해외 규격인증 획득 비용을 지원하여 수출 경쟁력을 강화합니다.',
    originalUrl: 'https://www.kotra.or.kr'
  },
  {
    id: 19,
    title: '수출컨소시엄 지원사업',
    organization: '중소벤처기업부',
    category: '수출',
    applyStart: '2026-04-15',
    applyEnd: '2026-10-15',
    budget: '최대 1억원 (컨소시엄당)',
    eligibility: '동종·유사업종 중소기업 5개사 이상 컨소시엄\n주관기관(중소기업중앙회 또는 협동조합) 주도\n해외 공동마케팅 수행 가능',
    requirements: '컨소시엄 구성 확인서, 공동 해외마케팅 계획서, 참여기업 명단, 주관기관 승인서',
    content: '중소기업들이 협동조합이나 중소기업중앙회를 중심으로 수출컨소시엄을 구성하여 공동 브랜드로 해외시장을 개척할 수 있도록 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 20,
    title: '해외지사화 지원사업',
    organization: 'KOTRA',
    category: '수출',
    applyStart: '2026-02-15',
    applyEnd: '2026-07-15',
    budget: '최대 2천만원 (연간 지사화 서비스 이용료)',
    eligibility: '중소·중견기업\n해외지사 설립 부담이 있는 수출 희망 기업\nKOTRA 해외무역관 서비스 지역 내',
    requirements: '해외지사화 신청서, 취급품목 설명서, 수출실적증명서(보유 시)',
    content: 'KOTRA 해외무역관을 중소기업의 해외지사처럼 활용할 수 있도록 현지 시장조사·바이어 발굴·거래처 관리 서비스를 제공합니다.',
    originalUrl: 'https://www.kotra.or.kr'
  },
  {
    id: 21,
    title: '수출기업 온라인마케팅 지원',
    organization: '중소벤처기업부',
    category: '수출',
    applyStart: '2026-04-01',
    applyEnd: '2026-09-15',
    budget: '최대 1천만원 (온라인 마케팅 비용)',
    eligibility: '중소기업\n아마존·알리바바·쇼피 등 글로벌 이커머스 플랫폼 입점 기업 또는 계획 보유\n자사 온라인몰 보유 기업 우대',
    requirements: '온라인수출 마케팅계획서, 취급제품 카탈로그, 이커머스 플랫폼 스토어 링크',
    content: '중소기업의 온라인 수출 활성화를 위해 글로벌 이커머스 플랫폼 입점·광고·콘텐츠 제작 비용을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },

  // ═══════════ 제조혁신 분야 (4건) ═══════════
  {
    id: 22,
    title: '스마트공장 구축지원',
    organization: '중소벤처기업부',
    category: '제조혁신',
    applyStart: '2026-05-01',
    applyEnd: '2026-11-30',
    budget: '최대 2억원 (정부보조 50%)',
    eligibility: '제조업 영위 중소·중견기업\n공장등록 완료 기업\n스마트공장 수준 확인(기초/중간1/중간2)',
    requirements: '공장등록증, 스마트공장 구축계획서, 제조현장 진단보고서, 재무제표',
    content: '중소 제조기업의 생산성 향상과 경쟁력 강화를 위해 IoT·AI·빅데이터 기반 스마트공장 구축을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 23,
    title: '중소기업 디지털 전환 지원',
    organization: '중소벤처기업부',
    category: '제조혁신',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-31',
    budget: '최대 5천만원 (디지털 전환 컨설팅 + 솔루션 도입)',
    eligibility: '중소기업\nERP·MES·CRM 등 디지털 솔루션 도입 희망 기업\n중소기업 디지털 전환 진단 완료 기업',
    requirements: '디지털전환 계획서, 디지털전환 진단보고서, 도입 희망 솔루션 견적서',
    content: '중소기업의 업무·생산·유통 전반의 디지털 전환을 위한 컨설팅과 솔루션 도입 비용을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 24,
    title: '뿌리기업 경쟁력 강화',
    organization: '국가뿌리산업진흥센터',
    category: '제조혁신',
    applyStart: '2026-05-15',
    applyEnd: '2026-10-31',
    budget: '최대 3억원 (공정혁신 + 자동화)',
    eligibility: '뿌리산업(주조·금형·소성가공·용접·열처리·표면처리) 영위 중소기업\n뿌리기업 확인서 보유\n공정 자동화·스마트화 계획 보유',
    requirements: '뿌리기업 확인서, 공정혁신 계획서, 설비 투자계획서, 재무제표',
    content: '제조업의 기반이 되는 뿌리산업 기업의 공정 자동화와 스마트화를 통해 글로벌 경쟁력을 강화합니다.',
    originalUrl: 'https://www.kpic.re.kr'
  },
  {
    id: 25,
    title: '제조데이터 활용 지원',
    organization: '한국산업기술진흥원',
    category: '제조혁신',
    applyStart: '2026-04-01',
    applyEnd: '2026-09-15',
    budget: '최대 1.5억원 (데이터 수집·분석 인프라 + AI 솔루션)',
    eligibility: '제조업 중소·중견기업\n제조데이터 수집·분석 인프라 구축 희망 기업\nAI 기반 품질예측·공정최적화 도입 계획 보유',
    requirements: '제조데이터 활용계획서, 공정 데이터 항목 정의서, AI 도입 로드맵, 재무제표',
    content: '제조기업이 생산현장 데이터를 수집·분석·활용하여 품질예측과 공정최적화를 실현할 수 있도록 지원합니다.',
    originalUrl: 'https://www.kiat.or.kr'
  },

  // ═══════════ 인력 분야 (5건) ═══════════
  {
    id: 26,
    title: '청년내일채움공제',
    organization: '중소벤처기업부',
    category: '인력',
    applyStart: '2026-01-01',
    applyEnd: '2026-12-31',
    budget: '2년간 1,200만원 적립 (정부지원 900만원 + 기업 300만원)',
    eligibility: '중소기업에 정규직 채용된 만 15세 이상 34세 이하 청년 근로자\n고용보험 가입 및 월 급여 230만원 이상\n중소기업기본법상 중소기업',
    requirements: '근로계약서, 고용보험 가입확인서, 급여지급 증빙',
    content: '중소기업 청년 근로자가 2년간 근속 시 정부·기업·근로자가 공동 적립한 1,200만원의 목돈을 지원하는 자산형성 프로그램입니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 27,
    title: '중소기업 인턴지원',
    organization: '중소벤처기업부',
    category: '인력',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-31',
    budget: '월 80만원 × 6개월 (총 480만원/인당)',
    eligibility: '중소기업기본법상 중소기업\n만 18세 이상 34세 이하 미취업 청년 인턴 채용\n인턴 종료 후 정규직 전환 계획 필수',
    requirements: '인턴계약서, 급여지급 증빙, 정규직 전환계획서, 사업자등록증',
    content: '중소기업이 청년을 인턴으로 채용하여 직무역량을 평가한 후 정규직 전환 시 인건비를 최대 6개월간 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 28,
    title: '지역주도형 청년일자리',
    organization: '행정안전부',
    category: '인력',
    applyStart: '2026-02-01',
    applyEnd: '2026-07-31',
    budget: '최대 2천만원 (인건비 + 직무교육)',
    eligibility: '지역 내 중소기업·사회적기업·협동조합\n만 18세~39세 지역 청년 채용\n지자체별 공고 확인 필수',
    requirements: '지역 청년 채용계획서, 직무교육 계획서, 사업자등록증, 지역거주 확인서',
    content: '지역 청년의 일자리 창출과 지역 정착을 위해 지자체 주도로 중소기업 청년 채용 인건비와 직무교육을 지원합니다.',
    originalUrl: 'https://www.mois.go.kr'
  },
  {
    id: 29,
    title: '산업맞춤형 인력양성',
    organization: '한국산업인력공단',
    category: '인력',
    applyStart: '2026-04-01',
    applyEnd: '2026-10-31',
    budget: '과정별 상이 (컨소시엄당 1억~5억원)',
    eligibility: '대학·훈련기관·기업 컨소시엄\n국가직무능력표준(NCS) 기반 교육과정 운영 가능\n산업계 수요 기반 맞춤형 교육 설계',
    requirements: '컨소시엄 협약서, 교육과정 설계서, 산업계 수요조사 보고서, 예산서',
    content: '산업 현장에서 필요로 하는 맞춤형 인재 양성을 위해 NCS 기반 교육과정 개발과 운영을 컨소시엄 형태로 지원합니다.',
    originalUrl: 'https://www.hrdkorea.or.kr'
  },
  {
    id: 30,
    title: '여성과학기술인 R&D 경력복귀',
    organization: '과학기술정보통신부',
    category: '인력',
    applyStart: '2026-04-15',
    applyEnd: '2026-09-30',
    budget: '최대 5천만원 (인건비 + 연구비)',
    eligibility: '이공계 전공 경력단절 여성\n이공계 학사 이상 학위 소지자\n경력복귀 의지 및 R&D 수행 역량 보유',
    requirements: '이공계 졸업증명서, 경력증명서, 연구계획서, 채용확정서(기업)',
    content: '출산·육아 등으로 경력이 단절된 여성과학기술인의 R&D 현장 복귀를 위한 인건비와 연구비를 지원합니다.',
    originalUrl: 'https://www.msit.go.kr'
  },

  // ═══════════ 마케팅/내수 분야 (5건) ═══════════
  {
    id: 31,
    title: '중소기업 온라인 판로지원',
    organization: '중소벤처기업부',
    category: '마케팅',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-15',
    budget: '최대 2천만원 (온라인 쇼핑몰 입점 + 마케팅)',
    eligibility: '중소기업\n국내 주요 오픈마켓(네이버·쿠팡·지마켓 등) 입점 또는 계획\n제품 판매 가능 상태',
    requirements: '온라인 판로지원 신청서, 취급제품 카탈로그, 온라인숍 운영계획서, 사업자등록증',
    content: '중소기업의 온라인 시장 진출을 위해 국내 주요 이커머스 플랫폼 입점과 온라인 마케팅 비용을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 32,
    title: '라이브커머스 지원',
    organization: '중소벤처기업부',
    category: '마케팅',
    applyStart: '2026-02-15',
    applyEnd: '2026-07-31',
    budget: '최대 1,500만원 (라이브커머스 방송 + 콘텐츠 제작)',
    eligibility: '중소기업 또는 소상공인\n라이브커머스 판매 가능한 제품 보유\n라이브커머스 플랫폼(그립·네이버쇼핑라이브 등) 활용 가능',
    requirements: '라이브커머스 방송계획서, 취급제품 리스트, 판매채널 현황',
    content: '중소기업·소상공인의 라이브커머스를 통한 판로 확대를 위해 전문 방송 제작과 진행을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 33,
    title: '소상공인 협업화 지원',
    organization: '소상공인시장진흥공단',
    category: '마케팅',
    applyStart: '2026-04-01',
    applyEnd: '2026-09-30',
    budget: '최대 5천만원 (공동사업비)',
    eligibility: '동종·유사업종 소상공인 5인 이상 협업체\n공동 브랜드·공동 마케팅·공동 구매 등 협업 프로젝트 보유\n협동조합 설립 계획 또는 설립 완료',
    requirements: '협업체 구성 확인서, 공동사업 계획서, 참여 소상공인 명단, 사업자등록증 사본',
    content: '소상공인들이 협업체를 구성하여 공동 브랜드 개발·공동 마케팅·공동 구매 등을 통해 경쟁력을 강화할 수 있도록 지원합니다.',
    originalUrl: 'https://www.semas.or.kr'
  },
  {
    id: 34,
    title: '특허·브랜드·디자인 융합개발',
    organization: '특허청',
    category: '마케팅',
    applyStart: '2026-05-01',
    applyEnd: '2026-11-15',
    budget: '최대 1억원 (IP 융합개발 전 과정)',
    eligibility: '중소기업\n특허·실용신안 등 IP 기반 사업화 계획 보유\n브랜드·디자인 개발 필요 기업',
    requirements: 'IP 기반 사업계획서, 보유 특허 목록, 브랜드·디자인 개발 계획서',
    content: '중소기업의 지식재산(IP)을 제품화·브랜딩하기 위해 특허·브랜드·디자인 융합개발 전 과정을 지원합니다.',
    originalUrl: 'https://www.kipo.go.kr'
  },
  {
    id: 35,
    title: '전통시장 마케팅 지원',
    organization: '소상공인시장진흥공단',
    category: '마케팅',
    applyStart: '2026-03-15',
    applyEnd: '2026-08-31',
    budget: '최대 3천만원 (마케팅·이벤트·홍보)',
    eligibility: '전통시장 또는 상점가 상인회\n전통시장법 제2조에 따른 전통시장\n상인회 구성 및 등록 완료',
    requirements: '시장 마케팅 계획서, 상인회 등록증, 전통시장 인정서',
    content: '전통시장의 집객력 제고와 매출 증대를 위해 문화행사·시즌 이벤트·온라인 홍보 등 마케팅 활동을 지원합니다.',
    originalUrl: 'https://www.semas.or.kr'
  },

  // ═══════════ 기타 분야 (5건) ═══════════
  {
    id: 36,
    title: '소상공인 에너지효율개선',
    organization: '중소벤처기업부',
    category: '기타',
    applyStart: '2026-04-01',
    applyEnd: '2026-10-15',
    budget: '최대 3천만원 (에너지 효율 설비 교체 비용)',
    eligibility: '소상공인 업체\n노후 냉난방기·조명·냉장고 등 고효율 기기 교체 희망\n연 매출 3억원 미만 영세 소상공인 우대',
    requirements: '에너지효율개선 계획서, 교체 대상 설비 목록 및 견적서, 사업자등록증',
    content: '소상공인의 전기요금 부담 완화와 탄소중립 기여를 위해 고효율 에너지 설비 교체 비용을 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 37,
    title: '중소기업 인증획득 지원',
    organization: '중소벤처기업부',
    category: '기타',
    applyStart: '2026-02-01',
    applyEnd: '2026-07-31',
    budget: '최대 1천만원 (인증획득 비용 70%)',
    eligibility: '중소기업\n벤처기업인증, 이노비즈인증, 메인비즈인증, 기술혁신형 인증 등 신규 취득 희망\n인증기관 심사 접수 완료',
    requirements: '인증획득 계획서, 인증 심사 접수증, 기술혁신 실적 증빙, 사업자등록증',
    content: '중소기업의 벤처·이노비즈·메인비즈 등 기술혁신형 인증 취득에 소요되는 컨설팅·심사비를 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 38,
    title: '가업승계 지원',
    organization: '중소벤처기업부',
    category: '기타',
    applyStart: '2026-05-15',
    applyEnd: '2026-11-30',
    budget: '최대 5억원 (경영컨설팅 + 승계자금 융자)',
    eligibility: '업력 10년 이상 중소기업\n가업승계 계획 수립 기업\n승계 대상자(자녀 등) 확정 기업\n가업승계 증여세 과세특례 적용 검토 필요',
    requirements: '가업승계 계획서, 기업 경영현황 보고서, 승계 대상자 이력서, 재무제표, 가족관계증명서',
    content: '장수 중소기업의 원활한 가업승계를 위해 경영 컨설팅과 승계 자금 융자를 제공하는 종합 지원 프로그램입니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 39,
    title: '여성기업 경영개선자금',
    organization: '여성기업종합지원센터',
    category: '기타',
    applyStart: '2026-03-15',
    applyEnd: '2026-09-30',
    budget: '최대 3억원 (융자 + 이차보전)',
    eligibility: '여성기업 확인서 보유 기업\n제조업·지식기반서비스업 등 기술혁신형 여성기업\n기업 경영개선을 위한 시설투자·운영자금 필요',
    requirements: '여성기업 확인서, 경영개선자금 사용계획서, 재무제표, 사업자등록증',
    content: '여성기업의 경영 안정화와 성장을 위해 시설투자·운영자금을 장기 저금리로 융자 지원합니다.',
    originalUrl: 'https://www.wbiz.or.kr'
  },
  {
    id: 40,
    title: '장애인기업 맞춤형 지원',
    organization: '장애인기업종합지원센터',
    category: '기타',
    applyStart: '2026-03-01',
    applyEnd: '2026-08-31',
    budget: '최대 5천만원 (시설 개선 + 마케팅 + 컨설팅)',
    eligibility: '장애인기업 확인서 보유 기업\n장애인기업활동촉진법 제2조에 따른 장애인기업\n사업 확장 및 경쟁력 강화 의지 보유',
    requirements: '장애인기업 확인서, 사업계획서, 장애인 대표 증빙 서류, 사업자등록증',
    content: '장애인기업의 성장과 자립을 위해 시설 개선, 마케팅, 컨설팅 등 맞춤형 종합 지원을 제공합니다.',
    originalUrl: 'https://www.debc.or.kr'
  },
  {
    id: 41,
    title: '지역특화산업 육성 (지역혁신클러스터)',
    organization: '중소벤처기업부',
    category: '기타',
    applyStart: '2026-04-15',
    applyEnd: '2026-10-31',
    budget: '최대 10억원 (지역 주력산업 R&D + 사업화)',
    eligibility: '지역 특화산업 해당 중소·중견기업\n비수도권 소재 기업\n지역혁신클러스터 내 입주 또는 협력 기업',
    requirements: '지역특화산업 연계 사업계획서, 지역혁신클러스터 입주확인서, 재무제표',
    content: '지역 경제 활성화를 위해 비수도권 지역 특화산업 분야 기업의 R&D와 사업화를 집중 지원합니다.',
    originalUrl: 'https://www.mss.go.kr'
  },
  {
    id: 42,
    title: 'K-스타트업 그랜드 챌린지',
    organization: '중소벤처기업부',
    category: '창업',
    applyStart: '2026-02-01',
    applyEnd: '2026-07-15',
    budget: '최대 3천만원 (정착지원금 + 액셀러레이팅)',
    eligibility: '해외 스타트업(외국인 창업자)\n국내 창업 및 사업화 계획 보유\n영어/한국어 피칭 가능',
    requirements: '영문 사업계획서, 팀 소개서, 피칭덱, 국내 사업화 계획서',
    content: '우수 해외 스타트업을 국내로 유치하여 한국 정착과 액셀러레이팅을 지원하는 글로벌 창업 프로그램입니다.',
    originalUrl: 'https://www.k-startupgc.org'
  }
];

// ── 가짜 JWT ──
const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIn0.mock-granthunter-token';

// ── In-memory bookmarks ──
const bookmarks = [1, 5, 9];

// ── In-memory pipeline ──
const pipeline = {}; // { userId: { grantId: { stage, addedAt, notes, dueDate, documents: [] } } }
const STAGE_COLORS = {
  discovery: '#6366f1', reviewing: '#f59e0b', preparing: '#3b82f6',
  submitted: '#10b981', waiting: '#8b5cf6', selected: '#06b6d4', rejected: '#ef4444'
};
pipeline['1'] = {
  1: { stage: 'reviewing', addedAt: '2026-06-01', notes: '매출 조건 확인 필요', dueDate: '2026-09-15', documents: ['사업계획서', '재무제표'] },
  5: { stage: 'preparing', addedAt: '2026-06-03', notes: '', dueDate: '2026-07-31', documents: [] },
  8: { stage: 'submitted', addedAt: '2026-05-15', notes: '2026-06-05 제출완료', dueDate: '2026-08-31', documents: ['사업계획서', '재무제표', '사업자등록증'] },
  12: { stage: 'discovery', addedAt: '2026-06-09', notes: '', dueDate: '2026-07-15', documents: [] },
  3: { stage: 'selected', addedAt: '2026-04-01', notes: '1차 선정! 계약 진행중', dueDate: '2026-08-31', documents: [] },
};

// ── Helper: calculate days left from today ──
function daysLeft(dateStr) {
  const today = new Date('2026-06-09'); // mock "today" for consistent results
  const target = new Date(dateStr);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// ── Auth ──
app.post('/api/auth/signup', (req, res) => {
  res.json({ success: true, message: '회원가입이 완료되었습니다. 로그인해주세요.' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    accessToken: FAKE_TOKEN,
    refreshToken: FAKE_TOKEN,
    userId: 1,
    email: req.body.email || 'demo@granthunter.kr',
    name: '홍길동',
  });
});

// ── OAuth ──
app.post('/api/auth/oauth/:provider', (req, res) => {
  const { provider } = req.params;
  const names = { google: 'Google', naver: '네이버', kakao: '카카오' };
  res.json({
    accessToken: FAKE_TOKEN,
    refreshToken: FAKE_TOKEN,
    userId: 1,
    email: `oauth-${provider}@granthunter.kr`,
    name: `${names[provider] || 'OAuth'} 사용자`,
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 1, email: 'demo@granthunter.kr', name: '홍길동',
    companyName: '(주)테크스타트', industry: 'IT/소프트웨어', companySize: '10인 미만', plan: 'free'
  });
});

// ── Grants ──
app.get('/api/grants', (req, res) => {
  const { category, keyword, limit, page = 1, size = 10 } = req.query;
  let result = [...grants];

  if (category && category !== '전체') result = result.filter(g => g.category === category);
  if (keyword) result = result.filter(g => g.title.includes(keyword) || g.organization.includes(keyword));

  // Sort by deadline
  result.sort((a, b) => new Date(a.applyEnd) - new Date(b.applyEnd));

  const total = result.length;
  const start = (page - 1) * size;
  const paged = result.slice(start, start + (limit || size));

  res.json({ content: paged, totalElements: total, totalPages: Math.ceil(total / size), number: page - 1, size: Number(size) });
});

// ⚠️ Static routes BEFORE /api/grants/:id to avoid Express route conflict
app.get('/api/grants/scores', (req, res) => {
  // 가상 매칭 점수
  const scores = grants.map(g => ({
    noticeId: g.id,
    score: Math.floor(Math.random() * 40) + 60, // 60-100점
    reasons: ['업종 일치', '지원규모 적합', '마감 임박'],
    analysis: `${g.category} 분야에서 귀사의 업종과 높은 일치도를 보입니다.`
  }));
  res.json(scores);
});

// ── NEW: Urgent grants (ending within 7 days, top 5 by nearest deadline) ──
app.get('/api/grants/urgent', (req, res) => {
  const today = new Date('2026-06-09');
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 7); // within 7 days

  const urgent = grants
    .filter(g => {
      const end = new Date(g.applyEnd);
      return end >= today && end <= cutoff;
    })
    .sort((a, b) => new Date(a.applyEnd) - new Date(b.applyEnd))
    .slice(0, 5)
    .map(g => ({
      ...g,
      daysLeft: daysLeft(g.applyEnd)
    }));

  res.json(urgent);
});

// ── NEW: Compare grants (up to 3 IDs, side-by-side fields) ──
app.get('/api/grants/compare', (req, res) => {
  const idsParam = req.query.ids;
  if (!idsParam) return res.status(400).json({ error: 'ids 쿼리 파라미터가 필요합니다.' });

  const ids = idsParam.split(',').map(Number).filter(n => !isNaN(n)).slice(0, 3);
  if (ids.length === 0) return res.status(400).json({ error: '유효한 ID가 없습니다.' });

  const matched = ids.map(id => {
    const g = grants.find(g => g.id === id);
    if (!g) return null;
    return {
      id: g.id,
      title: g.title,
      organization: g.organization,
      category: g.category,
      budget: g.budget,
      applyStart: g.applyStart,
      applyEnd: g.applyEnd,
      daysLeft: daysLeft(g.applyEnd),
      eligibility: g.eligibility,
      requirements: g.requirements,
      content: g.content,
      originalUrl: g.originalUrl,
      matchScore: Math.floor(Math.random() * 30) + 70 // 70-100 simulated
    };
  }).filter(Boolean);

  // Comparison summary fields
  const comparison = {
    grants: matched,
    summary: matched.length > 1 ? {
      categories: matched.map(g => g.category),
      budgetRange: `${matched.map(g => g.budget).join(' vs ')}`,
    } : null
  };
  res.json(comparison);
});

// Get related grants (same category, excluding current)
app.get('/api/grants/:id/related', (req, res) => {
  const grant = grants.find(g => g.id === parseInt(req.params.id));
  if (!grant) return res.status(404).json({ error: '공고를 찾을 수 없습니다.' });
  const related = grants.filter(g => g.id !== grant.id && g.category === grant.category).slice(0, 3);
  if (related.length === 0) {
    const relatedAll = grants.filter(g => g.id !== grant.id).slice(0, 3);
    return res.json({ content: relatedAll });
  }
  res.json({ content: related });
});

app.get('/api/grants/:id', (req, res) => {
  const grant = grants.find(g => g.id === parseInt(req.params.id));
  if (!grant) return res.status(404).json({ error: '공고를 찾을 수 없습니다.' });
  res.json({ ...grant, daysLeft: daysLeft(grant.applyEnd) });
});

// ── Analytics ──
app.get('/api/analytics/trends', (req, res) => {
  res.json({
    categories: [
      { name: 'R&D', count: 342, trend: 'up', budget: '1,200억' },
      { name: '창업', count: 256, trend: 'up', budget: '800억' },
      { name: '수출', count: 198, trend: 'down', budget: '600억' },
      { name: '제조혁신', count: 167, trend: 'up', budget: '2,100억' },
      { name: '인력', count: 145, trend: 'flat', budget: '450억' },
      { name: '마케팅', count: 123, trend: 'up', budget: '300억' }
    ],
    monthlyStats: [
      { month: '1월', totalGrants: 45, avgMatchRate: 72 },
      { month: '2월', totalGrants: 52, avgMatchRate: 75 },
      { month: '3월', totalGrants: 68, avgMatchRate: 78 },
      { month: '4월', totalGrants: 55, avgMatchRate: 74 },
      { month: '5월', totalGrants: 71, avgMatchRate: 80 },
      { month: '6월', totalGrants: 63, avgMatchRate: 82 }
    ],
    topOrganizations: [
      { name: '중소벤처기업부', grantCount: 45 },
      { name: 'KOTRA', grantCount: 32 },
      { name: '과학기술정보통신부', grantCount: 28 }
    ]
  });
});

app.get('/api/analytics/user-stats', (req, res) => {
  res.json({
    savedGrants: 12,
    appliedGrants: 3,
    successRate: 67,
    totalBudgetTracked: '150억',
    weeklyMatches: [7, 5, 8, 6, 9, 4, 6],
    topCategories: ['R&D', '수출', '창업']
  });
});

// ── Calendar ──
app.get('/api/calendar/deadlines', (req, res) => {
  const { year = '2026', month } = req.query;
  if (!month) return res.status(400).json({ error: 'month 쿼리 파라미터가 필요합니다.' });

  const y = parseInt(year);
  const m = parseInt(month);
  const prefix = `${y}-${String(m).padStart(2, '0')}`;

  const grouped = {};
  grants.forEach(g => {
    if (g.applyEnd.startsWith(prefix)) {
      if (!grouped[g.applyEnd]) grouped[g.applyEnd] = [];
      grouped[g.applyEnd].push({
        id: g.id,
        title: g.title,
        category: g.category,
        daysLeft: daysLeft(g.applyEnd)
      });
    }
  });

  res.json(grouped);
});

// ── Bookmarks ──
app.post('/api/bookmarks', (req, res) => {
  const { grantId } = req.body;
  if (!grantId || !Number.isInteger(grantId)) {
    return res.status(400).json({ error: 'grantId (정수)가 필요합니다.' });
  }
  if (!bookmarks.includes(grantId)) {
    bookmarks.push(grantId);
  }
  res.json({ success: true });
});

app.get('/api/bookmarks', (req, res) => {
  res.json(bookmarks);
});

app.delete('/api/bookmarks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = bookmarks.indexOf(id);
  if (idx !== -1) {
    bookmarks.splice(idx, 1);
  }
  res.json({ success: true });
});

// ── Dashboard ──
app.get('/api/dashboard/stats', (req, res) => {
  res.json({ alertCount: 5, matchRate: 78, interestCategory: 'IT/소프트웨어' });
});

// ── Alerts ──
app.get('/api/prefs', (req, res) => {
  res.json({ categories: 'R&D,창업,수출', industries: 'IT,제조', minBudget: 10000000, channel: 'telegram', channelId: '', enabled: true });
});

app.post('/api/prefs', (req, res) => {
  res.json({ ...req.body, success: true });
});

app.get('/api/history', (req, res) => {
  res.json([
    { id: 1, noticeTitle: '2026년 중소기업 R&D 혁신바우처', sentAt: '2026-06-09T09:00:00', channel: 'slack' },
    { id: 2, noticeTitle: '데이터바우처 지원사업', sentAt: '2026-06-08T09:00:00', channel: 'slack' },
    { id: 3, noticeTitle: '스타트업 글로벌 진출 마케팅 지원', sentAt: '2026-06-07T09:00:00', channel: 'slack' },
  ]);
});

// ── Chatbot ──
app.post('/api/chatbot/query', (req, res) => {
  const { message } = req.body;
  const msg = (message || '').toLowerCase();

  // Determine relevant grants based on keyword matching
  let relatedGrants = [];
  let keyword = '';

  if (msg.includes('r&d') || msg.includes('연구') || msg.includes('기술')) {
    relatedGrants = [1, 7, 8];
    keyword = 'R&D 지원금';
  } else if (msg.includes('수출') || msg.includes('해외') || msg.includes('kotra')) {
    relatedGrants = [16, 17, 18];
    keyword = '수출';
  } else if (msg.includes('창업') || msg.includes('스타트업') || msg.includes('startup')) {
    relatedGrants = [10, 11, 12];
    keyword = '창업';
  } else if (msg.includes('마케팅') || msg.includes('홍보')) {
    relatedGrants = [31, 32];
    keyword = '마케팅';
  } else if (msg.includes('제조') || msg.includes('스마트팩토리')) {
    relatedGrants = [22, 24];
    keyword = '제조혁신';
  } else if (msg.includes('인력') || msg.includes('인재') || msg.includes('채용')) {
    relatedGrants = [26, 27];
    keyword = '인력';
  } else {
    relatedGrants = [1, 10, 17];
    keyword = '지원사업';
  }

  const grantLines = relatedGrants.map(id => {
    const g = grants.find(g => g.id === id);
    if (!g) return '';
    const endParts = g.applyEnd.split('-');
    const endLabel = `${parseInt(endParts[1])}/${parseInt(endParts[2])} 마감`;
    return `${g.id}. ${g.title} (${g.budget}, ${endLabel})`;
  }).filter(Boolean);

  res.json({
    reply: `검색하신 '${keyword}' 관련 ${relatedGrants.length}건의 공고가 있습니다:\n\n${grantLines.join('\n')}\n\n'${keyword}' 카테고리에서 매칭률이 가장 높은 공고입니다. 더 자세히 알아보시겠습니까?`,
    relatedGrants,
    suggestedActions: ['매칭률 상세 보기', '마감일 캘린더에 추가', '알림 설정하기']
  });
});

// ── Exports ──
app.post('/api/exports/pdf', (req, res) => {
  const { grantIds } = req.body;
  if (!grantIds || !Array.isArray(grantIds) || grantIds.length === 0) {
    return res.status(400).json({ error: 'grantIds (배열)가 필요합니다.' });
  }
  res.json({ success: true, message: 'PDF가 생성되었습니다. 다운로드를 시작합니다.' });
});

app.post('/api/exports/excel', (req, res) => {
  const { grantIds, columns } = req.body;
  if (!grantIds || !Array.isArray(grantIds) || grantIds.length === 0) {
    return res.status(400).json({ error: 'grantIds (배열)가 필요합니다.' });
  }
  res.json({ success: true, message: 'Excel 파일이 생성되었습니다.' });
});

// ── Pipeline ──
app.get('/api/pipeline', (req, res) => {
  const userId = '1';
  const userPipeline = pipeline[userId] || {};

  const stageLabels = {
    discovery: '발견', reviewing: '검토중', preparing: '서류준비',
    submitted: '제출완료', waiting: '결과대기', selected: '선정', rejected: '탈락'
  };
  const stageOrder = ['discovery', 'reviewing', 'preparing', 'submitted', 'waiting', 'selected', 'rejected'];

  const stageCounts = {};
  stageOrder.forEach(s => { stageCounts[s] = 0; });
  Object.values(userPipeline).forEach(e => { if (stageCounts[e.stage] !== undefined) stageCounts[e.stage]++; });

  const columns = stageOrder.map(s => ({
    id: s, title: stageLabels[s], color: STAGE_COLORS[s], count: stageCounts[s]
  }));

  const items = Object.entries(userPipeline).map(([gid, entry]) => {
    const g = grants.find(g => g.id === parseInt(gid));
    if (!g) return null;
    return {
      id: parseInt(gid), grantId: parseInt(gid),
      title: g.title, organization: g.organization, category: g.category, budget: g.budget,
      stage: entry.stage, dueDate: entry.dueDate || g.applyEnd,
      notes: entry.notes || '', documents: entry.documents || [],
      daysLeft: daysLeft(entry.dueDate || g.applyEnd)
    };
  }).filter(Boolean);

  res.json({ columns, items });
});

app.post('/api/pipeline/move', (req, res) => {
  const userId = '1';
  const { grantId, stage } = req.body;
  if (!grantId || !stage) return res.status(400).json({ error: 'grantId와 stage가 필요합니다.' });
  if (!pipeline[userId]) pipeline[userId] = {};

  if (pipeline[userId][grantId]) {
    pipeline[userId][grantId].stage = stage;
  } else {
    const g = grants.find(g => g.id === grantId);
    pipeline[userId][grantId] = {
      stage, addedAt: '2026-06-09', notes: '',
      dueDate: g ? g.applyEnd : null, documents: []
    };
  }
  res.json({ success: true, grantId, stage });
});

app.post('/api/pipeline/add', (req, res) => {
  const userId = '1';
  const { grantId, stage, notes } = req.body;
  if (!grantId) return res.status(400).json({ error: 'grantId가 필요합니다.' });
  if (!pipeline[userId]) pipeline[userId] = {};

  const g = grants.find(g => g.id === grantId);
  pipeline[userId][grantId] = {
    stage: stage || 'discovery', addedAt: '2026-06-09', notes: notes || '',
    dueDate: g ? g.applyEnd : null, documents: []
  };
  res.json({ success: true });
});

// ⚠️ static routes BEFORE /api/pipeline/:grantId
app.get('/api/pipeline/stats', (req, res) => {
  const userId = '1';
  const userPipeline = pipeline[userId] || {};
  const stageOrder = ['discovery', 'reviewing', 'preparing', 'submitted', 'waiting', 'selected', 'rejected'];

  function parseBudgetToEok(budgetStr) {
    if (!budgetStr) return 0;
    const m = budgetStr.match(/최대\s+([\d,.]+)\s*(억원|천만원|만원)/);
    if (!m) return 0;
    const num = parseFloat(m[1].replace(/,/g, ''));
    if (m[2] === '억원') return num;
    if (m[2] === '천만원') return num * 0.1;
    return num * 0.0001; // 만원
  }

  function formatBudgetToDisplay(eok) {
    if (eok === 0) return '0원';
    if (eok >= 1) return `${eok}억원`;
    return `${eok * 10}천만원`;
  }

  const byStage = stageOrder.map(stage => {
    const entries = Object.entries(userPipeline).filter(([, e]) => e.stage === stage);
    const totalBudgetEok = entries.reduce((sum, [gid]) => {
      const g = grants.find(g => g.id === parseInt(gid));
      return sum + (g ? parseBudgetToEok(g.budget) : 0);
    }, 0);
    return { stage, count: entries.length, totalBudget: formatBudgetToDisplay(totalBudgetEok), color: STAGE_COLORS[stage] };
  });

  const total = Object.keys(userPipeline).length;
  const totalBudgetEok = Object.keys(userPipeline).reduce((sum, gid) => {
    const g = grants.find(g => g.id === parseInt(gid));
    return sum + (g ? parseBudgetToEok(g.budget) : 0);
  }, 0);

  const urgentCount = Object.entries(userPipeline).filter(([, e]) =>
    e.dueDate && daysLeft(e.dueDate) <= 7 && daysLeft(e.dueDate) >= 0
  ).length;

  const selectedCount = Object.values(userPipeline).filter(e => e.stage === 'selected').length;
  const rejectedCount = Object.values(userPipeline).filter(e => e.stage === 'rejected').length;
  const successRate = (selectedCount + rejectedCount) > 0
    ? Math.round((selectedCount / (selectedCount + rejectedCount)) * 100) : 50;

  res.json({ total, byStage, totalBudget: formatBudgetToDisplay(totalBudgetEok), urgentCount, successRate });
});

app.delete('/api/pipeline/:grantId', (req, res) => {
  const userId = '1';
  const grantId = parseInt(req.params.grantId);
  if (!pipeline[userId]) pipeline[userId] = {};
  delete pipeline[userId][grantId];
  res.json({ success: true });
});

app.put('/api/pipeline/:grantId', (req, res) => {
  const userId = '1';
  const grantId = parseInt(req.params.grantId);
  const { notes, documents, dueDate } = req.body;
  if (!pipeline[userId]) pipeline[userId] = {};
  if (!pipeline[userId][grantId]) return res.status(404).json({ error: 'Pipeline 항목을 찾을 수 없습니다.' });

  if (notes !== undefined) pipeline[userId][grantId].notes = notes;
  if (documents !== undefined) pipeline[userId][grantId].documents = documents;
  if (dueDate !== undefined) pipeline[userId][grantId].dueDate = dueDate;

  const g = grants.find(g => g.id === grantId);
  res.json({
    grantId, ...pipeline[userId][grantId],
    title: g ? g.title : '', organization: g ? g.organization : ''
  });
});

// ── Daily Digest ──
app.get('/api/digest/today', (req, res) => {
  const userId = '1';
  const userPipeline = pipeline[userId] || {};

  const urgentDeadlines = Object.entries(userPipeline)
    .filter(([, e]) => e.dueDate && daysLeft(e.dueDate) <= 7 && daysLeft(e.dueDate) >= 0)
    .map(([gid, e]) => {
      const g = grants.find(g => g.id === parseInt(gid));
      return { grantId: parseInt(gid), title: g ? g.title : '', stage: e.stage, daysLeft: daysLeft(e.dueDate), dueDate: e.dueDate };
    });

  const pipelineSummary = {
    reviewing: Object.values(userPipeline).filter(e => e.stage === 'reviewing').length,
    preparing: Object.values(userPipeline).filter(e => e.stage === 'preparing').length,
    submitted: Object.values(userPipeline).filter(e => e.stage === 'submitted').length,
    selected: Object.values(userPipeline).filter(e => e.stage === 'selected').length,
  };
  pipelineSummary.total = pipelineSummary.reviewing + pipelineSummary.preparing + pipelineSummary.submitted + pipelineSummary.selected;

  res.json({ urgentDeadlines, pipelineSummary });
});

console.log('🏆 GrantHunter Mock API running on http://localhost:8080');
app.listen(8080);
