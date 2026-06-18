import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Pin, Search, PenLine, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteBoardPost, fetchBoardPosts, type BoardPost } from '../api/board';
import { usePageSeo } from '../hooks/usePageSeo';
import { PAGE_SEO } from '../seo/config';
import { isAdminUser, isLoggedIn } from '../utils/authSession';

const PAGE_SIZE = 15;

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
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const page = Number(searchParams.get('page') || '0');
  const loggedIn = isLoggedIn();
  const admin = isAdminUser();

  const reloadPosts = () => {
    const q = searchParams.get('q') || '';
    const p = Number(searchParams.get('page') || '0');
    setLoading(true);
    fetchBoardPosts({ q, page: p, size: PAGE_SIZE })
      .then((data) => {
        setPosts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(() => toast.error('게시글 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  const handleDeletePost = async (post: BoardPost, asAdmin: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = asAdmin
      ? `관리자 권한으로 "${post.title}" 글을 삭제할까요?`
      : `"${post.title}" 글을 삭제할까요?`;
    if (!window.confirm(msg)) return;
    try {
      await deleteBoardPost(post.id);
      toast.success('삭제되었습니다.');
      reloadPosts();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const p = Number(searchParams.get('page') || '0');
    setLoading(true);
    fetchBoardPosts({ q, page: p, size: PAGE_SIZE })
      .then((data) => {
        setPosts(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
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

  const listNumber = (index: number, pinned: boolean) => {
    if (pinned) return '공지';
    return String(totalElements - page * PAGE_SIZE - index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            Community
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">공개 게시판</h1>
        </div>
        {loggedIn ? (
          <Link to="/board/write" className="btn btn-primary shrink-0 inline-flex items-center gap-2 text-sm">
            <PenLine className="w-4 h-4" />
            글쓰기
          </Link>
        ) : (
          <Link to="/login" className="btn btn-secondary shrink-0 text-sm">
            로그인 후 글쓰기
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="premium-card p-3 mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목·내용 검색"
            className="input-premium w-full pl-9 text-sm"
          />
        </div>
        <button type="submit" className="btn btn-primary px-3 text-sm">검색</button>
      </form>

      {loading ? (
        <div className="premium-card p-8 text-center text-sm text-gray-500">불러오는 중…</div>
      ) : posts.length === 0 ? (
        <div className="premium-card p-8 text-center text-sm text-gray-500">
          등록된 글이 없습니다.
          {loggedIn && (
            <div className="mt-3">
              <Link to="/board/write" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline text-sm">
                첫 글 작성하기
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_5rem_4.5rem_3rem] gap-x-2 px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <span className="text-center">번호</span>
            <span>제목</span>
            <span className="hidden sm:block text-center">작성자</span>
            <span className="hidden sm:block text-center">날짜</span>
            <span className="text-center">조회</span>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {posts.map((post, index) => (
              <li key={post.id} className="group">
                <Link
                  to={`/board/${post.id}`}
                  className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_5rem_4.5rem_3rem] gap-x-2 items-center px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
                    {post.pinned ? (
                      <Pin className="w-3.5 h-3.5 mx-auto text-amber-500" aria-label="공지" />
                    ) : (
                      listNumber(index, false)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600">
                      {post.pinned && (
                        <span className="text-amber-600 dark:text-amber-400 mr-1 text-xs">[공지]</span>
                      )}
                      {post.title}
                    </span>
                    <span className="sm:hidden text-[11px] text-gray-400 mt-0.5 block truncate">
                      {post.authorName} · {formatDate(post.createdAt)}
                    </span>
                  </span>
                  <span className="hidden sm:block text-center text-xs text-gray-500 truncate">{post.authorName}</span>
                  <span className="hidden sm:block text-center text-xs text-gray-400 tabular-nums">{formatDate(post.createdAt)}</span>
                  <span className="text-center text-xs text-gray-400 tabular-nums inline-flex items-center justify-center gap-0.5">
                    <Eye className="w-3 h-3 sm:hidden" />
                    {post.viewCount}
                  </span>
                </Link>
                {(post.deletable || (admin && post.adminDeletable)) && (
                  <div className="px-3 pb-2 flex gap-2">
                    {post.deletable && (
                      <button
                        type="button"
                        onClick={(e) => void handleDeletePost(post, false, e)}
                        className="text-[11px] font-semibold text-red-600 dark:text-red-400 inline-flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </button>
                    )}
                    {admin && post.adminDeletable && !post.deletable && (
                      <button
                        type="button"
                        onClick={(e) => void handleDeletePost(post, true, e)}
                        className="text-[11px] font-semibold text-red-600 dark:text-red-400 inline-flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3 h-3" />
                        관리자 삭제
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(i));
                setSearchParams(next);
              }}
              className={`min-w-8 h-8 rounded-lg text-xs font-semibold ${
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
