export type ChatFaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedIds: string[];
};

export const CHATBOT_WELCOME =
  '안녕하세요! Grant AI입니다.\n아래 주제에서 궁금한 질문을 고르거나, 직접 입력해 주세요.';

export const CHATBOT_CATEGORIES = [
  { key: '서비스 소개', itemIds: ['intro', 'target', 'diff', 'free'] },
  { key: '가입·로그인', itemIds: ['signup', 'login-required', 'password', 'oauth'] },
  { key: '공고·검색', itemIds: ['grants', 'update', 'apply', 'no-grants'] },
  { key: '맞춤·알림', itemIds: ['match', 'alert', 'alert-fail', 'kakao-alert', 'newsletter'] },
  { key: '기능', itemIds: ['bookmark', 'pipeline', 'documents'] },
  { key: '사이트·문의', itemIds: ['site', 'contact', 'mobile', 'session'] },
] as const;

export const CHATBOT_FAQ: ChatFaqItem[] = [
  {
    id: 'intro',
    category: '서비스 소개',
    question: 'BizGrant가 뭐예요?',
    answer:
      '정부지원금·나라장터 공고를 한곳에서 검색하고, 맞춤 적합도·마감 알림으로 지원 준비를 돕는 서비스입니다.\n👉 https://bizgrant.kr',
    keywords: ['소개', '뭐예요', '무엇', 'bizgrant', '비즈그랜트', '서비스', '뭔가요'],
    relatedIds: ['target', 'diff', 'free', 'signup'],
  },
  {
    id: 'target',
    category: '서비스 소개',
    question: '누가 쓰면 좋아요?',
    answer: '중소기업·스타트업·1인 사업자, 지원금·입찰 공고를 챙겨야 하는 분께 적합합니다.',
    keywords: ['대상', '누가', '추천', '사업자', '쓰면'],
    relatedIds: ['intro', 'grants', 'match', 'signup'],
  },
  {
    id: 'diff',
    category: '서비스 소개',
    question: '기업마당이랑 뭐가 달라요?',
    answer:
      '공고 원문은 기업마당·나라장터에 있습니다. BizGrant는 여러 곳 공고를 모아 검색하고, 맞춤 추천·알림·준비 도구를 제공합니다.',
    keywords: ['기업마당', '나라장터', '차이', '다른', '달라'],
    relatedIds: ['grants', 'apply', 'intro', 'update'],
  },
  {
    id: 'free',
    category: '서비스 소개',
    question: '무료인가요?',
    answer: '회원가입 후 주요 기능을 이용할 수 있습니다. 요금제·결제는 추후 적용 예정입니다.',
    keywords: ['무료', '요금', '가격', '비용', '플랜', '결제'],
    relatedIds: ['signup', 'login-required', 'intro', 'contact'],
  },
  {
    id: 'signup',
    category: '가입·로그인',
    question: '가입 방법',
    answer:
      'https://bizgrant.kr 접속 → 회원가입 → 이메일·비밀번호·회사 정보 입력 → 로그인 후 이용하세요.',
    keywords: ['가입', '회원가입', '시작', '등록', '방법'],
    relatedIds: ['login-required', 'oauth', 'grants', 'match'],
  },
  {
    id: 'login-required',
    category: '가입·로그인',
    question: '로그인 없이 볼 수 있나요?',
    answer:
      '공고 목록·상세는 로그인 후 이용 가능합니다. 소개·가이드·캘린더는 비회원도 볼 수 있습니다.',
    keywords: ['로그인', '비회원', '없이', '볼 수'],
    relatedIds: ['signup', 'grants', 'password', 'session'],
  },
  {
    id: 'password',
    category: '가입·로그인',
    question: '비밀번호 찾기',
    answer: '로그인 화면에서 비밀번호 재설정을 이용해 주세요.\n문의: freecompr@naver.com',
    keywords: ['비밀번호', '찾기', '재설정', '분실', '잊'],
    relatedIds: ['signup', 'session', 'contact'],
  },
  {
    id: 'oauth',
    category: '가입·로그인',
    question: '카카오·네이버 간편가입',
    answer: '현재는 이메일 가입만 가능합니다. 간편 로그인은 추후 적용 예정입니다.',
    keywords: ['카카오', '네이버', '구글', '간편', '소셜', '간편가입'],
    relatedIds: ['signup', 'login-required', 'contact'],
  },
  {
    id: 'grants',
    category: '공고·검색',
    question: '어떤 공고를 볼 수 있나요?',
    answer:
      '정부지원금사업(기업마당 등)과 나라장터 입찰·조달 공고입니다. 로그인 후 상단 메뉴에서 검색하세요.',
    keywords: ['공고', '검색', '지원사업', '입찰', '조달', '볼 수'],
    relatedIds: ['apply', 'update', 'match', 'no-grants'],
  },
  {
    id: 'update',
    category: '공고·검색',
    question: '공고는 언제 업데이트되나요?',
    answer: '매일 새벽경 공공 데이터를 동기화합니다. 대시보드·공고 목록에서 최신 공고를 확인하세요.',
    keywords: ['업데이트', '동기화', '최신', '수집', '언제'],
    relatedIds: ['grants', 'no-grants', 'alert'],
  },
  {
    id: 'apply',
    category: '공고·검색',
    question: '신청은 어디서 하나요?',
    answer:
      'BizGrant는 정보·준비 도구입니다. 실제 신청·입찰은 공고 상세의 원문 링크(기업마당·나라장터)에서 진행하세요.',
    keywords: ['신청', '지원', '접수', '원문', '어디서'],
    relatedIds: ['grants', 'diff', 'documents', 'pipeline'],
  },
  {
    id: 'no-grants',
    category: '공고·검색',
    question: '공고가 안 보여요',
    answer:
      '로그인 여부와 검색 필터(카테고리·마감일)를 확인해 주세요.\n계속 안 되면 freecompr@naver.com 으로 문의해 주세요.',
    keywords: ['안보', '없', '0건', '오류', '안 보'],
    relatedIds: ['login-required', 'grants', 'contact', 'update'],
  },
  {
    id: 'match',
    category: '맞춤·알림',
    question: '맞춤 적합도가 뭐예요?',
    answer:
      '가입 시 입력한 업종·규모와 공고를 비교한 참고 점수입니다. 실제 지원 가능 여부는 공고문을 꼭 확인하세요.',
    keywords: ['적합도', '매칭', '점수', '맞춤'],
    relatedIds: ['alert', 'signup', 'grants', 'bookmark'],
  },
  {
    id: 'alert',
    category: '맞춤·알림',
    question: '알림 받는 방법',
    answer:
      '로그인 → 알림 설정 → 관심 카테고리·업종 선택 → 이메일 등 채널 설정 → 저장',
    keywords: ['알림', '메일', '이메일', '설정', '받는'],
    relatedIds: ['alert-fail', 'kakao-alert', 'newsletter', 'match'],
  },
  {
    id: 'alert-fail',
    category: '맞춤·알림',
    question: '알림이 안 와요',
    answer:
      '① 알림 설정이 켜져 있는지 ② 이메일 주소 확인 ③ 스팸함 확인\n그래도 안 오면 freecompr@naver.com',
    keywords: ['알림안', '안와', '수신', '안 와'],
    relatedIds: ['alert', 'contact', 'newsletter'],
  },
  {
    id: 'kakao-alert',
    category: '맞춤·알림',
    question: '카카오톡 알림 되나요?',
    answer: '현재는 이메일·Slack·Webhook 알림을 지원합니다. 카카오톡·문자 알림은 추후 연동 예정입니다.',
    keywords: ['카카오톡', '문자', '슬랙', 'slack', '카톡'],
    relatedIds: ['alert', 'newsletter', 'contact'],
  },
  {
    id: 'newsletter',
    category: '맞춤·알림',
    question: '뉴스레터와 알림 차이',
    answer:
      '뉴스레터는 사이트 하단 구독용 주간 메일이고, 맞춤 알림은 회원이 설정하는 개인 알림입니다.',
    keywords: ['뉴스레터', '구독', '차이'],
    relatedIds: ['alert', 'signup', 'contact'],
  },
  {
    id: 'bookmark',
    category: '기능',
    question: '북마크',
    answer: '나중에 볼 공고를 저장하는 기능입니다. 상단 북마크 메뉴에서 확인하세요.',
    keywords: ['북마크', '저장', '즐겨'],
    relatedIds: ['pipeline', 'documents', 'grants', 'match'],
  },
  {
    id: 'pipeline',
    category: '기능',
    question: '파이프라인',
    answer: '검토→준비→제출 단계로 지원 공고를 관리하는 기능입니다.',
    keywords: ['파이프라인', '진행', '단계'],
    relatedIds: ['bookmark', 'documents', 'apply', 'grants'],
  },
  {
    id: 'documents',
    category: '기능',
    question: '서류센터',
    answer: '공고별 체크리스트·서류·템플릿을 모아두는 메뉴입니다.',
    keywords: ['서류', '체크리스트', '템플릿', '문서', '서류센터'],
    relatedIds: ['apply', 'pipeline', 'bookmark', 'grants'],
  },
  {
    id: 'site',
    category: '사이트·문의',
    question: '사이트 주소',
    answer: 'https://bizgrant.kr',
    keywords: ['주소', '홈페이지', 'url', '사이트'],
    relatedIds: ['signup', 'contact', 'mobile', 'intro'],
  },
  {
    id: 'contact',
    category: '사이트·문의',
    question: '문의하기',
    answer: '이메일: freecompr@naver.com\n사이트 요금 페이지 하단 문의 폼도 이용 가능합니다.',
    keywords: ['문의', '고객', '연락', '이메일', '도움', '문의하기'],
    relatedIds: ['site', 'session', 'password', 'no-grants'],
  },
  {
    id: 'mobile',
    category: '사이트·문의',
    question: '모바일 이용',
    answer: '모바일 브라우저에서 이용 가능합니다.',
    keywords: ['모바일', '폰', '핸드폰', '스마트폰'],
    relatedIds: ['site', 'signup', 'alert'],
  },
  {
    id: 'session',
    category: '사이트·문의',
    question: '로그인이 자꾸 풀려요',
    answer:
      'https://bizgrant.kr 로 접속하고, 브라우저 저장소 차단을 해제해 주세요.\n계속되면 freecompr@naver.com',
    keywords: ['로그아웃', '풀려', '세션', '자꾸'],
    relatedIds: ['password', 'login-required', 'contact'],
  },
];

const FAQ_BY_ID = new Map(CHATBOT_FAQ.map((item) => [item.id, item]));

export function getFaqById(id: string): ChatFaqItem | undefined {
  return FAQ_BY_ID.get(id);
}

export function getRelatedQuestions(faqId: string, askedQuestions: Set<string> = new Set()): ChatFaqItem[] {
  const item = FAQ_BY_ID.get(faqId);
  if (!item) return [];

  const related = item.relatedIds
    .map((id) => FAQ_BY_ID.get(id))
    .filter((q): q is ChatFaqItem => !!q && !askedQuestions.has(q.question));

  if (related.length > 0) return related;

  return CHATBOT_FAQ.filter(
    (q) => q.category === item.category && q.id !== faqId && !askedQuestions.has(q.question),
  ).slice(0, 4);
}

export function findChatbotAnswer(input: string): ChatFaqItem | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;

  const exact = CHATBOT_FAQ.find(
    (item) =>
      item.question.toLowerCase() === normalized ||
      item.question.replace(/\?/g, '').toLowerCase() === normalized,
  );
  if (exact) return exact;

  let best: ChatFaqItem | null = null;
  let bestScore = 0;

  for (const item of CHATBOT_FAQ) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) score += 2;
    }
    if (item.question.toLowerCase().includes(normalized)) score += 3;
    if (normalized.includes(item.question.toLowerCase().replace(/\?/g, ''))) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore > 0 ? best : null;
}
