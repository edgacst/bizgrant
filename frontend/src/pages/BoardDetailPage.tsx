import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Pin, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BoardComments from '../components/BoardComments';
import { deleteBoardPost, fetchBoardPost, pinBoardPost, type BoardPost } from '../api/board';
import { usePageSeo } from '../hooks/usePageSeo';
import { isAdminUser, isLoggedIn } from '../utils/authSession';
import { maskAuthorName } from '../utils/maskAuthorName';

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
  const admin = isAdminUser();

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

  const handleDelete = async (asAdmin: boolean) => {
    if (!post) return;
    const msg = asAdmin
      ? '관리자 권한으로 이 글을 삭제할까요? 댓글도 함께 삭제됩니다.'
      : '이 글을 삭제할까요? 댓글도 함께 삭제됩니다.';
    if (!window.confirm(msg)) return;
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
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-gray-500">불러오는 중…</div>;
  }

  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Link to="/board" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        목록으로
      </Link>

      <article className="premium-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-bold text-brand-600 dark:text-brand-400 tabular-nums">No. {post.id}</span>
          {post.pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <Pin className="w-3 h-3" />
              공지
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-snug">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">{maskAuthorName(post.authorName)}</span>
          <span>·</span>
          <span>{formatDateTime(post.createdAt)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            조회 {post.viewCount}
          </span>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          {post.editable && (
            <Link to={`/board/${post.id}/edit`} className="btn btn-secondary text-sm inline-flex items-center gap-1.5">
              <Pencil className="w-4 h-4" />
              수정
            </Link>
          )}
          {post.deletable && (
            <button
              type="button"
              onClick={() => void handleDelete(false)}
              className="btn btn-secondary text-sm inline-flex items-center gap-1.5 text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          )}
          {admin && post.adminDeletable && !post.deletable && (
            <button
              type="button"
              onClick={() => void handleDelete(true)}
              className="btn btn-secondary text-sm inline-flex items-center gap-1.5 text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              관리자 삭제
            </button>
          )}
          {admin && (
            <button type="button" onClick={() => void handlePin()} className="btn btn-secondary text-sm inline-flex items-center gap-1.5">
              <Pin className="w-4 h-4" />
              {post.pinned ? '고정 해제' : '상단 고정'}
            </button>
          )}
          {!isLoggedIn() && (
            <p className="text-xs text-gray-500 self-center">글쓰기·댓글은 로그인 후 이용할 수 있습니다.</p>
          )}
        </div>
      </article>

      <BoardComments postId={post.id} />
    </div>
  );
};

export default BoardDetailPage;
