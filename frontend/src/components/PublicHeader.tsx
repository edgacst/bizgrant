import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, MessageSquare } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

const PublicHeader: React.FC = () => {
  const location = useLocation();
  const isGuide = location.pathname === '/guide';
  const isBoard = location.pathname.startsWith('/board');
  const isGrants = location.pathname.startsWith('/grants') || location.pathname.startsWith('/procurement');

  const navLink = (active: boolean) =>
    `hidden sm:inline text-sm font-semibold transition-colors ${
      active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300 hover:text-brand-600'
    }`;

  return (
    <header className="sticky top-0 inset-x-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Biz<span className="gradient-text">Grant</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link to="/guide" className={navLink(isGuide)}>
            사용방법
          </Link>
          <Link to="/board" className={navLink(isBoard)}>
            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
            게시판
          </Link>
          <Link to="/login" className={navLink(isGrants)}>
            <Search className="w-3.5 h-3.5 inline mr-1" />
            공고 탐색
          </Link>
          <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-600">
            로그인
          </Link>
          <Link to="/signup" className="btn btn-primary text-sm px-5 py-2.5">
            무료 시작
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
