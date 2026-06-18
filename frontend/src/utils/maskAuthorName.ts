/** 게시판 작성자명 일부 마스킹 (예: 김지영 → 김*영, 김기철 → 김*철) */
export function maskAuthorName(name: string | null | undefined): string {
  if (!name?.trim()) return '익명';
  const value = name.trim();
  if (value.includes('*')) return value;
  if (value.includes('@')) {
    const at = value.indexOf('@');
    return at <= 0 ? `***${value.slice(at)}` : `${value[0]}***${value.slice(at)}`;
  }
  const chars = [...value];
  if (chars.length <= 1) return value;
  if (chars.length === 2) return `${chars[0]}*`;
  return chars[0] + '*'.repeat(chars.length - 2) + chars[chars.length - 1];
}
