import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  X,
  FileText,
  AlertTriangle,
  TrendingUp,
  Target,
  Package,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import type { PipelineItem, PipelineStats } from '../types';
import * as pipelineApi from '../api/pipeline';
import { normalizePipelineStats } from '../utils/pipelineStats';
import toast from 'react-hot-toast';
import { usePlan } from '../hooks/usePlan';
import { formatLimit } from '../api/plan';
import PlanUpgradeHint from '../components/PlanUpgradeHint';

const PIPELINE_STAGES = [
  { id: 'DISCOVERED', title: '발견', color: 'indigo', count: 0 },
  { id: 'REVIEWING', title: '검토', color: 'amber', count: 0 },
  { id: 'PREPARING', title: '준비', color: 'blue', count: 0 },
  { id: 'SUBMITTED', title: '제출', color: 'green', count: 0 },
  { id: 'WAITING', title: '대기', color: 'purple', count: 0 },
  { id: 'SELECTED', title: '선정', color: 'cyan', count: 0 },
  { id: 'REJECTED', title: '탈락', color: 'red', count: 0 },
] as const;

export default function PipelinePage() {
  const { planInfo, limits, usage } = usePlan();
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const dragGrantId = useRef<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const result = await pipelineApi.getPipeline();
      setItems(result || []);
      const statsResult = await pipelineApi.getPipelineStats();
      setStats(normalizePipelineStats(statsResult));
    } catch {
      setItems([]);
      setStats(null);
    }
    setLoading(false);
  }

  function handleDragStart(e: React.DragEvent, grantId: string) {
    dragGrantId.current = grantId;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    const grantId = dragGrantId.current;
    if (!grantId) return;

    setItems(prev =>
      prev.map(item =>
        item.grantId.toString() === grantId ? { ...item, stage: stageId } : item
      )
    );

    try {
      await pipelineApi.moveToStage(parseInt(grantId, 10), stageId);
      toast.success('이동 완료!');
      await loadData();
    } catch {
      toast.error('이동 실패');
      await loadData();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stagesWithCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: items.filter(i => i.stage === stage.id).length,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">파이프라인</h1>
            <p className="text-gray-500 mt-1">
              {planInfo.planLabel} · {usage?.pipelineItems ?? items.length}/{formatLimit(limits.maxPipelineItems)}건
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            공고 추가
          </button>
        </div>

        {planInfo.plan === 'free' && (
          <div className="mb-6">
            <PlanUpgradeHint compact message="Free는 파이프라인 1건까지 등록할 수 있습니다." requiredPlan="Pro" />
          </div>
        )}

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Package className="w-5 h-5" />} label="전체" value={String(stats.total)} color="indigo" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="총 예산" value={stats.totalBudget || '0원'} color="green" />
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="긴급" value={String(stats.urgentCount ?? 0)} color="amber" />
            <StatCard icon={<Target className="w-5 h-5" />} label="성공률" value={`${stats.successRate ?? 0}%`} color="purple" />
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stagesWithCounts.map(stage => {
            const stageItems = items.filter(i => i.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="rounded-xl border p-3 min-h-[200px]"
                style={{ borderColor: stage.color === 'indigo' ? '#a5b4fc' : undefined }}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, stage.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{stage.title}</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {stage.count}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageItems.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={e => handleDragStart(e, item.grantId.toString())}
                      onClick={() => setSelectedItem(item)}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.organization}</p>
                      {item.budget && (
                        <span className="text-xs text-brand-600 dark:text-brand-400 mt-1 inline-block">{item.budget}</span>
                      )}
                      {item.daysLeft !== undefined && item.daysLeft <= 7 && item.daysLeft > 0 && (
                        <span className="ml-2 text-xs text-amber-600">D-{item.daysLeft}</span>
                      )}
                    </div>
                  ))}
                  {stageItems.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">비어있음</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">기관</span> <span className="text-gray-900 dark:text-white ml-2">{selectedItem.organization}</span></div>
              <div><span className="text-gray-500">카테고리</span> <span className="text-gray-900 dark:text-white ml-2">{selectedItem.category}</span></div>
              {selectedItem.budget && <div><span className="text-gray-500">예산</span> <span className="text-gray-900 dark:text-white ml-2">{selectedItem.budget}</span></div>}
              <div><span className="text-gray-500">마감일</span> <span className="text-gray-900 dark:text-white ml-2">{selectedItem.dueDate}</span></div>
              {selectedItem.notes && <div><span className="text-gray-500">메모</span> <p className="text-gray-900 dark:text-white mt-1">{selectedItem.notes}</p></div>}
              {selectedItem.documents && selectedItem.documents.length > 0 && (
                <div>
                  <span className="text-gray-500">첨부파일</span>
                  {selectedItem.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 mt-1 text-gray-900 dark:text-white">
                      <FileText className="w-4 h-4" /> {doc}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={`/grants/${selectedItem.grantId}`}
                onClick={() => setSelectedItem(null)}
                className="btn btn-primary flex-1 justify-center"
              >
                상세페이지
                <ArrowRight className="w-4 h-4" />
              </Link>
              {selectedItem.originalUrl ? (
                <a
                  href={selectedItem.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex-1 justify-center"
                >
                  원문 사이트
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn btn-secondary flex-1 justify-center opacity-50 cursor-not-allowed"
                  title="원문 링크가 없습니다"
                >
                  원문 사이트
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">공고 추가</h2>
            <p className="text-sm text-gray-500">공고 목록에서 파이프라인으로 추가할 수 있습니다.</p>
            <div className="flex gap-3 mt-6">
              <Link to="/grants" className="btn btn-primary flex-1 text-center">공고 검색하기</Link>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
