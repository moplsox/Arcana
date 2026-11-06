import { motion } from 'framer-motion';
import { Heart, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CardDetail } from '../components/cards/CardDetail';
import { CardFace } from '../components/cards/CardFace';
import { Page, PageTitle } from '../components/ui/Section';
import { DECK } from '../data/deck';
import { useApp } from '../store/AppStore';
import type { TarotCard } from '../types/tarot';

type Filter = 'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles' | 'fav';
const FILTERS: { id: Filter; name: string }[] = [
  { id: 'all', name: '全部 78' },
  { id: 'major', name: '大阿尔卡那' },
  { id: 'wands', name: '权杖' },
  { id: 'cups', name: '圣杯' },
  { id: 'swords', name: '宝剑' },
  { id: 'pentacles', name: '星币' },
  { id: 'fav', name: '♥ 收藏' },
];

export function Library({ query }: { query: URLSearchParams }) {
  const { state, isFavorite } = useApp();
  const [filter, setFilter] = useState<Filter>((query.get('filter') as Filter) || 'all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<TarotCard | null>(null);

  const list = useMemo(() => {
    let cards = DECK;
    if (filter === 'major') cards = cards.filter((c) => c.arcana === 'major');
    else if (filter === 'fav') cards = state.favorites.map((id) => DECK.find((c) => c.id === id)!).filter(Boolean);
    else if (filter !== 'all') cards = cards.filter((c) => c.suit === filter);
    const s = q.trim().toLowerCase();
    if (s) {
      cards = cards.filter((c) => c.name.includes(s) || c.nameEn.toLowerCase().includes(s) || [...c.keywords.upright, ...c.keywords.reversed].some((k) => k.includes(s)));
    }
    return cards;
  }, [filter, q, state.favorites]);

  return (
    <Page>
      <PageTitle en="THE ARCANA" title="塔罗图鉴" sub="完整的 78 张 Rider-Waite-Smith 体系塔罗牌。点击任意一张查看正逆位、象征与各领域含义。" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map((f) => (
            <button key={f.id} className="btn-ghost shrink-0 px-4! py-1.5! text-sm" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.name}
              {f.id === 'fav' && state.favorites.length > 0 && <span className="text-xs text-ink-dim">{state.favorites.length}</span>}
            </button>
          ))}
        </div>
        <label className="panel flex items-center gap-2 rounded-full! px-4 py-2 sm:w-64">
          <Search size={16} className="text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索牌名或关键词" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint" />
        </label>
      </div>

      {list.length === 0 ? (
        <div className="panel p-10 text-center text-ink-dim">
          {filter === 'fav' ? '还没有收藏的牌。打开任意一张牌，点击「收藏」即可加入这里。' : '没有找到匹配的牌。'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-7">
          {list.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 24) * 0.02 }}
              onClick={() => setSelected(c)}
              className="group relative text-left"
              aria-label={c.name}
            >
              <div className="hover-glow card-thickness overflow-hidden rounded-[7%/4.2%]">
                <CardFace card={c} className="block w-full" />
              </div>
              {isFavorite(c.id) && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-[#e8708a]">
                  <Heart size={11} fill="currentColor" />
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
      <CardDetail card={selected} onClose={() => setSelected(null)} />
    </Page>
  );
}
