import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Pin, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteBoardPost, fetchBoardPost, pinBoardPost, type BoardPost } from '../api/board';
import { usePageSeo } from '../hooks/usePageSeo';
import { isAdminUser, isLoggedIn } from '../utils/authSession';

function formatDateTime(value: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ko-KR');
}

const BoardDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);

  usePageSeo(
    post
      ? {
          title: post.title,
          description: post.excerpt || post.title,
          path: `/board/${post.id}`,
        }
      : { title: '게시글', description: 'BizGrant 공개 게시판', path: `/board/${postId}` },
  );

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) return;
    setLoading(true);
    fetchBoardPost(postId)
      .then(setPost)
      .catch(() => {
        toast.error('게시글을 불러오지 못했습니다.');
        navigate('/board');
      })
      .finally(() => setLoading(false));
  }, [postId, navigate]);

  const handleDelete = async () => {
    if (!post || !window.confirm('이 글을 삭제할까요?')) return;
    try {
      await deleteBoardPost(post.id);
      toast.success('삭제되었습니다.');
      navigate('/board');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handlePin = async () => {
    if (!post) return;
    try {
      const updated = await pinBoardPost(post.id, !post.pinned);
      setPost(updated);
      toast.success(updated.pinned ? '상단에 고정했습니다.' : '고정을 해제했습니다.');
    } catch {
      toast.error('고정 설정에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">불러오는 중…</div>;
  }

  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Link to="/board" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </Link>

      <article className="premium-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <Pin className="w-3 h-3" />
              공지
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{post.authorName}</span>
          <span>{formatDateTime(post.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-4 h-4" />
            조회 {post.viewCount}
          </span>
        </div>

        <div className="mt-8 text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          {post.editable && (
            <Link to={`/board/${post.id}/edit`} className="btn btn-secondary text-sm inline-flex items-center gap-1.5">
              <Pencil className="w-4 h-4" />
              수정
            </Link>
          )}
          {post.editable && (
            <button type="button" onClick={() => void handleDelete()} className="btn btn-secondary text-sm inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          )}
          {isAdminUser() && (
            <button type="button" onClick={() => void handlePin()} className="btn btn-secondary text-sm inline-flex items-center gap-1.5">
              <Pin className="w-4 h-4" />
              {post.pinned ? '고정 해제' : '상단 고정'}
            </button>
          )}
          {!isLoggedIn() && (
            <p className="text-xs text-gray-500 self-center">글쓰기는 로그인 후 이용할 수 있습니다.</p>
          )}
        </div>
      </article>
    </div>
  );
};

export default BoardDetailPage;
