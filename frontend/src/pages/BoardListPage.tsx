import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Pin, Search, PenLine, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchBoardPosts, type BoardPost } from '../api/board';
import { usePageSeo } from '../hooks/usePageSeo';
import { PAGE_SEO } from '../seo/config';
import { isLoggedIn } from '../utils/authSession';

function formatDate(value: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toLocaleDateString('ko-KR');
}

const BoardListPage: React.FC = () => {
  usePageSeo(PAGE_SEO.board);
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const page = Number(searchParams.get('page') || '0');
  const loggedIn = isLoggedIn();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const p = Number(searchParams.get('page') || '0');
    setLoading(true);
    fetchBoardPosts({ q, page: p, size: 15 })
      .then((data) => {
        setPosts(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(() => toast.error('게시글 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (keyword.trim()) next.set('q', keyword.trim());
    next.set('page', '0');
    setSearchParams(next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-2">
            <MessageSquare className="w-4 h-4" />
            Community
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">공개 게시판</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            BizGrant 이용 팁, 질문, 정보를 나누는 공간입니다. 누구나 읽을 수 있고, 회원은 글을 작성할 수 있습니다.
          </p>
        </div>
        {loggedIn ? (
          <Link to="/board/write" className="btn btn-primary shrink-0 inline-flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            글쓰기
          </Link>
        ) : (
          <Link to="/login" className="btn btn-secondary shrink-0 text-sm">
            로그인 후 글쓰기
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="premium-card p-4 mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목·내용 검색"
            className="input-premium w-full pl-9"
          />
        </div>
        <button type="submit" className="btn btn-primary px-4">검색</button>
      </form>

      {loading ? (
        <div className="premium-card p-10 text-center text-gray-500">불러오는 중…</div>
      ) : posts.length === 0 ? (
        <div className="premium-card p-10 text-center text-gray-500">
          등록된 글이 없습니다.
          {loggedIn && (
            <div className="mt-4">
              <Link to="/board/write" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                첫 글 작성하기
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/board/${post.id}`}
              className="premium-card block p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex items-start gap-2">
                {post.pinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                    <Pin className="w-3 h-3" />
                    공지
                  </span>
                )}
                <h2 className="font-bold text-gray-900 dark:text-white leading-snug">{post.title}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                <span>{post.authorName}</span>
                <span>{formatDate(post.createdAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.viewCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(i));
                setSearchParams(next);
              }}
              className={`min-w-9 h-9 rounded-lg text-sm font-semibold ${
                page === i
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardListPage;
