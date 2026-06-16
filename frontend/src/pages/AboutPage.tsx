import { Link } from 'react-router-dom';
import { useLandingStats } from '../hooks/useLandingStats';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bot,
  Search,
  Bell,
  BarChart3,
  Target,
  Clock,
  FileCheck,
  Building2,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Clock,
    title: '시간 절약',
    subtitle: '여러 사이트 → 한곳 검색',
    desc: '기업마당·중기부·K-Startup 등에 흩어진 공고를 BizGrant에서 검색·필터링할 수 있습니다. 적합도 점수와 마감일 정보로 우선순위를 잡는 데 도움이 됩니다.',
    stats: [{ label: '수집 방식', value: 'API·게시판' }, { label: '갱신', value: '일 1회+' }],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Target,
    title: '맞춤형 매칭',
    subtitle: '규칙 기반 적합도 %',
    desc: '업종, 규모, 관심 카테고리·산업, 예산, 마감일, 지원대상 키워드를 조합해 참고용 점수를 계산합니다. AI 자격 판단이 아니며, 공고 원문 확인이 필요합니다.',
    stats: [{ label: '점수 범위', value: '0~100%' }, { label: '추천 상한', value: '50건' }],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Bell,
    title: '알림',
    subtitle: '이메일 (매일 09시)',
    desc: '알림 설정에 맞는 공고를 이메일로 안내합니다. SMTP 설정이 필요하며, Telegram·Slack 연동은 아직 지원하지 않습니다.',
    stats: [{ label: '채널', value: '이메일' }, { label: '발송', value: '매일 09시' }],
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: '파이프라인 관리',
    subtitle: '검토→준비→제출',
    desc: '칸반 보드로 지원 진행 단계를 관리합니다. 팀 공유·SSO는 준비 중입니다.',
    stats: [{ label: '단계', value: '7단계' }, { label: '협업', value: '준비 중' }],
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: FileCheck,
    title: '서류 준비 지원',
    subtitle: '체크리스트·Word 초안',
    desc: '공고별 필요 서류 체크리스트, BizGrant 생성 Word 초안, 파일 보관함을 제공합니다. 기관 공식 HWP 양식은 공고 원문·첨부에서 받아야 합니다.',
    stats: [{ label: '템플릿', value: '8종+' }, { label: '양식', value: '초안·링크' }],
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: TrendingUp,
    title: '정부지원금사업 탐색',
    subtitle: '공고·조달 분리',
    desc: '정부지원금사업과 나라장터 입찰을 구분해 제공합니다. 선정이나 지원금액을 보장하지 않으며, 적합 공고 발견과 준비 효율을 돕습니다.',
    stats: [{ label: '정부지원금사업', value: '수집 공고' }, { label: '조달', value: '별도 메뉴' }],
    color: 'from-indigo-500 to-violet-500',
  },
];

const PROCESS = [
  {
    step: '01',
    title: '회사 프로필 등록',
    desc: '업종, 규모, 관심 분야 등 프로필과 알림 설정을 저장하면 규칙 기반 적합도 점수로 공고를 추천합니다.',
    icon: Building2,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: '02',
    title: '적합도 계산',
    desc: '수집된 공고에 대해 카테고리·산업·예산·마감·지원대상 키워드를 반영한 참고용 점수를 계산합니다.',
    icon: Bot,
    color: 'from-purple-500 to-pink-500',
  },
  {
    step: '03',
    title: '맞춤 공고 검토',
    desc: '적합도 순으로 정렬된 공고를 검토하고, 상세 내용·지원 자격·필요 서류를 한눈에 확인합니다.',
    icon: Search,
    color: 'from-amber-500 to-orange-500',
  },
  {
    step: '04',
    title: '파이프라인 등록',
    desc: '지원할 공고를 파이프라인에 등록하고 단계별 진행 상황을 관리합니다.',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
  },
  {
    step: '05',
    title: '서류 준비 & 제출',
    desc: '필요 서류를 템플릿으로 빠르게 준비하고, 제출 마감일을 캘린더로 관리합니다.',
    icon: FileCheck,
    color: 'from-rose-500 to-red-500',
  },
  {
    step: '06',
    title: '선정 & 사후관리',
    desc: '선정 결과 확인부터 지원금 수령, 사업 수행 보고서 관리까지 원스톱으로 처리합니다.',
    icon: TrendingUp,
    color: 'from-indigo-500 to-violet-500',
  },
];

const FAQ = [
  {
    q: 'BizGrant는 어떤 회사에 도움이 되나요?',
    a: '정부지원금사업 공고를 한곳에서 찾고, 프로필·알림 설정에 맞춰 참고용 적합도를 보고 싶은 중소기업·스타트업·소상공인에게 적합합니다. 선정 가능 여부는 공고별 자격요건을 직접 확인해야 합니다.',
  },
  {
    q: '무료로 무엇을 이용할 수 있나요?',
    a: '현재 회원가입 후 공고 검색·필터, 맞춤 적합도, 알림 설정, 파이프라인, 서류 체크리스트·템플릿·보관함을 이용할 수 있습니다.',
  },
  {
    q: '데이터는 얼마나 자주 업데이트되나요?',
    a: '기업마당 API 및 HTML 게시판 수집을 통해 정기적으로 갱신합니다(환경 설정에 따라 일 1회 등). 수집 시각·출처는 공고 상세에서 확인할 수 있습니다.',
  },
  {
    q: '우리 회사 정보는 안전한가요?',
    a: '회원 정보와 업로드 파일은 서버에 저장됩니다. 운영 환경에서는 접근 제어·암호화·백업 정책을 별도로 적용해야 합니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.',
  },
  {
    q: '여러 명이 함께 사용할 수 있나요?',
    a: '팀 초대·실시간 공유·SSO는 아직 제공하지 않습니다. 파이프라인은 로그인한 계정 기준으로 관리됩니다.',
  },
  {
    q: '정부지원금사업 선정을 보장하나요?',
    a: '보장하지 않습니다. BizGrant는 공고 탐색·적합도 참고·서류 준비를 돕는 도구이며, 최종 판단과 제출은 이용자 책임입니다.',
  },
];

export default function AboutPage() {
  const { grantCount } = useLandingStats();
  const grantLabel = grantCount != null ? `${grantCount.toLocaleString()}건` : '연결 중';
  const sourceLabel = '기업마당·중기부·K-Startup 등';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20 pt-32 pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-400/15 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-400/10 to-pink-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-8 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-4 h-4" />
            정부지원금사업 탐색·준비 플랫폼
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
            당신의 회사에 <span className="gradient-text">딱 맞는</span>
            <br />
            정부지원금사업을 찾아드립니다
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            매년 많은 규모의 정부지원금사업 예산이 있지만, 공고를 찾기 어렵습니다.
            <span className="font-bold text-gray-900 dark:text-white"> BizGrant</span>는 공개 공고를 모아 검색하고,
            규칙 기반 적합도와 서류 준비 도구로 지원 준비를 돕습니다.
          </p>
          <div className="mt-10">
            <Link to="/signup" className="btn btn-primary text-lg px-10 py-4 shadow-xl shadow-brand-500/30">
              무료 회원가입
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: grantLabel, label: '신청 가능 정부지원금사업' },
              { value: sourceLabel, label: '주요 수집 소스' },
              { value: '참고용', label: '적합도 점수' },
              { value: '이메일', label: '알림 채널' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              BizGrant를 사용하면 <span className="gradient-text">무엇이 달라질까요?</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              단순한 공고 검색이 아닌, 정부지원금사업의 전 과정을 혁신합니다
            </p>
          </div>

          <div className="space-y-32">
            {BENEFITS.map((benefit, idx) => (
              <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                {/* Visual */}
                <div className="flex-1 w-full max-w-lg">
                  <div className={`relative aspect-square rounded-3xl bg-gradient-to-br ${benefit.color} p-1`}>
                    <div className="w-full h-full rounded-2.5xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-lg`}>
                        <benefit.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center">{benefit.title}</h3>
                      <p className="text-brand-600 dark:text-brand-400 font-bold mt-2">{benefit.subtitle}</p>
                      <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                        {benefit.stats.map((stat, i) => (
                          <div key={i} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <div className={`text-2xl font-extrabold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>{stat.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 mb-4">
                    <span className="w-8 h-1 rounded-full bg-brand-500" />
                    BENEFIT 0{idx + 1}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              <span className="gradient-text">6단계</span>로 완성되는 정부지원금사업 성공 루틴
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              복잡한 정부지원금사업 프로세스를 체계적으로 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROCESS.map((item, idx) => (
              <div key={idx} className="relative group">
                {idx < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(100%+0.5rem)] w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="premium-card p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-md`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-extrabold text-gray-300 dark:text-gray-600 mb-2">STEP {item.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Pro 요금 안내 (결제 준비 중)
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            요금제 페이지에 표시된 Pro(₩99,000/월)는 안내용이며, 결제·플랜 제한은 아직 연동되지 않았습니다.
            현재는 회원가입 후 주요 기능을 무료로 이용할 수 있습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Pro 안내가', value: '₩99,000/월', sub: '결제 미연동' },
              { label: '현재', value: '무료 이용', sub: '회원가입 후' },
              { label: '적합도', value: '참고용', sub: '원문 확인 필수' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="text-sm text-indigo-200 mb-2">{item.label}</div>
                <div className="text-3xl font-extrabold">{item.value}</div>
                <div className="text-xs text-indigo-300 mt-1">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/signup" className="btn bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-10 py-4 font-bold shadow-lg">
              무료 회원가입
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              자주 묻는 질문
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <details key={idx} className="group premium-card p-6 cursor-pointer">
                <summary className="flex items-center justify-between list-none">
                  <span className="text-lg font-bold text-gray-900 dark:text-white pr-4">{item.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="premium-card p-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">지금 바로 시작하세요</h2>
            <p className="text-lg text-indigo-100 mb-8">
              회원가입 후 공고 검색·맞춤 적합도·알림 설정을 무료로 이용할 수 있습니다.
              <br />
              결제·유료 플랜은 준비 중입니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-10 py-4 font-bold shadow-lg">
                무료 회원가입
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a href="mailto:freecompr@naver.com" className="text-white/80 hover:text-white font-medium text-sm flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                도입 상담 문의
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
