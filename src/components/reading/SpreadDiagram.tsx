import type { Spread } from '../../types/tarot';

/** 牌阵示意图：用小矩形展示每个位置的布局（x 以卡宽、y 以卡高为单位） */
export function SpreadDiagram({ spread, className = '', active }: { spread: Spread; className?: string; active?: boolean }) {
  const pos = spread.positions;
  const RATIO = 1.7;
  const minX = Math.min(...pos.map((p) => p.x)) - 0.75;
  const maxX = Math.max(...pos.map((p) => p.x)) + 0.75;
  const minY = Math.min(...pos.map((p) => p.y)) - 0.6;
  const maxY = Math.max(...pos.map((p) => p.y)) + 0.6;
  const W = 100;
  const unit = W / (maxX - minX);
  const H = (maxY - minY) * unit * RATIO;
  const w = unit * 0.62;
  const h = w * RATIO;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      {pos.map((p, i) => (
        <g key={i} transform={`translate(${(p.x - minX) * unit} ${(p.y - minY) * unit * RATIO}) rotate(${p.rotate ?? 0})`}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={1.5} fill={active ? 'color-mix(in srgb, var(--gold) 22%, transparent)' : 'rgba(255,255,255,0.04)'} stroke="var(--gold)" strokeWidth={0.8} />
          {!p.rotate && (
            <text y={w * 0.18} textAnchor="middle" fontSize={w * 0.5} fill="var(--gold)" fontFamily="Cinzel, serif">
              {i + 1}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
