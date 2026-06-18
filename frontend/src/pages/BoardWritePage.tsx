import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBoardPost, fetchBoardPost, updateBoardPost } from '../api/board';
import { usePageSeo } from '../hooks/usePageSeo';
import { isLoggedIn } from '../utils/authSession';

const BoardWritePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const postId = editing ? Number(id) : null;

  usePageSeo({
    title: editing ? '게시글 수정' : '글쓰기',
    description: 'BizGrant 공개 게시판',
    path: editing ? `/board/${id}/edit` : '/board/write',
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      toast.error('로그인이 필요합니다.');
      navigate('/login', { state: { from: editing ? `/board/${id}/edit` : '/board/write' } });
    }
  }, [navigate, editing, id]);

  useEffect(() => {
    if (!editing || !postId || Number.isNaN(postId)) return;
    setLoading(true);
    fetchBoardPost(postId)
      .then((post) => {
        if (!post.editable) {
          toast.error('수정 권한이 없습니다.');
          navigate(`/board/${postId}`);
          return;
        }
        setTitle(post.title);
        setContent(post.content || '');
      })
      .catch(() => {
        toast.error('게시글을 불러오지 못했습니다.');
        navigate('/board');
      })
      .finally(() => setLoading(false));
  }, [editing, postId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (trimmedTitle.length < 2 || trimmedContent.length < 2) {
      toast.error('제목과 내용을 2자 이상 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const payload = { title: trimmedTitle, content: trimmedContent };
      const saved = editing && postId
        ? await updateBoardPost(postId, payload)
        : await createBoardPost(payload);
      toast.success(editing ? '수정되었습니다.' : '등록되었습니다.');
      navigate(`/board/${saved.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '저장에 실패했습니다.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">불러오는 중…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Link to={editing && postId ? `/board/${postId}` : '/board'} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        {editing ? '글 보기' : '목록으로'}
      </Link>

      <div className="premium-card p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">
          {editing ? '게시글 수정' : '새 글 작성'}
        </h1>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="input-premium w-full mt-1.5"
              placeholder="제목을 입력하세요"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">내용</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={20000}
              rows={14}
              className="input-premium w-full mt-1.5 resize-y min-h-[240px]"
              placeholder="지원금 준비 팁, 이용 후기, 질문 등을 자유롭게 작성해 주세요."
              required
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50">
              {saving ? '저장 중…' : editing ? '수정 완료' : '등록하기'}
            </button>
            <Link to={editing && postId ? `/board/${postId}` : '/board'} className="btn btn-secondary">
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardWritePage;
