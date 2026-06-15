import client from './client';
import type {
  DocumentTemplate,
  GrantChecklist,
  UserFileItem,
} from '../types';

export async function getGrantChecklist(grantId: number): Promise<GrantChecklist> {
  const res = await client.get(`/grants/${grantId}/checklist`);
  return res.data;
}

export async function updateGrantChecklist(
  grantId: number,
  data: { checkedKeys: string[]; attachments?: Record<string, number> },
): Promise<GrantChecklist> {
  const res = await client.put(`/grants/${grantId}/checklist`, data);
  return res.data;
}

export async function getDocumentTemplates(grantId?: number): Promise<DocumentTemplate[]> {
  const res = await client.get('/document-templates', {
    params: grantId ? { grantId } : undefined,
  });
  return res.data;
}

export async function downloadDocumentTemplate(
  code: string,
  format: 'docx' | 'hwp',
  grantId?: number,
): Promise<void> {
  const token = localStorage.getItem('accessToken');
  const query = new URLSearchParams({ format });
  if (grantId) {
    query.set('grantId', String(grantId));
  }
  const res = await fetch(`/api/document-templates/${code}/download?${query.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || '템플릿 다운로드에 실패했습니다.');
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename\*=UTF-8''(.+)/);
  const filename = match ? decodeURIComponent(match[1]) : `${code.toLowerCase()}-template.${format}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function getUserFiles(): Promise<UserFileItem[]> {
  const res = await client.get('/user-files');
  return res.data;
}

export async function uploadUserFile(file: File, documentType?: string): Promise<UserFileItem> {
  const formData = new FormData();
  formData.append('file', file);
  if (documentType) {
    formData.append('documentType', documentType);
  }
  const res = await client.post('/user-files', formData);
  return res.data;
}

export async function deleteUserFile(fileId: number): Promise<void> {
  await client.delete(`/user-files/${fileId}`);
}

export async function downloadUserFile(fileId: number, filename: string): Promise<void> {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`/api/user-files/${fileId}/download`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) {
    throw new Error('파일 다운로드에 실패했습니다.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
