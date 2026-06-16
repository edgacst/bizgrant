import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Sparkles,
  Shield,
  Kanban,
  Bookmark,
  Gavel,
  FolderOpen,
  Settings,
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import NotificationBell from './NotificationBell';
import { clearAuthSession, isAdminUser, isLoggedIn, syncAuthSession } from '../utils/authSession';

const NAV_LINKS = [
  { path: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { path: '/pipeline', label: '파이프라인', icon: Kanban },
  { path: '/grants', label: '정부지원금사업', icon: Search },
  { path: '/procurement', label: '나라장터', icon: Gavel },
  { path: '/documents', label: '서류센터', icon: FolderOpen },
];

const ACCOUNT_MENU_LINKS = [
  { path: '/mypage', label: '마이페이지', icon: User },
  { path: '/bookmarks', label: '북마크', icon: Bookmark },
  { path: '/alerts', label: '알림 설정', icon: Settings },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAdminLink, setShowAdminLink] = useState(isAdminUser());
  const [userPlan, setUserPlan] = useState(localStorage.getItem('userPlan') || 'free');

  useEffect(() => {
    if (!isLoggedIn()) {
      setShowAdminLink(false);
      return;
    }

    const updateAdminLink = () => {
      setShowAdminLink(isAdminUser());
      setUserPlan(localStorage.getItem('userPlan') || 'free');
    };
    updateAdminLink();
    void syncAuthSession().finally(updateAdminLink);
    window.addEventListener('auth-session-updated', updateAdminLink);
    return () => window.removeEventListener('auth-session-updated', updateAdminLink);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  const navLinks = showAdminLink
    ? [...NAV_LINKS, { path: '/admin', label: '관리자', icon: Shield }]
    : NAV_LINKS;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'auto' });

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center gradient-bg group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-all">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Biz<span className="gradient-text">Grant</span>
              </span>
            </Link>

            {/* Desktop Nav — lg: 아이콘, xl: 라벨 */}
            <div className="hidden lg:flex items-center justify-center gap-0.5 flex-1 min-w-0 px-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={scrollToTop}
                    title={link.label}
                    className={`relative flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 xl:px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline">{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full gradient-bg" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isLoggedIn() && (
                <span className="hidden sm:inline-flex text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  {userPlan}
                </span>
              )}
              <DarkModeToggle />

              <NotificationBell />

              {/* User Avatar Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="계정 메뉴"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 premium-card p-1.5 z-20 animate-fadeUp">
                      <Link
                        to="/mypage"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        마이페이지
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        대시보드
                      </Link>
                      {ACCOUNT_MENU_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {link.label}
                          </Link>
                        );
                      })}
                      {isAdminUser() && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          관리자
                        </Link>
                      )}
                      <hr className="my-1.5 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 glass z-50 lg:hidden animate-slideInRight shadow-2xl">
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                    Biz<span className="gradient-text">Grant</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => {
                        scrollToTop();
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
                <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  내 계정
                </p>
                {ACCOUNT_MENU_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
