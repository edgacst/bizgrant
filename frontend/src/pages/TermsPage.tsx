import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-8">
        <ArrowLeft className="w-4 h-4" />
        홈으로
      </Link>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">이용약관</h1>
      <p className="text-sm text-gray-400 mb-10">시행일: 2026년 6월 12일</p>

      <div className="premium-card p-8 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
        <p className="font-semibold text-gray-900 dark:text-white">
          주식회사 에드가씨에스티(이하 "회사")가 제공하는 BizGrant 서비스(이하 "서비스") 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항을 규정합니다.
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제1조 (목적)</h2>
          <p>본 약관은 회사가 운영하는 BizGrant 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임 사항을 정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제2조 (용어의 정의)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>"서비스"란 회사가 제공하는 정부 지원사업·조달 정보 매칭, 알림, 파이프라인 관리 등 일체의 온라인 서비스를 말합니다.</li>
            <li>"회원"이란 본 약관에 동의하고 회사와 이용 계약을 체결한 자를 말합니다.</li>
            <li>"유료 서비스"란 회사가 유료로 제공하는 Pro, Enterprise 등 요금제를 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</li>
            <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일 7일 전부터 공지합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제4조 (회원가입 및 계정)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>회원가입은 이용자가 약관에 동의하고 회사가 정한 절차에 따라 가입 신청을 하며, 회사가 이를 승낙함으로써 성립합니다.</li>
            <li>회원은 정확한 정보를 제공해야 하며, 계정 정보 관리 책임은 회원에게 있습니다.</li>
            <li>회원은 타인에게 계정을 양도·대여할 수 없습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제5조 (서비스의 제공)</h2>
          <p>회사는 지원사업·조달 공고 정보 수집, 규칙 기반 맞춤 적합도(참고용), 이메일 알림, 파이프라인 관리 등 서비스를 제공합니다. 공고 정보는 외부 기관 API·공개 데이터를 기반으로 하며, 회사는 정보의 완전성·정확성·최신성을 보장하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제6조 (회원의 의무)</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>관련 법령, 본 약관, 서비스 이용 안내를 준수해야 합니다.</li>
            <li>서비스를 부정 이용하거나 타인의 권리를 침해해서는 안 됩니다.</li>
            <li>수집된 데이터를 무단 복제·배포·재판매해서는 안 됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제7조 (유료 서비스 및 환불)</h2>
          <p>유료 서비스의 요금·결제·환불 정책은 요금제 페이지 및 별도 안내에 따릅니다. 현재 결제 기능은 제공되지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제8조 (면책)</h2>
          <p>회사는 천재지변, 시스템 장애, 제3자 API 오류 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다. 지원사업 선정 결과에 대해 회사는 보증하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제9조 (문의)</h2>
          <p>서비스 이용 관련 문의: freecompr@naver.com</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsPage;

