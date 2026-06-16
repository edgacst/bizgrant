export const SITE_NAME = 'BizGrant';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://bizgrant.kr';

export const DEFAULT_SEO = {
  title: 'BizGrant | 정부지원금사업·나라장터 공고 검색',
  description:
    '기업마당·중소벤처기업부·K-Startup 정부지원금사업과 나라장터 입찰공고를 한곳에서 검색하세요. 맞춤 적합도·마감 알림·파이프라인으로 지원금 준비를 돕습니다.',
  keywords:
    '정부지원금사업, 정부지원사업, 지원사업, 나라장터, 입찰공고, 기업마당, 중소기업 지원금, K-Startup, 보조금, R&D 지원',
};

export const PAGE_SEO = {
  home: {
    title: 'BizGrant | 정부지원금사업·나라장터 공고 검색',
    description: DEFAULT_SEO.description,
    path: '/',
  },
  grants: {
    title: '정부지원금사업 공고 검색',
    description:
      '기업마당·중기부·K-Startup 등 정부지원금사업 공고를 카테고리·마감일·키워드로 검색하세요. 신청 가능한 지원금 공고를 한눈에 확인합니다.',
    path: '/grants',
    keywords: '정부지원금사업, 지원사업 공고, 기업마당, 중소기업 지원금, 보조금 검색',
  },
  procurement: {
    title: '나라장터 입찰·낙찰 공고',
    description:
      '나라장터(G2B) 입찰공고와 낙찰정보를 검색합니다. 물품·공사·용역 조달 공고 마감일을 확인하세요.',
    path: '/procurement',
    keywords: '나라장터, 입찰공고, G2B, 조달청, 낙찰정보, 공공입찰',
  },
  about: {
    title: '서비스 소개',
    description: 'BizGrant는 정부지원금사업과 나라장터 공고를 수집·검색하고 맞춤 적합도로 준비를 돕는 플랫폼입니다.',
    path: '/about',
  },
  guide: {
    title: '사용 방법',
    description: '정부지원금사업 검색, 나라장터 입찰 조회, 북마크·파이프라인·알림 설정 방법을 안내합니다.',
    path: '/guide',
  },
  pricing: {
    title: '요금제',
    description: 'Free·Pro·Enterprise 플랜별 맞춤 추천·알림·파이프라인 한도를 확인하세요.',
    path: '/pricing',
  },
  calendar: {
    title: '지원금 마감 캘린더',
    description: '정부지원금사업 공고 마감일을 캘린더로 확인하세요.',
    path: '/calendar',
  },
} as const;
