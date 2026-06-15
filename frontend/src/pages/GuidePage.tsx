import type { ElementType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  UserPlus,
  Search,
  Target,
  Bookmark,
  Kanban,
  Bell,
  FileCheck,
  LayoutDashboard,
  Gavel,
  FolderOpen,
  ClipboardList,
  AlertCircle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

const TOC = [
  { id: 'start', label: '1. 시작하기' },
  { id: 'search', label: '2. 공고 찾기' },
  { id: 'procurement', label: '3. 나라장터' },
  { id: 'bookmark', label: '4. 북마크' },
  { id: 'pipeline', label: '5. 파이프라인' },
  { id: 'alerts', label: '6. 알림' },
  { id: 'documents', label: '7. 서류 준비' },
  { id: 'dashboard', label: '8. 대시보드·캘린더' },
  { id: 'plans', label: '9. 요금제·한도' },
  { id: 'notes', label: '10. 유의사항' },
];

const PIPELINE_STAGES = [
  { stage: '발견', desc: '관심 공고를 등록한 상태' },
  { stage: '검토', desc: '지원 여부·자격 요건 검토' },
  { stage: '준비', desc: '서류·사업계획서 작성' },
  { stage: '제출', desc: '기관에 신청·접수 완료' },
  { stage: '대기', desc: '심사·발표 대기' },
  { stage: '선정', desc: '최종 선정' },
  { stage: '탈락', desc: '미선정' },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">{children}</div>
    </section>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal list-inside space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm sm:text-base">
          {item}
        </li>
      ))}
    </ol>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
      <span className="font-semibold">팁 </span>
      {children}
    </div>
  );
}

function MenuLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline">
      {label}
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20 pt-28 pb-16">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-6 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <BookOpen className="w-4 h-4" />
            이용 가이드
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5">
            BizGrant <span className="gradient-text">사용방법</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            회원가입부터 공고 검색, 파이프라인 관리, 서류 준비까지 —
            BizGrant를 처음 쓰는 분도 따라 할 수 있도록 단계별로 정리했습니다.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="btn btn-primary px-8 py-3">
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/grants" className="btn btn-secondary px-8 py-3">
              공고 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
          {/* 목차 */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">목차</p>
              <ul className="space-y-1.5">
                {TOC.map(item => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 py-1 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* 본문 */}
          <div className="space-y-16 min-w-0">
            <Section id="start" icon={UserPlus} title="1. 시작하기">
              <p>
                BizGrant는 <strong className="text-gray-900 dark:text-white">회원가입 후</strong> 맞춤 추천·알림·파이프라인·서류 기능을
                이용할 수 있습니다. 공고 목록과 캘린더는 로그인 없이도 일부 열람할 수 있습니다.
              </p>
              <StepList
                items={[
                  '상단 「무료 시작」 또는 「회원가입」에서 이메일·비밀번호로 계정을 만듭니다.',
                  '로그인 후 상단 계정 메뉴 → 「마이페이지」에서 회사명, 업종, 규모, 관심 분야를 입력합니다.',
                  '프로필이 채워질수록 대시보드 맞춤 추천·적합도 점수가 더 의미 있게 표시됩니다.',
                  '알림을 받으려면 「알림 설정」에서 카테고리·업종·채널(이메일 등)을 저장합니다.',
                ]}
              />
              <Tip>마이페이지 프로필은 적합도 계산과 알림 조건의 기준이 됩니다. 가입 직후 한 번만 설정해 두면 이후 탐색이 편해집니다.</Tip>
              <p>
                관리자 계정은 <MenuLink to="/admin" label="관리자 대시보드" />에서 회원·동기화·플랜을 관리합니다.
              </p>
            </Section>

            <Section id="search" icon={Search} title="2. 공고 찾기 (지원사업)">
              <p>
                <MenuLink to="/grants" label="지원사업" /> 메뉴에서 기업마당·중기부·K-Startup 등에서 수집한 공고를 검색합니다.
              </p>
              <StepList
                items={[
                  '키워드·기관·카테고리·마감일 필터로 범위를 좁힙니다.',
                  '목록 카드에서 예산, 마감일(D-day), 출처를 확인합니다.',
                  '로그인 상태면 「적합도 %」가 표시됩니다. 점수는 참고용이며, 최종 자격은 공고 원문으로 확인해야 합니다.',
                  '카드를 클릭하면 상세 페이지에서 지원 내용, 신청 기간, 필요 서류, 원문 링크를 볼 수 있습니다.',
                ]}
              />
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  공고 상세에서 할 수 있는 일
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {[
                    '「북마크」 — 나중에 볼 공고 저장',
                    '「파이프라인에 추가」 — 지원 진행 관리 시작 (발견 단계)',
                    '「PDF 저장」 — 공고 요약을 파일로 보관',
                    '체크리스트·Word 초안 — Pro 이상에서 저장·자동완성 (Free는 열람 위주)',
                  ].map((row, i) => (
                    <li key={i} className="px-4 py-2.5 flex items-start gap-2">
                      <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
              <Tip>적합도는 AI가 자격을 판단하는 것이 아니라, 업종·규모·카테고리·예산·마감·키워드를 규칙으로 반영한 참고 점수입니다.</Tip>
            </Section>

            <Section id="procurement" icon={Gavel} title="3. 나라장터 (입찰공고)">
              <p>
                지원사업(보조금·R&D)과 조달 입찰은 성격이 다릅니다. <MenuLink to="/procurement" label="나라장터" /> 메뉴에서
                G2B 입찰·계약 공고를 별도로 검색할 수 있습니다.
              </p>
              <StepList
                items={[
                  '입찰공고명·기관·마감일로 필터링합니다.',
                  '상세에서 원문 사이트(나라장터) 링크로 이동해 공식 공고문을 확인합니다.',
                  '지원사업 파이프라인과 동일한 흐름으로 관리하려면, 관심 입찰도 북마크 후 별도 메모로 진행 상황을 적어 두세요.',
                ]}
              />
            </Section>

            <Section id="bookmark" icon={Bookmark} title="4. 북마크">
              <p>
                아직 지원 여부를 정하지 않은 공고는 북마크에 모아 두었다가 비교할 수 있습니다.
              </p>
              <StepList
                items={[
                  '공고 상세 또는 목록에서 북마크 아이콘을 누릅니다.',
                  '「북마크」 메뉴에서 저장한 공고 목록을 확인·삭제합니다.',
                  'Free 플랜은 최대 5건, Pro는 50건까지 저장할 수 있습니다.',
                ]}
              />
              <Tip>북마크는 「관심 목록」, 파이프라인은 「지원 진행 중」 공고로 구분해 쓰면 정리가 쉽습니다.</Tip>
            </Section>

            <Section id="pipeline" icon={Kanban} title="5. 파이프라인 (지원 진행 관리)">
              <p>
                <MenuLink to="/pipeline" label="파이프라인" />은 칸반 보드 형태로 지원 단계를 직접 옮기며 관리하는 기능입니다.
                외부 기관 시스템과 자동 연동되지 않으며, <strong className="text-gray-900 dark:text-white">사용자가 단계를 수동으로 변경</strong>합니다.
              </p>
              <StepList
                items={[
                  '공고 상세에서 「파이프라인에 추가」를 누르거나, 파이프라인 페이지에서 공고 검색 링크를 이용합니다.',
                  '처음에는 「발견」 열에 카드가 생성됩니다.',
                  '카드를 드래그하여 다음 단계 열로 끌어다 놓으면 단계가 저장됩니다.',
                  '카드를 클릭하면 메모·마감일·상세 페이지·원문 링크를 확인할 수 있습니다.',
                ]}
              />
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden text-sm">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                  7단계 흐름
                </div>
                <div className="grid sm:grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800">
                  {PIPELINE_STAGES.map((row, i) => (
                    <div key={i} className="bg-white dark:bg-gray-950 px-4 py-3">
                      <span className="font-semibold text-gray-900 dark:text-white">{row.stage}</span>
                      <span className="text-gray-500 dark:text-gray-400"> — {row.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p>상단 통계에서 전체 건수, 마감 7일 이내 긴급 건수, 선정/(선정+탈락) 성공률을 볼 수 있습니다. Free는 1건, Pro는 무제한 등록 가능합니다.</p>
            </Section>

            <Section id="alerts" icon={Bell} title="6. 알림">
              <p>
                관심 조건에 맞는 신규·적합 공고를 이메일 등으로 안내받을 수 있습니다.
              </p>
              <StepList
                items={[
                  '「알림 설정」에서 관심 카테고리·업종·최소 적합도·알림 채널을 저장합니다.',
                  '매칭된 공고는 「알림」 벨 아이콘(상단)에서 최근 이력을 확인합니다. 패널을 열면 읽음 처리되어 배지가 사라집니다.',
                  '이메일 발송은 서버 SMTP 설정이 필요합니다. Free는 하루 1건, Pro는 30건 등 플랜별 한도가 있습니다.',
                ]}
              />
              <Tip>알림 제목에는 공고명이 표시됩니다. 내용이 부족하면 알림을 눌러 공고 상세로 이동하세요.</Tip>
            </Section>

            <Section id="documents" icon={FileCheck} title="7. 서류 준비">
              <p>지원 신청 전 필요 서류를 정리하는 데 다음 기능을 활용합니다.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="premium-card p-5">
                  <ClipboardList className="w-6 h-6 text-indigo-500 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">체크리스트</h3>
                  <p className="text-sm">
                    공고 상세의 필요 서류 목록을 체크하며 진행합니다. <strong>저장</strong>은 Pro 이상에서 가능합니다.
                  </p>
                </div>
                <div className="premium-card p-5">
                  <FileCheck className="w-6 h-6 text-green-500 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Word 초안</h3>
                  <p className="text-sm">
                    사업계획서 등 템플릿을 프로필 정보로 채운 초안을 받을 수 있습니다. 기관 공식 HWP는 원문 첨부에서 받아야 합니다.
                  </p>
                </div>
                <div className="premium-card p-5 sm:col-span-2">
                  <FolderOpen className="w-6 h-6 text-amber-500 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">서류 보관함</h3>
                  <p className="text-sm">
                    <MenuLink to="/documents" label="서류 보관함" />에 사업자등록증·재무제표 등 파일을 업로드해 공고별로 재사용합니다.
                    플랜별 저장 개수 한도가 있습니다.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="dashboard" icon={LayoutDashboard} title="8. 대시보드·캘린더">
              <p>
                <MenuLink to="/dashboard" label="대시보드" />는 로그인 후 홈 화면입니다. 맞춤 추천 공고, 마감 임박 건, 최근 활동을 한눈에 보여 줍니다.
              </p>
              <StepList
                items={[
                  '추천 목록에서 적합도 순으로 공고를 검토합니다.',
                  '마감 임박·카테고리 분포 등 요약 정보를 확인합니다.',
                  '「캘린더」에서는 월별 마감 일정을 확인하고, 파이프라인·북마크 공고의 D-day를 놓치지 않도록 합니다.',
                ]}
              />
              <p>
                <MenuLink to="/calendar" label="캘린더" />는 로그인 없이도 열람할 수 있는 공개 페이지입니다.
              </p>
            </Section>

            <Section id="plans" icon={Sparkles} title="9. 요금제·한도">
              <p>
                현재 <strong className="text-gray-900 dark:text-white">결제 연동은 없으며</strong>, 가입 시 Free가 적용됩니다.
                Pro·Enterprise는 관리자가 플랜을 부여합니다. 자세한 비교는 <MenuLink to="/pricing" label="요금제" /> 페이지를 참고하세요.
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">기능</th>
                      <th className="px-4 py-3 font-semibold">Free</th>
                      <th className="px-4 py-3 font-semibold">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      ['맞춤 추천', '10건', '50건'],
                      ['일일 이메일 알림', '1건', '30건'],
                      ['파이프라인', '1건', '무제한'],
                      ['북마크', '5건', '50건'],
                      ['체크리스트 저장', '불가', '가능'],
                      ['템플릿 자동완성', '불가', '가능'],
                    ].map(([feature, free, pro], i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-gray-900 dark:text-white">{feature}</td>
                        <td className="px-4 py-2.5">{free}</td>
                        <td className="px-4 py-2.5">{pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="notes" icon={AlertCircle} title="10. 유의사항">
              <ul className="space-y-3 text-sm sm:text-base">
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  BizGrant는 공고 탐색·준비를 돕는 도구이며, <strong className="text-gray-900 dark:text-white">지원 선정이나 지원금 수령을 보장하지 않습니다.</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  적합도·추천은 참고용입니다. 반드시 기관 원문 공고에서 자격요건·제출 방법을 확인하세요.
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  수집 공고는 주기적으로 갱신되나, 최신 여부는 상세의 출처·수집 시각과 원문 링크로 재확인하세요.
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  파이프라인 단계는 내부 관리용이며, 실제 접수·심사 상태와 자동 동기화되지 않습니다.
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  팀 초대·SSO·API 등 Enterprise 일부 항목은 준비 중입니다.
                </li>
              </ul>
            </Section>

            {/* 하단 CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 sm:p-10 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">이제 직접 써 보세요</h2>
              <p className="text-indigo-100 mb-6 max-w-lg mx-auto">
                가입 후 프로필만 입력하면 맞춤 공고 추천부터 파이프라인까지 바로 시작할 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/signup" className="btn bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3 font-bold">
                  무료 회원가입
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="btn border-2 border-white/40 text-white hover:bg-white/10 px-8 py-3">
                  서비스 소개 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
