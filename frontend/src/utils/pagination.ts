export type PageToken = number | 'ellipsis';

export function getVisiblePages(current: number, total: number, maxButtons = 7): PageToken[] {
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (let offset = 1; offset <= 2; offset += 1) {
    if (current - offset > 1) pages.add(current - offset);
    if (current + offset < total) pages.add(current + offset);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: PageToken[] = [];

  sorted.forEach((page, index) => {
    const prev = sorted[index - 1];
    if (index > 0 && page - prev > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  });

  return result;
}
