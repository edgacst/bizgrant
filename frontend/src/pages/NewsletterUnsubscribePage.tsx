import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, MailX, Sparkles } from 'lucide-react';
import client from '../api/client';

const NewsletterUnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('유효하지 않은 구독 해지 링크입니다.');
      return;
    }

    client.get('/newsletter/unsubscribe', { params: { token } })
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.message || '뉴스레터 구독이 해지되었습니다.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message || '구독 해지 처리에 실패했습니다.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="premium-card max-w-md w-full p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
            status === 'success' ? 'bg-green-100 text-green-600' :
            status === 'error' ? 'bg-red-100 text-red-600' :
            'bg-brand-100 text-brand-600'
          }`}>
            {status === 'success' ? <MailCheck className="w-8 h-8" /> :
             status === 'error' ? <MailX className="w-8 h-8" /> :
             <Sparkles className="w-8 h-8 animate-pulse" />}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
            {status === 'loading' ? '처리 중...' :
             status === 'success' ? '구독 해지 완료' : '처리 실패'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
          <Link to="/" className="btn btn-primary w-full justify-center">
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NewsletterUnsubscribePage;
