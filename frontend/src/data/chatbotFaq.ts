export type ChatFaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedIds: string[];
};

export const CHATBOT_WELCOME =
  '안녕하세요! Grant AI입니다.\nBizGrant가 처음이시라면 걱정 마세요. 아래 주제에서 궁금한 질문을 고르거나, 편하게 입력해 주시면 차근차근 안내해 드릴게요.';

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
      'BizGrant(비즈그랜트)는 정부지원금 사업과 나라장터 입찰·조달 공고를 한곳에서 찾아볼 수 있게 도와주는 서비스입니다.\n\n' +
      '여러 사이트를 돌아다니지 않아도 되고, 우리 회사에 맞는 공고를 추천받고, 마감 전에 알림을 받으며, 지원 준비를 차근차근 할 수 있습니다.\n\n' +
      '처음이시라면 이렇게 시작해 보세요.\n' +
      '① 회원가입\n' +
      '② 공고 검색·북마크\n' +
      '③ 알림 설정\n\n' +
      '👉 https://bizgrant.kr',
    keywords: ['소개', '뭐예요', '무엇', 'bizgrant', '비즈그랜트', '서비스', '뭔가요'],
    relatedIds: ['target', 'diff', 'free', 'signup'],
  },
  {
    id: 'target',
    category: '서비스 소개',
    question: '누가 쓰면 좋아요?',
    answer:
      '다음과 같은 분들께 특히 도움이 됩니다.\n\n' +
      '· 중소기업·스타트업 대표·실무 담당자\n' +
      '· 1인 사업자, 소상공인\n' +
      '· 정부지원금·R&D·창업 지원 사업을 찾는 분\n' +
      '· 나라장터 입찰·조달 공고를 챙겨야 하는 분\n\n' +
      '「우리 업종에 맞는 지원사업이 뭐가 있지?」「마감 놓칠까 봐 걱정돼」하신다면 BizGrant를 써 보시면 좋습니다.',
    keywords: ['대상', '누가', '추천', '사업자', '쓰면'],
    relatedIds: ['intro', 'grants', 'match', 'signup'],
  },
  {
    id: 'diff',
    category: '서비스 소개',
    question: '기업마당이랑 뭐가 달라요?',
    answer:
      '기업마당·나라장터는 공고 **원문**이 올라오는 공식 사이트입니다. 실제 신청·입찰도 그곳에서 합니다.\n\n' +
      'BizGrant는 그 공고들을 **모아서 검색**하고, 아래 기능을 더해 드립니다.\n' +
      '· 한곳에서 지원금·입찰 공고 검색\n' +
      '· 우리 회사 맞춤 적합도(참고 점수)\n' +
      '· 마감·신규 공고 알림\n' +
      '· 북마크, 파이프라인, 서류센터 등 준비 도구\n\n' +
      '즉, 기업마당을 대체하는 곳이 아니라 **찾고·준비하고·놓치지 않게** 돕는 서비스입니다.',
    keywords: ['기업마당', '나라장터', '차이', '다른', '달라'],
    relatedIds: ['grants', 'apply', 'intro', 'update'],
  },
  {
    id: 'free',
    category: '서비스 소개',
    question: '무료인가요?',
    answer:
      '지금은 **회원가입 후 주요 기능을 이용**하실 수 있습니다.\n\n' +
      '공고 검색, 맞춤 추천, 알림, 북마크, 파이프라인 등 핵심 기능을 가입만으로 써 보실 수 있어요.\n' +
      '요금제·유료 결제는 **추후 적용 예정**이며, 적용 전에 사이트에서 안내드릴 예정입니다.\n\n' +
      '부담 없이 가입해 보시고, 궁금한 점은 「문의하기」로 물어봐 주세요.',
    keywords: ['무료', '요금', '가격', '비용', '플랜', '결제'],
    relatedIds: ['signup', 'login-required', 'intro', 'contact'],
  },
  {
    id: 'signup',
    category: '가입·로그인',
    question: '가입 방법',
    answer:
      '가입은 3~5분이면 끝납니다. 순서대로 따라 해 보세요.\n\n' +
      '① https://bizgrant.kr 접속\n' +
      '② 우측 상단 「회원가입」 클릭\n' +
      '③ 이메일·비밀번호 입력\n' +
      '④ 회사명, 업종, 규모 등 기본 정보 입력 (맞춤 추천에 사용됩니다)\n' +
      '⑤ 가입 완료 후 로그인\n\n' +
      '로그인하시면 공고 검색·알림·북마크 등 모든 메뉴를 이용할 수 있습니다.',
    keywords: ['가입', '회원가입', '시작', '등록', '방법'],
    relatedIds: ['login-required', 'oauth', 'grants', 'match'],
  },
  {
    id: 'login-required',
    category: '가입·로그인',
    question: '로그인 없이 볼 수 있나요?',
    answer:
      '메뉴마다 조금 다릅니다.\n\n' +
      '**로그인 후 이용**\n' +
      '· 정부지원금·나라장터 공고 목록·상세\n' +
      '· 맞춤 추천, 알림, 북마크, 파이프라인 등\n\n' +
      '**비회원도 볼 수 있음**\n' +
      '· 사이트 소개, 사용 가이드, 캘린더\n\n' +
      '공고를 보려면 가입·로그인이 필요합니다. 「가입 방법」을 참고해 주세요.',
    keywords: ['로그인', '비회원', '없이', '볼 수'],
    relatedIds: ['signup', 'grants', 'password', 'session'],
  },
  {
    id: 'password',
    category: '가입·로그인',
    question: '비밀번호 찾기',
    answer:
      '비밀번호를 잊으셨다면 이렇게 하세요.\n\n' +
      '① 로그인 화면으로 이동\n' +
      '② 「비밀번호 찾기」 또는 「비밀번호 재설정」 클릭\n' +
      '③ 가입한 이메일 주소 입력\n' +
      '④ 메일함에서 재설정 링크 확인 (스팸함도 확인해 주세요)\n\n' +
      '그래도 안 되면 freecompr@naver.com 으로 가입 이메일을 알려 주시면 도와드리겠습니다.',
    keywords: ['비밀번호', '찾기', '재설정', '분실', '잊'],
    relatedIds: ['signup', 'session', 'contact'],
  },
  {
    id: 'oauth',
    category: '가입·로그인',
    question: '카카오·네이버 간편가입',
    answer:
      '아쉽게도 **지금은 이메일 회원가입만** 가능합니다.\n\n' +
      '카카오·네이버·구글 간편 로그인은 많은 분들이 요청해 주셔서, **추후 적용을 검토 중**입니다.\n\n' +
      '당분간은 이메일로 가입해 주시면 됩니다. 「가입 방법」을 보시면 금방 끝나요.',
    keywords: ['카카오', '네이버', '구글', '간편', '소셜', '간편가입'],
    relatedIds: ['signup', 'login-required', 'contact'],
  },
  {
    id: 'grants',
    category: '공고·검색',
    question: '어떤 공고를 볼 수 있나요?',
    answer:
      'BizGrant에서는 크게 두 가지 공고를 볼 수 있습니다.\n\n' +
      '**① 정부지원금·지원사업**\n' +
      '기업마당 등에 올라오는 창업·R&D·수출·인력 등 지원 사업 공고\n\n' +
      '**② 나라장터 입찰·조달**\n' +
      '용역·물품·공사 등 입찰·계약 관련 공고\n\n' +
      '로그인 후 상단 메뉴 「정부지원금」「나라장터」에서 검색·필터로 찾아보세요. 키워드·카테고리·마감일로 좁혀 볼 수 있습니다.',
    keywords: ['공고', '검색', '지원사업', '입찰', '조달', '볼 수'],
    relatedIds: ['apply', 'update', 'match', 'no-grants'],
  },
  {
    id: 'update',
    category: '공고·검색',
    question: '공고는 언제 업데이트되나요?',
    answer:
      '공고 데이터는 **매일 새벽에** 기업마당·나라장터 등 공공 데이터와 동기화합니다.\n\n' +
      '그래서 전날 밤~새벽에 올라온 공고도 아침에 사이트에서 확인하실 수 있어요.\n\n' +
      '최신 공고는 「대시보드」나 「공고 목록」에서 보시고, 놓치지 않으려면 「알림 받는 방법」도 함께 설정해 보세요.',
    keywords: ['업데이트', '동기화', '최신', '수집', '언제'],
    relatedIds: ['grants', 'no-grants', 'alert'],
  },
  {
    id: 'apply',
    category: '공고·검색',
    question: '신청은 어디서 하나요?',
    answer:
      '중요한 점: **BizGrant에서 직접 신청·입찰하지는 않습니다.**\n\n' +
      'BizGrant는 공고를 찾고, 비교하고, 준비하는 **도구**입니다.\n\n' +
      '실제 신청·입찰은 이렇게 하세요.\n' +
      '① BizGrant에서 관심 공고 상세 페이지 열기\n' +
      '② 「원문 보기」 또는 기업마당·나라장터 링크 클릭\n' +
      '③ 공식 사이트에서 안내에 따라 신청·입찰\n\n' +
      '서류 준비는 「서류센터」「파이프라인」도 활용해 보세요.',
    keywords: ['신청', '지원', '접수', '원문', '어디서'],
    relatedIds: ['grants', 'diff', 'documents', 'pipeline'],
  },
  {
    id: 'no-grants',
    category: '공고·검색',
    question: '공고가 안 보여요',
    answer:
      '아래를 순서대로 확인해 보세요.\n\n' +
      '① **로그인** 했는지 (공고는 로그인 후 보입니다)\n' +
      '② 검색어·**카테고리·마감일** 필터가 너무 좁지 않은지\n' +
      '③ 「마감됨」만 보이게 되어 있지 않은지\n' +
      '④ 브라우저 새로고침 (Ctrl+Shift+R)\n\n' +
      '그래도 0건이거나 오류가 나면 freecompr@naver.com 으로 화면 캡처와 함께 문의해 주세요. 빠르게 확인해 드리겠습니다.',
    keywords: ['안보', '없', '0건', '오류', '안 보'],
    relatedIds: ['login-required', 'grants', 'contact', 'update'],
  },
  {
    id: 'match',
    category: '맞춤·알림',
    question: '맞춤 적합도가 뭐예요?',
    answer:
      '가입할 때 입력한 **업종·회사 규모·관심 분야**와 각 공고를 비교해, 우리 회사에 얼마나 잘 맞는지 **참고 점수**로 보여주는 기능입니다.\n\n' +
      '예: 「중소기업 R&D」 공고인데 우리가 제조 중소기업이면 점수가 높게 나올 수 있어요.\n\n' +
      '⚠️ 점수는 **참고용**입니다. 실제 지원 자격·제외 조건은 반드시 **공고 원문**을 읽고 확인하세요.',
    keywords: ['적합도', '매칭', '점수', '맞춤'],
    relatedIds: ['alert', 'signup', 'grants', 'bookmark'],
  },
  {
    id: 'alert',
    category: '맞춤·알림',
    question: '알림 받는 방법',
    answer:
      '마감을 놓치지 않으려면 알림 설정을 추천드립니다.\n\n' +
      '① 로그인\n' +
      '② 상단 「알림 설정」 메뉴 이동\n' +
      '③ 관심 **카테고리·업종** 선택\n' +
      '④ **이메일** 등 알림 채널 선택 (Slack·Webhook도 가능)\n' +
      '⑤ 저장\n\n' +
      '설정 후 조건에 맞는 신규·마감 임박 공고가 오면 알려 드립니다.',
    keywords: ['알림', '메일', '이메일', '설정', '받는'],
    relatedIds: ['alert-fail', 'kakao-alert', 'newsletter', 'match'],
  },
  {
    id: 'alert-fail',
    category: '맞춤·알림',
    question: '알림이 안 와요',
    answer:
      '알림이 안 올 때는 아래를 확인해 주세요.\n\n' +
      '① 알림 설정에서 **알림이 켜져 있는지**\n' +
      '② **이메일 주소**가 맞는지 (마이페이지에서 확인)\n' +
      '③ **스팸·프로모션함**에 들어가 있지 않은지\n' +
      '④ 회사 메일은 보안 정책으로 차단될 수 있음\n\n' +
      '위를 다 확인했는데도 안 오면 freecompr@naver.com 으로 문의해 주세요.',
    keywords: ['알림안', '안와', '수신', '안 와'],
    relatedIds: ['alert', 'contact', 'newsletter'],
  },
  {
    id: 'kakao-alert',
    category: '맞춤·알림',
    question: '카카오톡 알림 되나요?',
    answer:
      '현재 지원하는 알림 채널은 다음과 같습니다.\n\n' +
      '✅ **이메일** (가장 많이 사용)\n' +
      '✅ **Slack**\n' +
      '✅ **Webhook** (연동 가능한 도구용)\n\n' +
      '카카오톡·문자(SMS) 알림은 준비 중이며, **추후 연동 예정**입니다. 당분간은 이메일 알림을 권장드립니다.',
    keywords: ['카카오톡', '문자', '슬랙', 'slack', '카톡'],
    relatedIds: ['alert', 'newsletter', 'contact'],
  },
  {
    id: 'newsletter',
    category: '맞춤·알림',
    question: '뉴스레터와 알림 차이',
    answer:
      '이름이 비슷해서 헷갈리실 수 있어요. 이렇게 구분하시면 됩니다.\n\n' +
      '**뉴스레터**\n' +
      '· 사이트 **하단에서 구독**하는 주간 메일\n' +
      '· 누구나 받을 수 있는 요약 소식\n' +
      '· 회원이 아니어도 구독 가능\n\n' +
      '**맞춤 알림**\n' +
      '· **로그인 후 알림 설정**에서 켜는 개인 알림\n' +
      '· 내가 고른 업종·카테고리에 맞는 공고만\n' +
      '· 마감·신규 공고 등 실무용',
    keywords: ['뉴스레터', '구독', '차이'],
    relatedIds: ['alert', 'signup', 'contact'],
  },
  {
    id: 'bookmark',
    category: '기능',
    question: '북마크',
    answer:
      '「나중에 다시 볼 공고」를 저장하는 기능입니다.\n\n' +
      '공고 목록·상세에서 북마크 버튼을 누르면 저장되고, 상단 「북마크」 메뉴에서 모아볼 수 있어요.\n\n' +
      '여러 공고를 비교할 때, 주말에 천천히 검토할 때 유용합니다. 「파이프라인」과 함께 쓰시면 더 편합니다.',
    keywords: ['북마크', '저장', '즐겨'],
    relatedIds: ['pipeline', 'documents', 'grants', 'match'],
  },
  {
    id: 'pipeline',
    category: '기능',
    question: '파이프라인',
    answer:
      '지원·입찰 준비를 **단계별로 관리**하는 기능입니다.\n\n' +
      '기본 흐름: **검토 → 준비 → 제출**\n' +
      '· 검토: 공고 읽고 지원 여부 결정\n' +
      '· 준비: 서류·계획서 작성\n' +
      '· 제출: 원문 사이트에서 접수 완료\n\n' +
      '여러 공고를 동시에 진행할 때 「지금 어디까지 했지?」를 한눈에 보기 좋습니다.',
    keywords: ['파이프라인', '진행', '단계'],
    relatedIds: ['bookmark', 'documents', 'apply', 'grants'],
  },
  {
    id: 'documents',
    category: '기능',
    question: '서류센터',
    answer:
      '지원·입찰할 때 필요한 **서류와 체크리스트**를 모아 둔 메뉴입니다.\n\n' +
      '· 공고별로 필요한 서류 목록\n' +
      '· 체크리스트로 빠진 항목 확인\n' +
      '· 템플릿·양식 참고\n\n' +
      '「신청은 어디서 하나요?」에서 원문 사이트로 가기 **전에**, 여기서 준비물을 먼저 챙겨 보세요.',
    keywords: ['서류', '체크리스트', '템플릿', '문서', '서류센터'],
    relatedIds: ['apply', 'pipeline', 'bookmark', 'grants'],
  },
  {
    id: 'site',
    category: '사이트·문의',
    question: '사이트 주소',
    answer:
      'BizGrant 공식 주소입니다.\n\n' +
      '👉 https://bizgrant.kr\n\n' +
      '북마크해 두시면 다음에 바로 접속하기 편합니다. 모바일 브라우저에서도 같은 주소로 이용하실 수 있어요.',
    keywords: ['주소', '홈페이지', 'url', '사이트'],
    relatedIds: ['signup', 'contact', 'mobile', 'intro'],
  },
  {
    id: 'contact',
    category: '사이트·문의',
    question: '문의하기',
    answer:
      '도움이 필요하시면 아래로 연락해 주세요.\n\n' +
      '📧 이메일: freecompr@naver.com\n' +
      '(가입 이메일·문제 화면 캡처를 함께 보내주시면 더 빠릅니다)\n\n' +
      '또한 사이트 **요금 페이지 하단**에 문의 폼이 있습니다.\n\n' +
      '평일에 순서대로 답변드리겠습니다. 편하게 남겨 주세요.',
    keywords: ['문의', '고객', '연락', '이메일', '도움', '문의하기'],
    relatedIds: ['site', 'session', 'password', 'no-grants'],
  },
  {
    id: 'mobile',
    category: '사이트·문의',
    question: '모바일 이용',
    answer:
      '네, **스마트폰·태블릿 브라우저**에서도 이용할 수 있습니다.\n\n' +
      '앱 설치 없이 Chrome·Safari 등에서 https://bizgrant.kr 로 접속하시면 됩니다.\n\n' +
      '출장 중에 공고 확인, 알림 받기, 북마크 등 주요 기능을 모바일에서도 쓸 수 있어요.',
    keywords: ['모바일', '폰', '핸드폰', '스마트폰'],
    relatedIds: ['site', 'signup', 'alert'],
  },
  {
    id: 'session',
    category: '사이트·문의',
    question: '로그인이 자꾸 풀려요',
    answer:
      '로그인이 자주 풀릴 때 시도해 볼 방법입니다.\n\n' +
      '① **https://bizgrant.kr** 로 직접 접속 (다른 주소·북마크 확인)\n' +
      '② 브라우저에서 **쿠키·저장소 차단** 해제\n' +
      '③ 시크릿 모드가 아닌 일반 창 사용\n' +
      '④ 여러 기기에서 동시 로그인 시 세션 만료 가능\n\n' +
      '계속되면 freecompr@naver.com 으로 사용 중인 브라우저·기기를 알려 주세요.',
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

export const CHATBOT_FALLBACK_ANSWER =
  '질문을 정확히 이해하지 못했어요.\n\n' +
  '아래 「자주 묻는 질문」에서 비슷한 주제를 골라 보시거나,\n' +
  '「BizGrant가 뭐예요?」「가입 방법」「알림 받는 방법」처럼 짧게 다시 입력해 주세요.\n\n' +
  '그래도 어려우시면 freecompr@naver.com 으로 문의해 주세요.';

export type ChatbotReply = {
  answer: string;
  faqId?: string;
  showAllTopics: boolean;
};

type ConversationalRule = {
  id: string;
  test: (normalized: string, raw: string) => boolean;
  answer: string;
  showAllTopics?: boolean;
};

function compactInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '');
}

const CHATBOT_CONVERSATIONAL: ConversationalRule[] = [
  {
    id: 'greeting',
    test: (n, raw) => {
      if (raw.length > 24) return false;
      return /^(안녕하세요|안녕|안뇽|하이|헬로|hello|hi|hey|반갑습니다|반가워요|반가워|ㅎㅇ|하이요|좋은아침|좋은오후|좋은저녁|굿모닝|굿이브닝)(요|요~|!|~|\.|,)*$/i.test(
        n,
      );
    },
    answer:
      '안녕하세요! 반갑습니다.\n' +
      '저는 BizGrant 도우미 Grant AI예요.\n\n' +
      '처음이시라면 「BizGrant가 뭐예요?」부터 눌러 보시거나, 아래 주제 탭에서 궁금한 걸 골라 주세요. 차근차근 안내해 드릴게요.',
    showAllTopics: true,
  },
  {
    id: 'thanks',
    test: (n, raw) => {
      const cleaned = n.replace(/[~^ㅠㅜ!.\s]+$/g, '');
      return (
        raw.length <= 36 &&
        /^(감사합니다|감사해요|고마워요|고맙습니다|고마워|고마워요|땡큐|thanks|thankyou|thx|감사)/i.test(cleaned)
      );
    },
    answer:
      '천만에요! 도움이 되었다니 기뻐요.\n' +
      '다른 궁금한 점이 있으면 편하게 물어봐 주세요. 처음이셔도 괜찮아요.',
    showAllTopics: true,
  },
  {
    id: 'bye',
    test: (n, raw) =>
      raw.length <= 24 &&
      /^(잘가요|잘가|안녕히가세요|안녕히계세요|바이|bye|goodbye|또봐요|다음에봐요)(요|요~|!|~|\.|,)*$/i.test(n),
    answer:
      '네, 좋은 하루 보내세요!\n' +
      '지원금·입찰 공고 준비하시다가 궁금한 점 생기면 언제든 다시 찾아와 주세요.',
    showAllTopics: true,
  },
  {
    id: 'who',
    test: (n) =>
      /누구|뭐하는|뭐하는애|정체|grantai|그랜트ai/.test(n) &&
      (n.includes('너') || n.includes('당신') || n.includes('누구') || n.includes('grant') || n.length <= 16),
    answer:
      '저는 **BizGrant 공식 도우미 Grant AI**입니다.\n\n' +
      '정부지원금·나라장터 공고 찾기, 회원가입, 알림 설정, 북마크·서류센터 사용법 등을 안내해 드려요.\n' +
      '사람 상담원은 아니지만, 자주 묻는 질문은 제가 바로 답해 드릴 수 있습니다.',
    showAllTopics: true,
  },
  {
    id: 'help',
    test: (n) =>
      /^(도와줘|도움|도와주세요|help|헬프|뭐할수있|뭐해줄수|어떻게써|사용법)(요|요~|!|~|\.|,)*$/i.test(n),
    answer:
      '물론이죠! 이렇게 시작해 보세요.\n\n' +
      '① 「BizGrant가 뭐예요?」로 서비스 파악\n' +
      '② 「가입 방법」으로 회원가입\n' +
      '③ 「어떤 공고를 볼 수 있나요?」로 공고 검색\n' +
      '④ 「알림 받는 방법」으로 마감 알림 설정\n\n' +
      '아래 주제 탭에서 눌러 보셔도 됩니다.',
    showAllTopics: true,
  },
  {
    id: 'ok',
    test: (n, raw) =>
      raw.length <= 12 &&
      /^(네|넵|응|ㅇㅇ|알겠습니다|알겠어요|알았어요|오케이|ok|ㅇㅋ)(요|요~|!|~|\.|,)*$/i.test(n),
    answer: '네, 알겠습니다! 더 궁금한 점이 있으면 이어서 물어봐 주세요.',
    showAllTopics: true,
  },
];

export function findConversationalAnswer(input: string): ChatbotReply | null {
  const raw = input.trim();
  if (!raw) return null;
  const normalized = compactInput(raw);

  for (const rule of CHATBOT_CONVERSATIONAL) {
    if (rule.test(normalized, raw)) {
      return {
        answer: rule.answer,
        showAllTopics: rule.showAllTopics ?? true,
      };
    }
  }

  return null;
}

export function resolveChatbotInput(input: string): ChatbotReply {
  const conversational = findConversationalAnswer(input);
  if (conversational) return conversational;

  const faq = findChatbotAnswer(input);
  if (faq) {
    return {
      answer: faq.answer,
      faqId: faq.id,
      showAllTopics: false,
    };
  }

  return {
    answer: CHATBOT_FALLBACK_ANSWER,
    showAllTopics: true,
  };
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
