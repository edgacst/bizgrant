import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bot,
  ArrowRight,
  Shield,
  FileCheck,
  TrendingUp,
  Sparkles,
  BarChart3,
  Target,
  Bell,
  ClipboardCheck,
  ArrowDown,
  Gavel,
  Building2,
  Globe2,
  Landmark,
  Factory,
  Rocket,
  Clapperboard,
  Store,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLandingStats } from '../hooks/useLandingStats';

type TrustPartner = {
  name: string;
  abbr: string;
  gradient: string;
  icon?: LucideIcon;
};

const TRUST_PARTNERS: TrustPartner[] = [
  { name: '중소벤처기업부', abbr: 'MSS', gradient: 'from-blue-600 to-indigo-700', icon: Building2 },
  { name: '나라장터', abbr: 'G2B', gradient: 'from-slate-600 to-slate-800', icon: Gavel },
  { name: '기업마당', abbr: 'BIZ', gradient: 'from-emerald-600 to-teal-700', icon: Store },
  { name: '한국무역협회', abbr: 'KITA', gradient: 'from-red-600 to-rose-700', icon: Globe2 },
  { name: '서울경제진흥원', abbr: 'SBA', gradient: 'from-sky-600 to-blue-700', icon: Landmark },
  { name: 'KOTRA', abbr: 'KOTRA', gradient: 'from-orange-600 to-amber-700', icon: Globe2 },
  { name: '중소기업진흥공단', abbr: 'KOSME', gradient: 'from-violet-600 to-purple-700', icon: Factory },
  { name: '창업진흥원', abbr: 'KISED', gradient: 'from-pink-600 to-rose-700', icon: Rocket },
  { name: '한국콘텐츠진흥원', abbr: 'KOCCA', gradient: 'from-fuchsia-600 to-purple-700', icon: Clapperboard },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: '공고 탐색',
    desc: '중소벤처기업부·지자체·민간 지원사업 중\n내 기업에 맞는 공고만 필터링',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    step: '02',
    icon: Target,
    title: '맞춤 적합도',
    desc: '업종·규모·관심 분야를 바탕으로\n적합도를 %로 표시합니다',
    color: 'from-purple-500 to-pink-500',
  },
  {
    step: '03',
    icon: Bell,
    title: '알림',
    desc: '관심 조건에 맞는 공고를\n이메일로 안내합니다',
    color: 'from-amber-500 to-orange-500',
  },
];

const SERVICE_HIGHLIGHTS = [
  { title: '공공 데이터 수집', desc: '기업마당·중기부·K-Startup 등 공개 공고를 수집해 한곳에서 검색할 수 있습니다.' },
  { title: '규칙 기반 적합도', desc: '카테고리·산업·예산·마감일·지원대상 키워드를 조합해 참고용 점수를 제공합니다.' },
  { title: '서류 준비 지원', desc: '체크리스트, Word 초안, 보관함으로 제출 서류 준비를 돕습니다.' },
];

const LandingPage: React.FC = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  const { grantCount, bidCount, partnerCounts } = useLandingStats();
  const grantLabel = grantCount != null ? grantCount.toLocaleString() : '—';
  const bidLabel = bidCount != null ? bidCount.toLocaleString() : '—';
  const totalLabel = grantCount != null && bidCount != null
    ? (grantCount + bidCount).toLocaleString()
    : '—';

  const stats = [
    { icon: FileCheck, value: grantCount != null ? `${grantLabel}건` : '연결 중', label: '신청 가능 지원사업', color: 'text-indigo-500' },
    { icon: Gavel, value: bidCount != null ? `${bidLabel}건` : '연결 중', label: '나라장터 입찰공고', color: 'text-slate-600' },
    { icon: TrendingUp, value: totalLabel !== '—' ? `${totalLabel}건` : '연결 중', label: '수집·연동 공고 합계', color: 'text-green-500' },
  ];

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 overflow-x-hidden">
      {/* ========== HERO ========== */}
      <section className="relative min-h-[105vh] flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/30" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-400/25 to-purple-400/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-amber-400/20 to-pink-400/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-1/3 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl -translate-x-1/2 animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        {/* Floating cards - desktop only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute top-[15%] right-[10%] animate-float" style={{ animationDelay: '0s' }}>
            <div className="premium-card p-3.5 w-52 rotate-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">R&D</span>
                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">D-14</span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">스마트 제조 혁신 지원사업</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-[10px] text-gray-400">중소벤처기업부</p>
                <span className="text-[10px] font-bold text-indigo-600">₩1억</span>
              </div>
            </div>
          </div>
          <div className="absolute top-[45%] right-[6%] animate-float" style={{ animationDelay: '2s' }}>
            <div className="premium-card p-3.5 w-48 -rotate-2 shadow-xl">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">창업</span>
              <p className="text-xs font-bold mt-2 text-gray-900 dark:text-white leading-tight">글로벌 진출 프로그램</p>
              <p className="text-[10px] text-gray-400 mt-1.5">서울경제진흥원</p>
            </div>
          </div>
          <div className="absolute top-[30%] left-[5%] animate-float" style={{ animationDelay: '3.5s' }}>
            <div className="premium-card p-3.5 w-48 rotate-1 shadow-xl">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">수출</span>
              <p className="text-xs font-bold mt-2 text-gray-900 dark:text-white leading-tight">수출 경쟁력 강화사업</p>
              <p className="text-[10px] text-gray-400 mt-1.5">한국무역협회</p>
            </div>
          </div>
          <div className="absolute bottom-[25%] right-[18%] animate-float" style={{ animationDelay: '5s' }}>
            <div className="premium-card p-3.5 w-44 -rotate-1 shadow-lg">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">인력</span>
              <p className="text-xs font-bold mt-2 text-gray-900 dark:text-white leading-tight">청년 인턴 지원사업</p>
              <p className="text-[10px] text-gray-400 mt-1.5">고용노동부</p>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24">
          <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-10 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              공공·기관 공고 {totalLabel}건 연동 · 맞춤 적합도 참고 제공
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Live counts — 정부지원 + 나라장터 */}
            <div className="my-10 sm:my-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 max-w-3xl mx-auto">
                <div className="premium-card p-6 sm:p-8 text-center">
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-text leading-none">
                    {grantLabel}
                  </p>
                  <p className="mt-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    정부지원금 정보
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">기업마당·중기부·K-Startup 등</p>
                </div>
                <div className="premium-card p-6 sm:p-8 text-center border-l-4 border-l-slate-600">
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-700 dark:text-slate-200 leading-none">
                    {bidLabel}
                  </p>
                  <p className="mt-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    나라장터 입찰공고
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">나라장터 API 수집 (동기화 주기에 따라 갱신)</p>
                </div>
              </div>
            </div>

            {/* Main headline — BIGGER */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-gray-900 dark:text-white">
                내 회사에 딱 맞는
              </span>
              <br />
              <span className="gradient-text text-7xl sm:text-8xl lg:text-9xl">
                정부 지원금
              </span>
            </h1>

            {/* Subheadline — EXPANDED */}
            <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              중소벤처기업부·기업마당·K-Startup 등 <span className="font-extrabold text-gray-900 dark:text-white">공개 공고</span>를
              <br className="hidden sm:block" />
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">맞춤 적합도</span>로
              {' '}<span className="font-extrabold text-gray-900 dark:text-white">내 업종·규모·관심 분야</span>에 맞는 공고를 우선 확인
            </p>

            {/* Trust mini-stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-10 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> 공공·기관 공고 수집</span>
              <span className="flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-indigo-500" /> 지원사업 {grantLabel}건</span>
              <span className="flex items-center gap-1.5"><Gavel className="w-4 h-4 text-slate-600" /> 나라장터 입찰 {bidLabel}건</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-green-500" /> 합계 {totalLabel}건</span>
            </div>

            {/* CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn btn-primary text-xl px-12 py-5 shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 transition-all hover:-translate-y-1">
                무료로 시작하기
                <ArrowRight className="w-6 h-6" />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary text-lg px-10 py-5">
                서비스 살펴보기
                <ArrowDown className="w-5 h-5" />
              </a>
              <Link to="/guide" className="btn btn-secondary text-lg px-10 py-5">
                사이트 사용방법
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Bottom trust line */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-400">회원가입 후 공고 검색·알림 설정·서류 준비 기능을 이용할 수 있습니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              <span className="gradient-text">3단계</span>로 지원금 찾기
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              복잡한 절차 없이, 딱 세 단계면 충분합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative group">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
                )}
                <div className="premium-card p-8 text-center relative z-10 group-hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-extrabold text-gray-300 dark:text-gray-600 mb-2">
                    STEP {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-8 premium-card">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUST (기관 로고) ========== */}
      <section className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-base sm:text-lg font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
            신뢰할 수 있는 기관 데이터
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            공공·기관 <span className="gradient-text">공개 공고</span> 수집
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            카드 숫자는 DB에 저장된 활성 공고 건수입니다. 기관별 소스 분류 후 갱신됩니다.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {TRUST_PARTNERS.map((org) => {
              const Icon = org.icon;
              const count = partnerCounts[org.abbr];
              return (
                <div
                  key={org.name}
                  className="premium-card p-5 sm:p-6 flex flex-col items-center gap-4 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${org.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    {Icon ? (
                      <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2} />
                    ) : (
                      <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        {org.abbr.slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-snug">
                      {org.name}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
                      {org.abbr}
                      {count != null && (
                        <span className="ml-1.5 text-brand-600 dark:text-brand-400">
                          · {count.toLocaleString()}건
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              왜 <span className="gradient-text">BizGrant</span>인가요?
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              지원사업을 더 스마트하게 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: '맞춤 적합도', desc: '업종·규모·관심 분야 기준\n참고용 % 점수 제공', color: 'from-indigo-500 to-blue-500' },
              { icon: Bell, title: '마감 D-Day 알림', desc: '알림 설정 기준\n이메일 안내 (매일 09시)', color: 'from-red-500 to-pink-500' },
              { icon: Search, title: '스마트 필터', desc: '지원금액·분야·소스별로\n원하는 공고만 쏙쏙', color: 'from-amber-500 to-orange-500' },
              { icon: ClipboardCheck, title: '서류 체크리스트', desc: '필요 서류를 한눈에 확인하고\n준비 상태를 관리하세요', color: 'from-green-500 to-emerald-500' },
              { icon: BarChart3, title: '파이프라인', desc: '검토→준비→제출 단계를\n칸반 보드로 관리', color: 'from-purple-500 to-violet-500' },
              { icon: Shield, title: '공공 데이터 연동', desc: '기업마당 API·기관 게시판 등\n공개 공고를 수집합니다', color: 'from-cyan-500 to-blue-500' },
            ].map((feat, i) => (
              <div key={i} className="premium-card p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-md`}>
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SERVICE ========== */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              BizGrant가 <span className="gradient-text">제공하는 것</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              과장 없이, 실제로 동작하는 기능 중심으로 안내합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_HIGHLIGHTS.map((item, i) => (
              <div key={i} className="premium-card p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="rounded-2xl p-10 sm:p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl border-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-base sm:text-lg text-white/95 leading-relaxed mb-8">
              무료 회원가입 후 공고 검색, 맞춤 적합도, 알림 설정을 이용해 보세요.<br />
              <span className="text-white/80">유료 요금제·결제 기능은 준비 중입니다.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-10 py-4 font-bold shadow-lg">
                무료 회원가입
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
