import client from './client';

export type BookmarkItem = {
  id: number;
  grantId: number;
  title: string;
  organization: string;
  category: string;
  budget: string;
  applyEnd: string;
  originalUrl: string | null;
  createdAt: string;
};

export const getBookmarks = () =>
  client.get<BookmarkItem[]>('/bookmarks').then((r) => r.data);

export const getBookmarkIds = () =>
  client.get<number[]>('/bookmarks/ids').then((r) => r.data);

export const checkBookmark = (grantId: number) =>
  client.get<{ bookmarked: boolean }>(`/bookmarks/check/${grantId}`).then((r) => r.data);

export const addBookmark = (grantId: number) =>
  client.post<BookmarkItem>('/bookmarks', { grantId }).then((r) => r.data);

export const removeBookmark = (grantId: number) =>
  client.delete(`/bookmarks/${grantId}`).then((r) => r.data);
