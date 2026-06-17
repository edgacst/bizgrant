import React, { useId } from 'react';

type ChatbotAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  floating?: boolean;
};

const SIZE_MAP = {
  sm: 36,
  md: 56,
  lg: 72,
} as const;

/** BizGrant AI 도우미 캐릭터 */
const ChatbotAvatar: React.FC<ChatbotAvatarProps> = ({
  size = 'md',
  className = '',
  floating = false,
}) => {
  const px = SIZE_MAP[size];
  const uid = useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex shrink-0 ${floating ? 'animate-mascot-bob' : ''} ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-indigo-400/40 to-purple-500/30 blur-md scale-110"
      />
      <svg
        viewBox="0 0 80 80"
        width={px}
        height={px}
        className="relative drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`bg-body-${uid}`} x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="0.55" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id={`bg-face-${uid}`} x1="24" y1="22" x2="56" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#eef2ff" />
            <stop offset="1" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id={`bg-accent-${uid}`} x1="28" y1="48" x2="52" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <rect x="8" y="10" width="64" height="62" rx="22" fill={`url(#bg-body-${uid})`} />
        <rect x="11" y="13" width="58" height="56" rx="19" fill="white" fillOpacity="0.08" />

        <line x1="40" y1="10" x2="40" y2="4" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="40" cy="3" r="3" fill="#fbbf24" />

        <rect x="22" y="24" width="36" height="28" rx="12" fill={`url(#bg-face-${uid})`} />
        <ellipse cx="32" cy="38" rx="3.5" ry="4" fill="#312e81" />
        <ellipse cx="48" cy="38" rx="3.5" ry="4" fill="#312e81" />
        <circle cx="33" cy="37" r="1.2" fill="white" />
        <circle cx="49" cy="37" r="1.2" fill="white" />
        <path
          d="M30 46 Q40 51 50 46"
          stroke="#4338ca"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        <rect x="28" y="54" width="24" height="10" rx="5" fill={`url(#bg-accent-${uid})`} />
        <path
          d="M36 58.5 L39 61.5 L44 56"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="18" cy="44" r="4" fill="white" fillOpacity="0.15" />
        <circle cx="62" cy="44" r="4" fill="white" fillOpacity="0.15" />
      </svg>
    </div>
  );
};

export default ChatbotAvatar;
