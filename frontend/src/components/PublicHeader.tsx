import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, MessageSquare } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

const PublicHeader: React.FC = () => {
  const location = useLocation();
  const isGuide = location.pathname === '/guide';
  const isBoard = location.pathname.startsWith('/board');
  const isGrants = location.pathname.startsWith('/grants') || location.pathname.startsWith('/procurement');

  const navClass = (active: boolean) =>
    `text-sm font-semibold transition-colors whitespace-nowrap ${
      active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:text-brand-600'
    }`;

  const boardClass = `inline-flex items-center gap-1.5 shrink-0 ${navClass(isBoard)}`;

  return (
    <header className="sticky top-0 inset-x-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Biz<span className="gradient-text">Grant</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 flex-1 min-w-0 px-4">
          <Link to="/guide" className={navClass(isGuide)}>
            사용방법
          </Link>
          <Link to="/login" className={`inline-flex items-center gap-1.5 ${navClass(isGrants)}`}>
            <Search className="w-4 h-4 shrink-0" />
            공고 탐색
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <DarkModeToggle />
          <Link to="/login" className={`hidden sm:inline ${navClass(false)}`}>
            로그인
          </Link>
          <Link to="/signup" className="btn btn-primary text-sm px-4 sm:px-5 py-2.5 whitespace-nowrap">
            무료 시작
          </Link>
          <Link to="/board" className={boardClass}>
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">공개 게시판</span>
            <span className="sm:hidden text-xs">게시판</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
