import React, { useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GrantListPage from './pages/GrantListPage';
import ProcurementPage from './pages/ProcurementPage';
import GrantDetailPage from './pages/GrantDetailPage';
import AlertConfigPage from './pages/AlertConfigPage';
import PricingPage from './pages/PricingPage';
import CalendarPage from './pages/CalendarPage';
import PipelinePage from './pages/PipelinePage';
import BookmarksPage from './pages/BookmarksPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import GuidePage from './pages/GuidePage';
import NewsletterUnsubscribePage from './pages/NewsletterUnsubscribePage';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';
import BoardWritePage from './pages/BoardWritePage';
import BackToTop from './components/BackToTop';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import ScrollToTopOnNavigate from './components/ScrollToTopOnNavigate';
import AnalyticsPageView from './components/AnalyticsPageView';
import SiteHeader from './components/SiteHeader';
import AdminRoute from './components/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DocumentArchivePage from './pages/DocumentArchivePage';
import MyPage from './pages/MyPage';
import { syncAuthSession } from './utils/authSession';

// Initialize dark mode from localStorage on mount
const useDarkModeInit = () => {
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
};

// Layout wrapper for authenticated pages — shows Navbar
const AppLayout: React.FC = () => {
  useDarkModeInit();
  useEffect(() => {
    void syncAuthSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

// Public layout — SiteHeader shows Navbar when logged in, PublicHeader when guest
const PublicLayout: React.FC = () => {
  useDarkModeInit();
  useEffect(() => {
    void syncAuthSession();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

const App: React.FC = () => {
  useDarkModeInit();
  return (
    <>
      <ScrollToTopOnNavigate />
      <AnalyticsPageView />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '14px',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '14px',
            fontWeight: '500',
            padding: '14px 20px',
          },
        }}
      />
      <Chatbot />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/write" element={<BoardWritePage />} />
          <Route path="/board/:id/edit" element={<BoardWritePage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />
          <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribePage />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/grants" element={<GrantListPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/grants/:id" element={<GrantDetailPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/documents" element={<DocumentArchivePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/alerts" element={<AlertConfigPage />} />
          <Route path="/pricing-manage" element={<PricingPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
