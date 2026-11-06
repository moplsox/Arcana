import { motion } from 'framer-motion';
import { CardBack } from '../cards/CardBack';
import { CARD_RATIO } from './layout';

const VISIBLE = 16;

interface Props {
  x: number;
  y: number;
  cardW: number;
  mode: 'idle' | 'shuffling' | 'cut' | 'cutting';
  shuffleKey: number;
  /** 切牌时用户选中的那一叠 */
  chosenPile: number | null;
  onDeckClick?: () => void;
  onPickPile?: (pile: number) => void;
  fast?: boolean;
}

function Back({ w }: { w: number }) {
  return (
    <div className="card-thickness overflow-hidden rounded-[7%/4.2%]" style={{ width: w, height: w * CARD_RATIO }}>
      <CardBack className="block h-full w-full" />
    </div>
  );
}

/** 牌堆：静置、洗牌（左右分叠交错）、切牌（三叠）三种形态 */
export function DeckStack({ x, y, cardW, mode, shuffleKey, chosenPile, onDeckClick, onPickPile, fast }: Props) {
  const h = cardW * CARD_RATIO;

  if (mode === 'cut' || mode === 'cutting') {
    const gap = cardW * 1.35;
    return (
      <div className="absolute" style={{ left: x, top: y }}>
        {[0, 1, 2].map((pile) => {
          const isChosen = chosenPile === pile;
          const target =
            mode === 'cutting'
              ? { x: 0, y: isChosen ? [-h * 0.45, -h * 0.45, -6] : 0, zIndex: isChosen ? 10 : 1, scale: 1 }
              : { x: (pile - 1) * gap, y: 0, zIndex: 1, scale: 1 };
          return (
            <motion.button
              key={pile}
              type="button"
              aria-label={`选择第 ${pile + 1} 叠`}
              className="absolute"
              style={{ left: -cardW / 2, top: -h / 2 }}
              initial={{ x: 0, y: 0 }}
              animate={target}
              transition={{ duration: fast ? 0.3 : 0.8, ease: [0.3, 0.8, 0.3, 1], delay: mode === 'cut' ? pile * 0.08 : isChosen ? 0 : 0.25 }}
              onClick={() => mode === 'cut' && onPickPile?.(pile)}
              disabled={mode !== 'cut'}
            >
              <div className={mode === 'cut' ? 'hover-glow rounded-[7%/4.2%]' : ''}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="absolute left-0 top-0" style={{ transform: `translate(${-i * 0.6}px, ${-i * 1.1}px)` }}>
                    <Back w={cardW} />
                  </div>
                ))}
                <div style={{ width: cardW, height: h }} />
              </div>
              {mode === 'cut' && (
                <div className="mt-3 text-center font-display text-xs tracking-[0.3em] text-gold">{['I', 'II', 'III'][pile]}</div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }

  const shuffling = mode === 'shuffling';
  const dur = fast ? 0.6 : 1.7;
  return (
    <button
      type="button"
      aria-label="洗牌"
      onClick={onDeckClick}
      disabled={shuffling || !onDeckClick}
      className="absolute"
      style={{ left: x - cardW / 2, top: y - h / 2, width: cardW, height: h }}
    >
      {Array.from({ length: VISIBLE }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const spread = cardW * 0.78;
        const anim = shuffling
          ? {
              x: [0, side * spread, side * spread, 0, -side * spread * 0.6, -side * spread * 0.6, 0],
              y: [-i * 0.9, -i * 0.9 - 8, -(VISIBLE - i) * 0.9, -i * 0.9, -i * 0.9 - 6, -(VISIBLE - i) * 0.9, -i * 0.9],
              rotate: [0, side * -9, side * -4, 0, side * 7, side * 3, 0],
            }
          : { x: 0, y: -i * 0.9, rotate: 0 };
        return (
          <motion.div
            key={`${shuffleKey}-${i}`}
            className="absolute left-0 top-0"
            initial={{ x: 0, y: -i * 0.9, rotate: 0 }}
            animate={anim}
            transition={shuffling ? { duration: dur, ease: 'easeInOut', delay: (i % 8) * 0.012, times: [0, 0.18, 0.36, 0.5, 0.68, 0.84, 1] } : { duration: 0.3 }}
          >
            <Back w={cardW} />
          </motion.div>
        );
      })}
      {!shuffling && onDeckClick && (
        <motion.div
          className="pointer-events-none absolute -inset-3 rounded-2xl"
          animate={{ boxShadow: ['0 0 0px var(--glow)', '0 0 36px var(--glow)', '0 0 0px var(--glow)'] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />
      )}
    </button>
  );
}
