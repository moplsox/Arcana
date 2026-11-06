import { AnimatePresence, motion } from 'framer-motion';
import { Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CardFace } from '../components/cards/CardFace';
import { Page, PageTitle } from '../components/ui/Section';
import { getCard } from '../data/deck';
import { SPREADS, TOPICS, TOPIC_LIST } from '../data/spreads';
import { interpret } from '../engine/interpret';
import { Link, navigate } from '../lib/router';
import { useToast } from '../lib/toast';
import { useApp } from '../store/AppStore';
import type { TopicId } from '../types/tarot';

type Filter = 'all' | 'starred' | TopicId;

export function History() {
  const { state, deleteReading, updateReading, clearHistory } = useApp();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');

  const list = useMemo(
    () => state.history.filter((r) => (filter === 'all' ? true : filter === 'starred' ? r.starred : r.topic === filter)),
    [state.history, filter],
  );

  const filters: { id: Filter; name: string }[] = [
    { id: 'all', name: '全部' },
    { id: 'starred', name: '★ 星标' },
    ...TOPIC_LIST.map((t) => ({ id: t.id as Filter, name: t.name })),
    { id: 'daily', name: '每日' },
  ];

  return (
    <Page className="max-w-4xl">
      <PageTitle en="BOOK OF SHADOWS" title="占卜记录" sub={`共 ${state.history.length} 次占卜 · 保存在本机浏览器中`} />
      <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {filters.map((f) => (
          <button key={f.id} className="btn-ghost shrink-0 px-4! py-1.5! text-sm" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-ink-dim">{state.history.length === 0 ? '还没有占卜记录。' : '这个分类下暂无记录。'}</p>
          <button className="btn-arcane mt-6" onClick={() => navigate('/select')}>开始第一次占卜</button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {list.map((r, i) => {
              const it = interpret(r);
              const cards = [...r.cards].sort((a, b) => a.positionIndex - b.positionIndex);
              return (
                <motion.li key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.04 } }} exit={{ opacity: 0, x: -30 }} className="panel flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                  <Link to={`/result/${r.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <div className="flex shrink-0 -space-x-6">
                      {cards.slice(0, 3).map((d, k) => (
                        <div key={k} className="w-10 overflow-hidden rounded-[7%/4.2%] shadow-lg ring-1 ring-black/40 sm:w-12" style={{ transform: `rotate(${(k - 1) * 6 + (d.reversed ? 180 : 0)}deg)` }}>
                          <CardFace card={getCard(d.cardId)} showName={false} className="block w-full" />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-dim">
                        <span className="text-gold">{TOPICS[r.topic].name}</span>
                        <span>·</span>
                        <span>{SPREADS[r.spread].name}</span>
                        <span>·</span>
                        <span>{new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="mt-0.5 truncate text-base tracking-widest">{it.title} <span className="text-xs text-ink-dim">· {it.trendLabel}</span></div>
                      <div className="truncate text-xs text-ink-faint">{r.question ? `「${r.question}」` : cards.map((d) => getCard(d.cardId).name).join(' · ')}</div>
                    </div>
                  </Link>
                  <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                    <button className="rounded-full p-2 text-gold hover:bg-white/5" aria-label={r.starred ? '取消星标' : '星标'} onClick={() => updateReading(r.id, { starred: !r.starred })}>
                      <Star size={17} fill={r.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      className="rounded-full p-2 text-ink-faint hover:bg-white/5 hover:text-[#e8a07a]"
                      aria-label="删除"
                      onClick={() => {
                        deleteReading(r.id);
                        toast('已删除一条记录');
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {state.history.length > 0 && (
        <div className="mt-10 text-center">
          <button
            className="text-xs text-ink-faint underline-offset-4 hover:text-[#e8a07a] hover:underline"
            onClick={() => {
              if (window.confirm('确定清空全部占卜记录吗？此操作不可撤销。')) {
                clearHistory();
                toast('已清空全部记录');
              }
            }}
          >
            清空全部记录
          </button>
        </div>
      )}
    </Page>
  );
}
