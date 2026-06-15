import client from './client';
import type { PipelineItem, PipelineStats } from '../types';

export const getPipeline = () => client.get<PipelineItem[]>('/pipeline').then(r => r.data);
export const moveToStage = (grantId: number, stage: string) =>
  client.post('/pipeline/move', { grantId, stage }).then(r => r.data);
export const addToPipeline = (grantId: number, stage?: string, notes?: string) =>
  client.post('/pipeline/add', { grantId, stage, notes }).then(r => r.data);
export const removeFromPipeline = (grantId: number) =>
  client.delete(`/pipeline/${grantId}`).then(r => r.data);
export const updatePipelineItem = (grantId: number, data: { notes?: string; documents?: string[] }) =>
  client.put(`/pipeline/${grantId}`, data).then(r => r.data);
export const getPipelineStats = () => client.get<PipelineStats>('/pipeline/stats').then(r => r.data);
