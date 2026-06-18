import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, MessageSquare } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

const PublicHeader: React.FC = () => {
  const location = useLocation();
  const isGuide = location.pathname === '/guide';
  const isBoard = location.pathname.startsWith('/board');
  const isGrants = location.pathname.startsWith('/grants') || location.pathname.startsWith('/procurement');

  const linkClass = (active: boolean) =>
    `text-sm font-semibold whitespace-nowrap transition-colors ${
      active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:text-brand-600'
    }`;

  const boardTabClass = isBoard
    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
    : 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:bg-brand-900/60';

  return (
    <header className="sticky top-0 inset-x-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center gap-2 sm:gap-3 min-w-0">
        <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-all shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
            Biz<span className="gradient-text">Grant</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-5 ml-4 shrink-0">
          <Link to="/guide" className={linkClass(isGuide)}>
            사용방법
          </Link>
          <Link to="/login" className={`inline-flex items-center gap-1.5 ${linkClass(isGrants)}`}>
            <Search className="w-4 h-4 shrink-0" />
            공고 탐색
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <DarkModeToggle />
          <Link to="/login" className={`hidden md:inline ${linkClass(false)}`}>
            로그인
          </Link>
          <Link to="/signup" className="hidden sm:inline btn btn-primary text-sm px-3 sm:px-5 py-2.5 whitespace-nowrap">
            무료 시작
          </Link>
          <Link
            to="/board"
            title="공개 게시판"
            className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${boardTabClass}`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>공개 게시판</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
