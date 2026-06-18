import client from './client';

export type BoardPost = {
  id: number;
  title: string;
  content: string | null;
  excerpt: string;
  authorId: number | null;
  authorName: string;
  pinned: boolean;
  viewCount: number;
  published: boolean;
  mine: boolean;
  editable: boolean;
  deletable: boolean;
  adminDeletable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BoardPostPage = {
  content: BoardPost[];
  totalPages: number;
  totalElements: number;
  number: number;
};

export type BoardPostPayload = {
  title: string;
  content: string;
};

export const fetchBoardPosts = (params?: { q?: string; page?: number; size?: number }) =>
  client
    .get<BoardPostPage>('/board/posts', { params })
    .then((r) => r.data);

export const fetchBoardPost = (id: number) =>
  client.get<BoardPost>(`/board/posts/${id}`).then((r) => r.data);

export const createBoardPost = (payload: BoardPostPayload) =>
  client.post<BoardPost>('/board/posts', payload).then((r) => r.data);

export const updateBoardPost = (id: number, payload: BoardPostPayload) =>
  client.put<BoardPost>(`/board/posts/${id}`, payload).then((r) => r.data);

export const deleteBoardPost = (id: number) =>
  client.delete(`/board/posts/${id}`).then((r) => r.data);

export const pinBoardPost = (id: number, pinned: boolean) =>
  client.patch<BoardPost>(`/board/posts/${id}/pin`, { pinned }).then((r) => r.data);

export type BoardComment = {
  id: number;
  postId: number;
  parentId: number | null;
  authorId: number | null;
  authorName: string;
  content: string;
  mine: boolean;
  deletable: boolean;
  createdAt: string;
  replies: BoardComment[];
};

export type BoardCommentPayload = {
  content: string;
  parentId?: number | null;
};

export const fetchBoardComments = (postId: number) =>
  client.get<BoardComment[]>(`/board/posts/${postId}/comments`).then((r) => r.data);

export const createBoardComment = (postId: number, payload: BoardCommentPayload) =>
  client.post<BoardComment>(`/board/posts/${postId}/comments`, payload).then((r) => r.data);

export const deleteBoardComment = (commentId: number) =>
  client.delete(`/board/comments/${commentId}`).then((r) => r.data);
