import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, RotateCcw, ChevronDown } from 'lucide-react';
import ChatbotAvatar from './ChatbotAvatar';
import {
  CHATBOT_CATEGORIES,
  CHATBOT_WELCOME,
  getFaqById,
  getRelatedQuestions,
  resolveChatbotInput,
  type ChatFaqItem,
} from '../data/chatbotFaq';
import { CHATBOT_OPEN_EVENT } from '../utils/chatbot';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  faqId?: string;
};

function renderAnswerText(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 dark:text-brand-400 underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function QuestionChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-xs px-3 py-2 rounded-xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-800 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
    >
      {label}
    </button>
  );
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showAllTopics, setShowAllTopics] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(CHATBOT_CATEGORIES[0].key);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'bot', text: CHATBOT_WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const askedQuestions = useMemo(
    () => new Set(messages.filter((m) => m.role === 'user').map((m) => m.text)),
    [messages],
  );

  const lastFaqId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg.role === 'bot' && msg.faqId) return msg.faqId;
    }
    return null;
  }, [messages]);

  const relatedSuggestions = useMemo(() => {
    if (!lastFaqId || showAllTopics) return [];
    return getRelatedQuestions(lastFaqId, askedQuestions);
  }, [lastFaqId, showAllTopics, askedQuestions]);

  const activeCategoryItems = useMemo(() => {
    const category = CHATBOT_CATEGORIES.find((c) => c.key === activeCategory);
    if (!category) return [];
    return category.itemIds
      .map((id) => getFaqById(id))
      .filter((item): item is ChatFaqItem => !!item);
  }, [activeCategory]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(CHATBOT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CHATBOT_OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus();
  }, [open, messages, showAllTopics, relatedSuggestions, activeCategory]);

  const pushBotAnswer = (question: string) => {
    const reply = resolveChatbotInput(question);
    setShowAllTopics(reply.showAllTopics);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: question },
      {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: reply.answer,
        faqId: reply.faqId,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    pushBotAnswer(trimmed);
  };

  const resetChat = () => {
    setMessages([{ id: 'welcome', role: 'bot', text: CHATBOT_WELCOME }]);
    setInput('');
    setShowAllTopics(true);
    setActiveCategory(CHATBOT_CATEGORIES[0].key);
  };

  const renderCategoryMenu = () => (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-gray-800 dark:text-gray-100">자주 묻는 질문</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          24개
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {CHATBOT_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveCategory(category.key)}
            className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === category.key
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300'
            }`}
          >
            {category.key}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3">
        <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-2.5">{activeCategory}</p>
        <div className="flex flex-col gap-1.5">
          {activeCategoryItems.map((item) => (
            <QuestionChip
              key={item.id}
              label={item.question}
              onClick={() => pushBotAnswer(item.question)}
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
        <ChevronDown className="w-3 h-3" />
        위 주제 탭을 눌러 다른 질문도 볼 수 있어요
      </p>
    </div>
  );

  const renderRelatedMenu = () => {
    if (relatedSuggestions.length === 0) {
      return (
        <button
          type="button"
          onClick={() => setShowAllTopics(true)}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          ← 전체 주제 보기 (24개)
        </button>
      );
    }

    const lastItem = lastFaqId ? getFaqById(lastFaqId) : null;

    return (
      <div className="space-y-2.5 pt-1">
        <div className="rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/80 dark:bg-brand-900/25 px-3 py-2.5">
          <p className="text-xs font-bold text-brand-700 dark:text-brand-300">이어서 물어보세요</p>
          {lastItem && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              「{lastItem.question}」 관련
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {relatedSuggestions.map((item: ChatFaqItem) => (
            <QuestionChip
              key={item.id}
              label={item.question}
              onClick={() => pushBotAnswer(item.question)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowAllTopics(true)}
          className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          ← 다른 주제 전체 보기
        </button>
      </div>
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/30 dark:bg-black/50 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="fixed bottom-20 right-2 left-2 sm:left-auto sm:right-6 sm:bottom-24 z-[100] flex flex-col items-stretch sm:items-end gap-3 pointer-events-none">
        {open && (
          <div
            className="w-full sm:w-[min(100vw-2rem,28rem)] h-[min(82dvh,42rem)] sm:h-[min(78vh,42rem)] premium-card flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeUp pointer-events-auto bg-white dark:bg-gray-900"
            role="dialog"
            aria-label="BizGrant AI 도우미"
          >
            <div className="flex items-center justify-between px-4 py-3.5 gradient-bg text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-2xl bg-white/15 p-1 ring-1 ring-white/20 overflow-visible shrink-0">
                  <ChatbotAvatar size="sm" floating />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm">Grant AI</p>
                  <p className="text-xs text-white/80 truncate">BizGrant 공식 도우미</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={resetChat}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="대화 초기화"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="챗봇 닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 bg-gray-50/90 dark:bg-gray-950/50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="mt-0.5 shrink-0 overflow-visible">
                      <ChatbotAvatar size="sm" floating />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.role === 'bot' ? renderAnswerText(msg.text) : msg.text}
                  </div>
                </div>
              ))}

              <div className="pl-11">
                {showAllTopics ? renderCategoryMenu() : renderRelatedMenu()}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="궁금한 내용을 입력하세요"
                className="input-premium flex-1 text-sm py-2.5 min-w-0"
                maxLength={200}
              />
              <button
                type="submit"
                className="btn btn-primary px-3 py-2.5 shrink-0"
                aria-label="보내기"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="shrink-0 px-3 pb-2.5 text-[10px] text-gray-400 dark:text-gray-500 flex gap-2">
              <Link to="/guide" className="hover:text-brand-600 dark:hover:text-brand-400" onClick={() => setOpen(false)}>
                사용 가이드
              </Link>
              <span>·</span>
              <Link to="/signup" className="hover:text-brand-600 dark:hover:text-brand-400" onClick={() => setOpen(false)}>
                회원가입
              </Link>
            </div>
          </div>
        )}

        <div className="relative pointer-events-auto self-end">
          {!open && (
            <span className="absolute top-1 right-0 flex h-4 w-4 z-10 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 ring-2 ring-white dark:ring-gray-900" />
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`group relative flex items-center justify-center transition-transform duration-300 ${
              open
                ? 'w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg'
                : 'w-16 h-20 bg-transparent border-0 shadow-none p-0 hover:scale-105'
            }`}
            aria-label={open ? '챗봇 닫기' : 'Grant AI 도우미 열기'}
            aria-expanded={open}
          >
            {open ? (
              <X className="w-5 h-5" />
            ) : (
              <ChatbotAvatar size="lg" bob="strong" />
            )}
          </button>
          {!open && (
            <div className="absolute right-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg px-3.5 py-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">Grant AI</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">무엇을 도와드릴까요?</p>
              </div>
              <div className="w-2 h-2 rotate-45 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 -ml-3" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chatbot;
