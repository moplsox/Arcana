import { memo, useId } from 'react';
import { starPath } from '../../art/primitives';

/** 牌背：暗紫星图 + 金色魔法阵 + 月相环 */
export const CardBack = memo(function CardBack({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const gold = `url(#${uid}g)`;
  const phases = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 340" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${uid}g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="340">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.45" stopColor="#d9b25e" />
          <stop offset="1" stopColor="#a87a30" />
        </linearGradient>
        <radialGradient id={`${uid}bg`} cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="var(--card-back-0, #2d1d55)" />
          <stop offset="1" stopColor="var(--card-back-1, #0b0718)" />
        </radialGradient>
        <pattern id={`${uid}p`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="#d9b25e" strokeWidth="0.35" opacity="0.35" />
          <circle cx="10" cy="10" r="0.9" fill="#d9b25e" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="200" height="340" rx="12" fill={`url(#${uid}bg)`} />
      <rect x="12" y="12" width="176" height="316" rx="6" fill={`url(#${uid}p)`} />
      <rect x="5" y="5" width="190" height="330" rx="9" fill="none" stroke={gold} strokeWidth="2" />
      <rect x="12" y="12" width="176" height="316" rx="6" fill="none" stroke={gold} strokeWidth="0.8" />

      <g transform="translate(100 170)">
        <circle r="74" fill="#0b0718" opacity="0.75" />
        <circle r="74" fill="none" stroke={gold} strokeWidth="1.4" />
        <circle r="66" fill="none" stroke={gold} strokeWidth="0.6" strokeDasharray="2 3" />
        <path d={starPath(0, 0, 62, 6, 0.58)} fill="none" stroke={gold} strokeWidth="0.8" />
        <path d="M0 -62 L53.7 31 L-53.7 31 Z M0 62 L53.7 -31 L-53.7 -31 Z" fill="none" stroke={gold} strokeWidth="0.9" />
        <circle r="30" fill="none" stroke={gold} strokeWidth="1" />
        {/* 中央：太阳之眼 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 16} y1={Math.sin(a) * 16} x2={Math.cos(a) * 26} y2={Math.sin(a) * 26} stroke={gold} strokeWidth="1" />;
        })}
        <path d="M-12 0 Q0 -10 12 0 Q0 10 -12 0 Z" fill="none" stroke={gold} strokeWidth="1.2" />
        <circle r="4" fill={gold} />
        {/* 月相环 */}
        {phases.map((i) => {
          const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
          const x = Math.cos(a) * 46, y = Math.sin(a) * 46;
          const ph = i / 8;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="5" fill="#0b0718" stroke={gold} strokeWidth="0.6" />
              {i !== 0 && (
                <path
                  d={i === 4 ? 'M0 -5 A5 5 0 1 1 0 5 A5 5 0 1 1 0 -5' : `M0 -5 A5 5 0 0 ${ph < 0.5 ? 1 : 0} 0 5 A${Math.abs(Math.cos(ph * Math.PI * 2)) * 5} 5 0 0 ${ph < 0.25 || (ph > 0.5 && ph < 0.75) ? 0 : 1} 0 -5`}
                  fill={gold}
                />
              )}
            </g>
          );
        })}
      </g>
      {[[40, 46], [160, 46], [40, 294], [160, 294]].map(([x, y], i) => (
        <g key={i}>
          <path d={starPath(x, y, 9, 4, 0.25)} fill={gold} />
          <circle cx={x} cy={y} r="13" fill="none" stroke={gold} strokeWidth="0.6" />
        </g>
      ))}
      <text x="100" y="56" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="11" letterSpacing="5" fill={gold}>ARCANA</text>
      <text x="100" y="292" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="7" letterSpacing="3" fill={gold} opacity="0.8">✦ MMXXVI ✦</text>
    </svg>
  );
});
