import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8">
        <ArrowLeft className="w-4 h-4" />
        홈으로
      </Link>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">개인정보처리방침</h1>
      <p className="text-sm text-gray-400 mb-10">시행일: 2026년 6월 12일</p>

      <div className="premium-card p-8 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
        <p className="font-semibold text-gray-900 dark:text-white">
          주식회사 에드가씨에스티(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제1조 (개인정보의 처리 목적)</h2>
          <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li><strong>회원 가입 및 관리:</strong> 회원 가입 의사 확인, 회원제 서비스 이용에 따른 본인 식별·인증, 회원 자격 유지·관리, 서비스 부정 이용 방지, 각종 고지·통지</li>
            <li><strong>서비스 제공:</strong> 콘텐츠 제공, 맞춤형 서비스 제공, 본인 인증, 요금 결제·정산</li>
            <li><strong>고충 처리:</strong> 민원인의 신원 확인, 민원 사항 확인, 사실 조사를 위한 연락·통지, 처리 결과 통보</li>
            <li><strong>마케팅 및 광고:</strong> 신규 서비스 개발 및 맞춤형 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여 기회 제공, 서비스의 유효성 확인, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제2조 (처리하는 개인정보의 항목 및 수집 방법)</h2>
          <p className="mb-2">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
          <table className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-xs font-bold">구분</th>
                <th className="px-4 py-2 text-xs font-bold">수집 항목</th>
                <th className="px-4 py-2 text-xs font-bold">수집 방법</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 text-xs align-top">필수</td>
                <td className="px-4 py-2 text-xs">이름, 이메일, 비밀번호, 회사명</td>
                <td className="px-4 py-2 text-xs">회원가입</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-xs align-top">선택</td>
                <td className="px-4 py-2 text-xs">사업자등록번호, 전화번호, 업종, 회사 규모</td>
                <td className="px-4 py-2 text-xs">회원가입</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-xs align-top">자동 수집</td>
                <td className="px-4 py-2 text-xs">IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보</td>
                <td className="px-4 py-2 text-xs">서비스 이용 중 자동 수집</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-xs align-top">소셜 로그인</td>
                <td className="px-4 py-2 text-xs">Google/네이버/카카오 계정 식별자, 이메일, 이름</td>
                <td className="px-4 py-2 text-xs">소셜 로그인 시 제공 동의</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제3조 (개인정보의 처리 및 보유 기간)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</li>
            <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
              <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                <li>회원 가입 및 관리: 회원 탈퇴 시까지. 다만, 다음 사유에 해당하는 경우에는 해당 사유 종료 시까지
                  <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                    <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우: 해당 수사·조사 종료 시까지</li>
                    <li>서비스 이용에 따른 채권·채무 관계 잔존 시: 해당 채권·채무 관계 정산 시까지</li>
                  </ul>
                </li>
                <li>서비스 이용 기록, 접속 로그, 접속 IP: 「통신비밀보호법」에 따라 3개월</li>
                <li>전자상거래 등에서의 소비자 보호에 관한 법률에 따른 표시·광고, 계약 내용 및 이행 등 거래에 관한 기록: 5년</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제4조 (개인정보의 제3자 제공)</h2>
          <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제5조 (개인정보 처리의 위탁)</h2>
          <p>회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 외부에 위탁하고 있습니다.</p>
          <table className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-xs font-bold">수탁 업체</th>
                <th className="px-4 py-2 text-xs font-bold">위탁 업무</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr><td className="px-4 py-2 text-xs">Amazon Web Services (AWS)</td><td className="px-4 py-2 text-xs">서비스 인프라 운영</td></tr>
              <tr><td className="px-4 py-2 text-xs">Google (Firebase)</td><td className="px-4 py-2 text-xs">푸시 알림 발송</td></tr>
            </tbody>
          </table>
          <p className="mt-2">회사는 위탁 계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁 업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호 조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제6조 (개인정보의 파기 절차 및 방법)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
            <li>정보주체로부터 동의 받은 개인정보 보유 기간이 경과하거나 처리 목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관 장소를 달리하여 보존합니다.</li>
            <li>개인정보 파기의 절차 및 방법은 다음과 같습니다.
              <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                <li><strong>파기 절차:</strong> 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호 책임자의 승인을 받아 개인정보를 파기합니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 파기하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제7조 (정보주체의 권리·의무 및 행사 방법)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리 정지 요구 등의 권리를 행사할 수 있습니다.</li>
            <li>제1항에 따른 권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
            <li>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
            <li>권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 「개인정보 보호법」 시행규칙 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제8조 (개인정보의 안전성 확보 조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li><strong>관리적 조치:</strong> 내부 관리 계획 수립·시행, 정기적 직원 교육, 개인정보 취급자 최소화</li>
            <li><strong>기술적 조치:</strong> 개인정보 암호화, 해킹 등에 대비한 보안 프로그램 설치·갱신, 접근 통제 시스템 운영</li>
            <li><strong>물리적 조치:</strong> 개인정보 보관 장소의 접근 통제, 문서 보관을 위한 잠금 장치</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제9조 (자동 수집 장치의 설치·운영 및 거부)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</li>
            <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수도 있습니다.</li>
            <li>쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제10조 (개인정보 보호 책임자)</h2>
          <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호 책임자를 지정하고 있습니다.</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2 space-y-1">
            <p><strong className="text-gray-900 dark:text-white">▶ 개인정보 보호 책임자</strong></p>
            <p>성명: 김기철</p>
            <p>직책: 대표이사</p>
            <p>연락처: freecompr@naver.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제11조 (개인정보 열람 청구)</h2>
          <p>정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다. 회사는 정보주체의 개인정보 열람 청구가 신속하게 처리되도록 노력하겠습니다.</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2 space-y-1">
            <p><strong className="text-gray-900 dark:text-white">▶ 개인정보 열람 청구 접수·처리 부서</strong></p>
            <p>부서명: 고객지원팀</p>
            <p>담당자: 고객지원 매니저</p>
            <p>연락처: freecompr@naver.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제12조 (권익 침해 구제 방법)</h2>
          <p>정보주체는 개인정보 침해로 인한 구제를 받기 위하여 개인정보 분쟁 조정 위원회, 한국인터넷진흥원 개인정보 침해 신고 센터 등에 분쟁 해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타 개인정보 침해의 신고, 상담에 대하여는 아래의 기관에 문의하시기 바랍니다.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>개인정보 분쟁 조정 위원회: (국번 없이) 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보 침해 신고 센터: (국번 없이) 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청 사이버수사과: (국번 없이) 1301 (www.spo.go.kr)</li>
            <li>경찰청 사이버안전국: (국번 없이) 182 (cyberbureau.police.go.kr)</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제13조 (개인정보처리방침의 변경)</h2>
          <p>이 개인정보처리방침은 2026년 6월 12일부터 적용됩니다. 법령·정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는 변경 사유 및 내용 등을 시행일 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
