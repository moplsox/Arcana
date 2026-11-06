import { AnimatePresence, motion } from 'framer-motion';
import { Heart, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ELEMENT_NAMES, SUITS, cardNumeral } from '../../data/deck';
import { useApp } from '../../store/AppStore';
import { useToast } from '../../lib/toast';
import type { TarotCard } from '../../types/tarot';
import { CardFace } from './CardFace';

const DOMAINS = [
  { key: 'love', name: '感情' },
  { key: 'career', name: '事业' },
  { key: 'study', name: '学业' },
  { key: 'wealth', name: '财运' },
] as const;

/** 单张牌的详细信息弹窗（图鉴、结果页、收藏页共用） */
export function CardDetail({ card, initialReversed = false, onClose }: { card: TarotCard | null; initialReversed?: boolean; onClose: () => void }) {
  const { isFavorite, toggleFavorite } = useApp();
  const toast = useToast();
  const [rev, setRev] = useState(initialReversed);
  useEffect(() => setRev(initialReversed), [card, initialReversed]);

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [card, onClose]);

  // 通过 portal 渲染到 body，避免被页面容器的层叠上下文压在底部导航之下
  return createPortal(
    <AnimatePresence>
      {card && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={card.name}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="panel relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-b-none bg-[var(--bg-1)]! sm:rounded-b-[18px]"
          >
            <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full p-2 text-ink-dim hover:text-gold" aria-label="关闭">
              <X size={20} />
            </button>
            <div className="grid gap-6 p-5 sm:grid-cols-[220px_1fr] sm:p-7">
              <div className="mx-auto w-44 sm:w-full">
                <motion.div className="card-thickness overflow-hidden rounded-[7%/4.2%]" animate={{ rotate: rev ? 180 : 0 }} transition={{ duration: 0.7, ease: [0.3, 0.1, 0.2, 1] }}>
                  <CardFace card={card} className="block w-full" />
                </motion.div>
                <div className="mt-4 flex justify-center gap-2">
                  <button className="btn-ghost px-3! py-1.5! text-xs" onClick={() => setRev((r) => !r)} aria-pressed={rev}>
                    <RotateCcw size={13} /> {rev ? '看正位' : '看逆位'}
                  </button>
                  <button
                    className="btn-ghost px-3! py-1.5! text-xs"
                    aria-pressed={isFavorite(card.id)}
                    onClick={() => {
                      toast(isFavorite(card.id) ? '已取消收藏' : `已收藏「${card.name}」`);
                      toggleFavorite(card.id);
                    }}
                  >
                    <Heart size={13} fill={isFavorite(card.id) ? 'currentColor' : 'none'} /> {isFavorite(card.id) ? '已收藏' : '收藏'}
                  </button>
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-display text-xs tracking-[0.3em] text-gold-deep">
                  {cardNumeral(card)} · {card.nameEn.toUpperCase()}
                </div>
                <h2 className="mt-1 text-3xl tracking-[0.2em] text-gold-gradient">{card.name}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip">{card.arcana === 'major' ? '大阿尔卡那' : `小阿尔卡那 · ${SUITS[card.suit!].name}`}</span>
                  <span className="chip">{ELEMENT_NAMES[card.element]}元素</span>
                  {card.astrology && <span className="chip">{card.astrology}</span>}
                </div>

                <section className="mt-5">
                  <h3 className={`text-sm tracking-[0.2em] ${rev ? 'text-ink-dim' : 'text-gold'}`}>正位 · {card.keywords.upright.join(' · ')}</h3>
                  <p className={`mt-1.5 text-sm leading-7 ${rev ? 'text-ink-faint' : 'text-ink'}`}>{card.upright}</p>
                </section>
                <section className="mt-4">
                  <h3 className={`text-sm tracking-[0.2em] ${rev ? 'text-gold' : 'text-ink-dim'}`}>逆位 · {card.keywords.reversed.join(' · ')}</h3>
                  <p className={`mt-1.5 text-sm leading-7 ${rev ? 'text-ink' : 'text-ink-faint'}`}>{card.reversed}</p>
                </section>
                <section className="mt-4">
                  <h3 className="text-sm tracking-[0.2em] text-gold">画面与象征</h3>
                  <p className="mt-1.5 text-sm leading-7 text-ink-dim">{card.description}</p>
                </section>
                <section className="mt-4">
                  <h3 className="text-sm tracking-[0.2em] text-gold">{rev ? '逆位' : '正位'}在各领域</h3>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    {DOMAINS.map((d) => (
                      <div key={d.key} className="rounded-xl border border-[var(--panel-border)] bg-white/[0.02] p-3">
                        <dt className="text-xs tracking-widest text-gold-deep">{d.name}</dt>
                        <dd className="mt-1 text-sm leading-6 text-ink">{card[d.key][rev ? 1 : 0]}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-sm leading-7 text-ink-dim">
                    <span className="text-gold">建议：</span>
                    {card.advice[rev ? 1 : 0]}
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
