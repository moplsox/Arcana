import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';
import type { TarotCard as Card } from '../../types/tarot';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';

interface Props {
  card?: Card;
  /** 是否已翻到正面 */
  flipped: boolean;
  reversed?: boolean;
  width: number;
  /** 翻开瞬间的光效 */
  burst?: boolean;
  fast?: boolean;
  className?: string;
}

/**
 * 3D 翻转卡牌。
 * 先绕 Y 轴翻转 180° 露出正面，若为逆位再绕 Z 轴旋转 180°。
 * 两个面均使用 backface-visibility 隐藏背面，配合多层阴影营造厚度。
 */
export const FlipCard = memo(function FlipCard({ card, flipped, reversed = false, width, burst = true, fast = false, className = '' }: Props) {
  const height = width * 1.7;
  const flipDur = fast ? 0.35 : 0.9;
  return (
    <div className={`relative ${className}`} style={{ width, height, perspective: width * 8 }}>
      {/* 光效：翻开时的光环与光柱 */}
      <AnimatePresence>
        {flipped && burst && (
          <motion.div
            key="burst"
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.35] }}
            transition={{ duration: fast ? 0.6 : 1.6, delay: flipDur * 0.4, times: [0, 0.35, 1] }}
          >
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: width * 2.4, height: width * 2.4, marginLeft: -width * 1.2, marginTop: -width * 1.2, background: 'radial-gradient(circle, var(--glow) 0%, transparent 65%)' }}
              initial={{ scale: 0.3 }}
              animate={{ scale: [0.3, 1.25, 1] }}
              transition={{ duration: 1.2, delay: flipDur * 0.4 }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 rounded-full border border-[var(--gold-bright)]"
              style={{ width: width * 1.2, height: width * 1.2, marginLeft: -width * 0.6, marginTop: -width * 0.6 }}
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.1, delay: flipDur * 0.45, ease: 'easeOut' }}
            />
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[var(--gold-bright)] shadow-[0_0_8px_var(--gold-bright)]"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(a) * width * 1.1, y: Math.sin(a) * width * 1.4, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 1.2, delay: flipDur * 0.5, ease: 'easeOut' }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="card-3d absolute inset-0"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0, z: 0 }}
        transition={{ duration: flipDur, ease: [0.45, 0.05, 0.25, 1] }}
      >
        {/* 背面 */}
        <div className="card-face-wrap card-thickness">
          <CardBack />
        </div>
        {/* 正面（预先旋转 180°） */}
        <div className="card-face-wrap card-thickness" style={{ transform: 'rotateY(180deg)' }}>
          <motion.div
            className="h-full w-full"
            initial={false}
            animate={{ rotateZ: flipped && reversed ? 180 : 0 }}
            transition={{ duration: fast ? 0.3 : 0.8, delay: flipped ? flipDur * 0.95 : 0, ease: [0.3, 0.1, 0.2, 1] }}
          >
            {card && <CardFace card={card} />}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});
