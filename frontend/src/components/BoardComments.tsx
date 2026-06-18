import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Reply, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createBoardComment,
  deleteBoardComment,
  fetchBoardComments,
  type BoardComment,
} from '../api/board';
import { isAdminUser, isLoggedIn } from '../utils/authSession';

type BoardCommentsProps = {
  postId: number;
};

function formatDateTime(value: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ko-KR');
}

const BoardComments: React.FC<BoardCommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<BoardComment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loggedIn = isLoggedIn();
  const admin = isAdminUser();

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBoardComments(postId);
      setComments(data);
    } catch {
      toast.error('댓글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedIn) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    const trimmed = content.trim();
    if (trimmed.length < 1) {
      toast.error('댓글 내용을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await createBoardComment(postId, {
        content: trimmed,
        parentId: replyTo?.id ?? null,
      });
      setContent('');
      setReplyTo(null);
      await loadComments();
      toast.success(replyTo ? '답글이 등록되었습니다.' : '댓글이 등록되었습니다.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '댓글 등록에 실패했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment: BoardComment) => {
    const label = admin && !comment.mine ? '관리자 권한으로 이 댓글을 삭제할까요?' : '이 댓글을 삭제할까요?';
    if (!window.confirm(label)) return;
    try {
      await deleteBoardComment(comment.id);
      await loadComments();
      toast.success('댓글이 삭제되었습니다.');
    } catch {
      toast.error('댓글 삭제에 실패했습니다.');
    }
  };

  const renderComment = (comment: BoardComment, depth = 0) => (
    <div key={comment.id} className={depth > 0 ? 'ml-4 sm:ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}>
      <div className="py-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{comment.authorName}</span>
          <span className="text-gray-400">{formatDateTime(comment.createdAt)}</span>
        </div>
        <p className="mt-2 text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{comment.content}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {loggedIn && depth === 0 && (
            <button
              type="button"
              onClick={() => {
                setReplyTo(comment);
                setContent(`@${comment.authorName} `);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-600"
            >
              <Reply className="w-3.5 h-3.5" />
              답글
            </button>
          )}
          {comment.deletable && (
            <button
              type="button"
              onClick={() => void handleDelete(comment)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {admin && !comment.mine ? '관리자 삭제' : '삭제'}
            </button>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  return (
    <section className="premium-card p-6 sm:p-8 mt-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-brand-500" />
        댓글 {totalCount}
      </h2>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">댓글 불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.</p>
      ) : (
        <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        {replyTo && (
          <div className="mb-3 flex items-center justify-between gap-2 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-2 rounded-lg">
            <span>@{replyTo.authorName} 님에게 답글 작성 중</span>
            <button type="button" onClick={() => { setReplyTo(null); setContent(''); }} className="font-semibold hover:underline">
              취소
            </button>
          </div>
        )}

        {loggedIn ? (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={4}
              className="input-premium w-full resize-y min-h-[100px]"
              placeholder={replyTo ? '답글을 입력하세요' : '댓글을 입력하세요'}
            />
            <button type="submit" disabled={submitting} className="btn btn-primary text-sm disabled:opacity-50">
              {submitting ? '등록 중…' : replyTo ? '답글 등록' : '댓글 등록'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            댓글은 <Link to="/login" className="text-brand-600 font-semibold hover:underline">로그인</Link> 후 작성할 수 있습니다.
          </p>
        )}
      </div>
    </section>
  );
};

export default BoardComments;
