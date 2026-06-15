import type { PricingTier } from '../components/PricingCard';

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    description: '공고 탐색·기본 준비',
    audience: '처음 쓰는 1인·소규모 사업자',
    statusNote: '가입 시 기본 플랜',
    features: [
      { name: '공고 검색·필터·캘린더', included: true },
      { name: '맞춤 추천 최대 10건 (점수만)', included: true },
      { name: '이메일 알림 · 하루 1건', included: true },
      { name: '관심 카테고리 1개 · 업종 2개', included: true },
      { name: '파이프라인 1건 · 북마크 5건', included: true },
      { name: '서류 보관함 5개', included: true },
      { name: '체크리스트 저장', included: false },
      { name: '템플릿 프로필 자동완성', included: false },
    ],
    cta: '무료로 시작하기',
  },
  {
    name: 'Pro',
    monthlyPrice: 99000,
    yearlyPrice: 594000,
    description: '지원사업을 꾸준히 준비하는 팀',
    audience: '매월 여러 공고를 검토·신청하는 기업',
    statusNote: '관리자가 플랜 부여 (결제 미연동)',
    highlighted: true,
    badge: 'Pro',
    features: [
      { name: '맞춤 추천 50건 + 적합도 상세', included: true },
      { name: '이메일 알림 · 하루 30건', included: true },
      { name: 'Telegram · Slack 알림', included: true },
      { name: '카테고리 10 · 업종 8', included: true },
      { name: '파이프라인 무제한 · 북마크 50건', included: true },
      { name: '서류 보관함 50개', included: true },
      { name: '체크리스트 저장', included: true },
      { name: 'Word 템플릿 자동완성', included: true },
    ],
    cta: 'Pro 안내',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 390000,
    yearlyPrice: 2340000,
    description: '팀·기관 단위 운영',
    audience: '컨설팅사·액셀러레이터·다수 계정 조직',
    statusNote: '맞춤 견적 · 관리자 부여',
    features: [
      { name: 'Pro 기능 전체', included: true },
      { name: '추천·알림·카테고리·북마크 무제한', included: true },
      { name: '팀 협업·API·SSO', included: false },
      { name: '전담 매니저·맞춤 보고서', included: false },
    ],
    cta: '문의하기',
  },
];

export const FEATURE_COMPARISON = [
  { name: '맞춤 추천 건수', free: '10건', pro: '50건', enterprise: '무제한' },
  { name: '적합도 상세(사유·플래그)', free: false, pro: true, enterprise: true },
  { name: '일일 이메일 알림', free: '1건', pro: '30건', enterprise: '무제한' },
  { name: '관심 카테고리', free: '1개', pro: '10개', enterprise: '무제한' },
  { name: '관심 업종', free: '2개', pro: '8개', enterprise: '무제한' },
  { name: '알림 채널', free: '이메일', pro: '이메일+Telegram+Slack', enterprise: '전체' },
  { name: '파이프라인', free: '1건', pro: '무제한', enterprise: '무제한' },
  { name: '북마크', free: '5건', pro: '50건', enterprise: '무제한' },
  { name: '서류 보관함', free: '5개', pro: '50개', enterprise: '무제한' },
  { name: '체크리스트 저장', free: false, pro: true, enterprise: true },
  { name: '템플릿 자동완성', free: false, pro: true, enterprise: true },
  { name: 'Telegram / Slack', free: false, pro: true, enterprise: true },
];

export const FAQS = [
  {
    q: 'Free·Pro·Enterprise 차이가 실제로 적용되나요?',
    a: '네. 로그인 후 플랜에 따라 추천 건수, 알림·북마크·파이프라인 한도, 체크리스트·템플릿 기능이 달라집니다. 결제는 아직 없으며, Pro·Enterprise는 관리자가 플랜을 변경해 드립니다.',
  },
  {
    q: 'Pro로 바꾸려면?',
    a: '현재는 결제 연동 전입니다. 문의 또는 관리자에게 Pro 플랜 변경을 요청해 주세요.',
  },
  {
    q: '맞춤 적합도는 신청 가능을 보장하나요?',
    a: '아닙니다. 참고용 점수이며, 최종 판단은 공고 원문·자격요건 확인이 필요합니다.',
  },
  {
    q: '내 플랜은 어디서 확인하나요?',
    a: '로그인 후 상단 네비게이션에 플랜 뱃지가 표시됩니다. 알림·북마크·파이프라인 화면에서도 한도를 확인할 수 있습니다.',
  },
];
