import { starPath } from '../../art/primitives';

const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
const ZODIAC = '♈♉♊♋♌♍♎♏♐♑♒♓';

/** 旋转魔法阵：三层反向旋转的环 + 符文 + 星座符号 */
export function MagicCircle({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <svg viewBox="-200 -200 400 400" className={className} aria-hidden="true" style={{ opacity: 0.55 * intensity }}>
      <defs>
        <radialGradient id="mc-glow">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="var(--gold)" stopOpacity="0.04" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="200" fill="url(#mc-glow)" />
      <g className="magic-spin" stroke="var(--gold)" fill="none">
        <circle r="190" strokeWidth="0.8" opacity="0.7" />
        <circle r="178" strokeWidth="0.4" strokeDasharray="1 5" />
        {Array.from(RUNES).map((r, i, arr) => {
          const a = (i / arr.length) * 360;
          return (
            <text key={i} transform={`rotate(${a}) translate(0 -182)`} textAnchor="middle" fontSize="11" fill="var(--gold)" stroke="none" opacity="0.85">
              {r}
            </text>
          );
        })}
        <circle r="166" strokeWidth="0.8" />
      </g>
      <g className="magic-spin-rev" stroke="var(--gold)" fill="none">
        <path d={starPath(0, 0, 160, 12, 0.86, -90)} strokeWidth="0.5" opacity="0.6" />
        <circle r="130" strokeWidth="0.6" />
        {Array.from(ZODIAC).map((z, i) => {
          const a = (i / 12) * 360;
          return (
            <g key={i} transform={`rotate(${a}) translate(0 -145)`}>
              <circle r="10" strokeWidth="0.5" />
              <text textAnchor="middle" y="4" fontSize="11" fill="var(--gold)" stroke="none">
                {z + '\uFE0E'}
              </text>
            </g>
          );
        })}
        <path d="M0 -130 L112.6 65 L-112.6 65 Z M0 130 L112.6 -65 L-112.6 -65 Z" strokeWidth="0.7" />
      </g>
      <g className="magic-spin" stroke="var(--gold)" fill="none" style={{ animationDuration: '60s' }}>
        <circle r="78" strokeWidth="0.6" />
        <path d={starPath(0, 0, 76, 5, 0.38)} strokeWidth="0.7" />
        <circle r="30" strokeWidth="0.5" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
