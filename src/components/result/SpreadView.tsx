import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getCard } from '../../data/deck';
import { SPREADS } from '../../data/spreads';
import type { Reading } from '../../types/tarot';
import { CardFace } from '../cards/CardFace';
import { CARD_RATIO, slotGeometry } from '../reading/layout';

/** 结果页中按牌阵布局静态展示已抽出的牌 */
export function SpreadView({ reading, onSelect }: { reading: Reading; onSelect: (index: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const spread = SPREADS[reading.spread];
  const n = spread.positions.length;
  const height = n === 1 ? 360 : n === 3 ? 300 : n === 5 ? Math.min(640, w * 1.15 + 80) : Math.min(720, w * 1.35);
  const geo = w ? slotGeometry(spread, { x: 0, y: 8, w, h: height - 16 }, n === 1 ? 190 : 150) : null;
  const sorted = [...reading.cards].sort((a, b) => a.positionIndex - b.positionIndex);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {geo &&
        sorted.map((d, k) => {
          const card = getCard(d.cardId);
          const s = geo.slots[k];
          const cw = geo.cardW;
          return (
            <motion.button
              key={k}
              type="button"
              onClick={() => onSelect(k)}
              className="group absolute left-0 top-0"
              style={{ width: cw, height: cw * CARD_RATIO, x: s.x - cw / 2, y: s.y - (cw * CARD_RATIO) / 2, zIndex: s.rotate ? 2 : 1 }}
              initial={{ opacity: 0, scale: 0.85, rotate: s.rotate }}
              animate={{ opacity: 1, scale: 1, rotate: s.rotate }}
              transition={{ delay: 0.3 + k * 0.12, duration: 0.6 }}
              aria-label={`${spread.positions[k].label}：${card.name}${d.reversed ? '逆位' : '正位'}，查看详情`}
            >
              <div className="hover-glow card-thickness h-full w-full overflow-hidden rounded-[7%/4.2%]" style={{ transform: d.reversed ? 'rotate(180deg)' : undefined }}>
                <CardFace card={card} className="block h-full w-full" />
              </div>
              {geo.labels ? (
                <div className="pointer-events-none absolute left-1/2 w-[170%] -translate-x-1/2 text-center" style={{ top: cw * CARD_RATIO + 6 }}>
                  <div className="text-[11px] tracking-[0.15em] text-gold">{spread.positions[k].label}</div>
                  <div className="text-[11px] text-ink-dim">{d.reversed ? '逆位' : '正位'}</div>
                </div>
              ) : (
                <div className="pointer-events-none absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--bg-0)] font-display text-[11px] text-gold" style={{ transform: `rotate(${-s.rotate}deg)` }}>
                  {k + 1}
                </div>
              )}
            </motion.button>
          );
        })}
    </div>
  );
}
