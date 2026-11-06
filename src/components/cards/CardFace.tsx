import { memo, useId } from 'react';
import type { Suit, TarotCard } from '../../types/tarot';
import { cardNumeral } from '../../data/deck';
import { MAJOR_ART, majorBackdrop } from '../../art/majorArt';
import { CourtArt, PipArt } from '../../art/minorArt';
import { starPath, type Ink } from '../../art/primitives';

const PALETTE: Record<Suit | 'major', Omit<Ink, 'line'> & { bg0: string; bg1: string }> = {
  major: { accent: '#a98be8', soft: '#2a2047', dark: '#120c22', glow: '#ffe7a3', bg0: '#2b1f4d', bg1: '#0a0716' },
  wands: { accent: '#ef8d4c', soft: '#3c2618', dark: '#1a110c', glow: '#ffb36b', bg0: '#3d2316', bg1: '#0d0806' },
  cups: { accent: '#62b8d6', soft: '#152c40', dark: '#0a141f', glow: '#8fd8f0', bg0: '#132d45', bg1: '#060b12' },
  swords: { accent: '#cdd6ec', soft: '#252b3b', dark: '#0f121b', glow: '#dfe8ff', bg0: '#262c40', bg1: '#08090f' },
  pentacles: { accent: '#dcc25e', soft: '#26331d', dark: '#10160c', glow: '#f0dc8a', bg0: '#26331b', bg1: '#080b06' },
};

interface Props {
  card: TarotCard;
  className?: string;
  /** 是否显示底部名称（小尺寸时可隐藏） */
  showName?: boolean;
}

/** 卡牌正面：纯 SVG 绘制，任意尺寸清晰 */
export const CardFace = memo(function CardFace({ card, className, showName = true }: Props) {
  const uid = useId().replace(/:/g, '');
  const key = card.suit ?? 'major';
  const p = PALETTE[key];
  const ink: Ink = { line: `url(#${uid}g)`, soft: p.soft, accent: p.accent, dark: p.dark, glow: p.glow };
  const numeral = cardNumeral(card);

  let art;
  if (card.arcana === 'major') art = MAJOR_ART[card.number](ink);
  else if (card.rank! <= 10) art = <PipArt suit={card.suit!} rank={card.rank!} ink={ink} />;
  else art = <CourtArt suit={card.suit!} rank={card.rank as 11 | 12 | 13 | 14} ink={ink} />;

  return (
    <svg viewBox="0 0 200 340" className={className} role="img" aria-label={`${card.name} ${card.nameEn}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${uid}g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="340">
          <stop offset="0" stopColor="#fff3c9" />
          <stop offset="0.35" stopColor="#e6c27a" />
          <stop offset="0.7" stopColor="#b98b3e" />
          <stop offset="1" stopColor="#f2d999" />
        </linearGradient>
        <radialGradient id={`${uid}bg`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor={p.bg0} />
          <stop offset="1" stopColor={p.bg1} />
        </radialGradient>
        <clipPath id={`${uid}clip`}>
          <rect x="14" y="40" width="172" height="232" rx="3" />
        </clipPath>
      </defs>

      <rect width="200" height="340" rx="12" fill={`url(#${uid}bg)`} />
      {/* 外框 */}
      <rect x="5" y="5" width="190" height="330" rx="9" fill="none" stroke={ink.line} strokeWidth="2" />
      <rect x="10" y="10" width="180" height="320" rx="6" fill="none" stroke={ink.line} strokeWidth="0.7" opacity="0.7" />
      {[[10, 10], [190, 10], [10, 330], [190, 330]].map(([x, y], i) => (
        <path key={i} d={starPath(x, y, 5, 4, 0.3)} fill={ink.line} />
      ))}

      {/* 插画区 */}
      <g clipPath={`url(#${uid}clip)`}>
        {card.arcana === 'major' && majorBackdrop(ink, card.number + 3)}
        {art}
      </g>
      <rect x="14" y="40" width="172" height="232" rx="3" fill="none" stroke={ink.line} strokeWidth="1" />

      {/* 顶部编号 */}
      <path d="M70 26 h-40 M130 26 h40" stroke={ink.line} strokeWidth="0.7" opacity="0.7" />
      <text x="100" y="31" textAnchor="middle" fontFamily="Cinzel, serif" fontSize={numeral.length > 4 ? 12 : 15} fontWeight="700" letterSpacing="2" fill={ink.line}>
        {numeral}
      </text>

      {/* 底部名牌 */}
      {showName && (
        <g>
          <path d="M22 282 H178 L172 292 L178 302 V322 H22 V302 L28 292 L22 282 Z" fill={p.dark} stroke={ink.line} strokeWidth="1" opacity="0.95" />
          <text x="100" y="303" textAnchor="middle" fontFamily="'Noto Serif SC', serif" fontSize="17" fontWeight="700" letterSpacing="3" fill={ink.line}>
            {card.name}
          </text>
          <text x="100" y="317" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="8" letterSpacing="1.6" fill={ink.line} opacity="0.85">
            {card.nameEn.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
});
