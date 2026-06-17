import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, RotateCcw } from 'lucide-react';
import ChatbotAvatar from './ChatbotAvatar';
import {
  CHATBOT_QUICK_REPLIES,
  CHATBOT_WELCOME,
  findChatbotAnswer,
} from '../data/chatbotFaq';
import { CHATBOT_OPEN_EVENT } from '../utils/chatbot';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

const FALLBACK_ANSWER =
  '질문을 이해하지 못했습니다.\n아래 자주 묻는 질문을 누르거나, 문의: freecompr@naver.com';

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

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'bot', text: CHATBOT_WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(CHATBOT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CHATBOT_OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus();
  }, [open, messages]);

  const pushBotAnswer = (question: string) => {
    const item = findChatbotAnswer(question);
    const answer = item?.answer ?? FALLBACK_ANSWER;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: question },
      { id: `bot-${Date.now()}`, role: 'bot', text: answer },
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
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/20 dark:bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="fixed bottom-24 right-4 sm:right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        {open && (
          <div
            className="w-[min(100vw-2rem,22rem)] h-[min(70vh,32rem)] premium-card flex flex-col shadow-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden animate-fadeUp pointer-events-auto"
            role="dialog"
            aria-label="BizGrant AI 도우미"
          >
            <div className="flex items-center justify-between px-4 py-3 gradient-bg text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-1 ring-1 ring-white/20 overflow-visible">
                  <ChatbotAvatar size="sm" floating />
                </div>
                <div>
                  <p className="font-bold text-sm">Grant AI</p>
                  <p className="text-xs text-white/80">BizGrant 공식 도우미</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
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

            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/80 dark:bg-gray-900/50">
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
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.role === 'bot' ? renderAnswerText(msg.text) : msg.text}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-1.5 pt-1 pl-11">
                {CHATBOT_QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => pushBotAnswer(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-800 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                  >
                    {q}
                  </button>
                ))}
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
                className="input-premium flex-1 text-sm py-2.5"
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

            <div className="shrink-0 px-3 pb-2 text-[10px] text-gray-400 dark:text-gray-500 flex gap-2">
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

        <div className="relative pointer-events-auto">
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`group relative flex items-center justify-center transition-all duration-300 ${
              open
                ? 'w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg'
                : 'w-[4.5rem] h-[4.5rem] rounded-[1.35rem] bg-white dark:bg-gray-900 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-100 dark:ring-indigo-900/50 hover:shadow-2xl hover:shadow-indigo-500/30'
            }`}
            aria-label={open ? '챗봇 닫기' : 'Grant AI 도우미 열기'}
            aria-expanded={open}
          >
            {open ? (
              <X className="w-5 h-5" />
            ) : (
              <ChatbotAvatar size="md" floating />
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
