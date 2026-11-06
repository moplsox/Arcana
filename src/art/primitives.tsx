/**
 * 卡面插画的基础图元。所有插画采用"金箔版画"风格：
 * 深色底 + 金色线描 + 少量半透明填充，在 200×340 的 viewBox 中绘制。
 */
import type { ReactNode } from 'react';

export interface Ink {
  /** 主线条颜色（金色渐变） */
  line: string;
  /** 柔和填充 */
  soft: string;
  /** 强调色（花色色彩或光芒） */
  accent: string;
  /** 暗色填充 */
  dark: string;
  glow: string;
}

export const S = (ink: Ink, w = 1.6) => ({ stroke: ink.line, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export function starPath(cx: number, cy: number, r: number, points = 5, inner = 0.45, rot = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

export const Star = ({ cx, cy, r, ink, points = 5, inner = 0.45, fill }: { cx: number; cy: number; r: number; ink: Ink; points?: number; inner?: number; fill?: string }) => (
  <path d={starPath(cx, cy, r, points, inner)} fill={fill ?? ink.line} stroke="none" />
);

/** 四芒闪光 */
export const Sparkle = ({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) => (
  <path d={starPath(cx, cy, r, 4, 0.22)} fill={color} />
);

export const Moon = ({ cx, cy, r, ink, phase = 0.55, rotate = 0 }: { cx: number; cy: number; r: number; ink: Ink; phase?: number; rotate?: number }) => (
  <path
    transform={`rotate(${rotate} ${cx} ${cy})`}
    d={`M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * phase} ${r} 0 1 1 ${cx} ${cy - r}Z`}
    fill={ink.line}
  />
);

export const Sun = ({ cx, cy, r, ink, rays = 16, face = false, wavy = false }: { cx: number; cy: number; r: number; ink: Ink; rays?: number; face?: boolean; wavy?: boolean }) => {
  const items: ReactNode[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const long = i % 2 === 0;
    const r1 = r * 1.18;
    const r2 = r * (long ? 1.75 : 1.45);
    const x1 = cx + r1 * Math.cos(a), y1 = cy + r1 * Math.sin(a);
    const x2 = cx + r2 * Math.cos(a), y2 = cy + r2 * Math.sin(a);
    if (wavy && long) {
      const mx = (x1 + x2) / 2 + Math.cos(a + Math.PI / 2) * r * 0.12;
      const my = (y1 + y2) / 2 + Math.sin(a + Math.PI / 2) * r * 0.12;
      items.push(<path key={i} d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} {...S(ink, 1.4)} />);
    } else items.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...S(ink, long ? 1.4 : 1)} />);
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.9} fill={ink.glow} opacity={0.35} />
      {items}
      <circle cx={cx} cy={cy} r={r} fill={ink.soft} {...{ stroke: ink.line, strokeWidth: 1.6 }} />
      {face && (
        <g {...S(ink, 1.1)}>
          <path d={`M${cx - r * 0.45} ${cy - r * 0.15} q${r * 0.15} ${-r * 0.15} ${r * 0.3} 0`} />
          <path d={`M${cx + r * 0.15} ${cy - r * 0.15} q${r * 0.15} ${-r * 0.15} ${r * 0.3} 0`} />
          <path d={`M${cx - r * 0.3} ${cy + r * 0.35} q${r * 0.3} ${r * 0.25} ${r * 0.6} 0`} />
        </g>
      )}
    </g>
  );
};

export const Mountains = ({ y, ink, peaks = [[30, 40], [80, 60], [140, 45], [175, 30]] }: { y: number; ink: Ink; peaks?: [number, number][] }) => {
  let d = `M14 ${y}`;
  for (const [x, h] of peaks) d += ` L${x} ${y - h} L${x + 22} ${y - h * 0.4}`;
  d += ` L186 ${y}`;
  return <path d={d} fill={ink.dark} stroke={ink.line} strokeWidth={1} opacity={0.75} strokeLinejoin="round" />;
};

export const Waves = ({ y, ink, count = 3, amp = 3, x0 = 16, x1 = 184 }: { y: number; ink: Ink; count?: number; amp?: number; x0?: number; x1?: number }) => {
  const rows: ReactNode[] = [];
  for (let r = 0; r < count; r++) {
    let d = `M${x0} ${y + r * 7}`;
    for (let x = x0; x < x1; x += 14) d += ` q7 ${r % 2 ? amp : -amp} 14 0`;
    rows.push(<path key={r} d={d} {...S(ink, 1)} opacity={0.75 - r * 0.18} />);
  }
  return <g>{rows}</g>;
};

export const Ground = ({ y, ink }: { y: number; ink: Ink }) => (
  <g>
    <line x1={16} y1={y} x2={184} y2={y} {...S(ink, 1.2)} />
    <line x1={30} y1={y + 5} x2={170} y2={y + 5} {...S(ink, 0.6)} opacity={0.5} />
  </g>
);

export const Pillar = ({ x, top, bottom, ink, label, dark = false }: { x: number; top: number; bottom: number; ink: Ink; label?: string; dark?: boolean }) => (
  <g>
    <rect x={x - 8} y={top} width={16} height={bottom - top} fill={dark ? ink.dark : ink.soft} stroke={ink.line} strokeWidth={1.2} />
    <rect x={x - 11} y={top - 6} width={22} height={6} fill={ink.line} />
    <rect x={x - 11} y={bottom} width={22} height={5} fill={ink.line} />
    {label && (
      <text x={x} y={top + 26} textAnchor="middle" fontSize={11} fontFamily="Cinzel, serif" fill={dark ? ink.line : ink.dark} fontWeight={700}>
        {label}
      </text>
    )}
  </g>
);

/** 罩袍人物：以 (x,y) 为脚底中心，s 为缩放 */
export function Figure({
  x, y, s = 1, ink, arms = 'down', crown, halo, fill, children,
}: {
  x: number; y: number; s?: number; ink: Ink;
  arms?: 'down' | 'up' | 'out' | 'raise-right' | 'hold' | 'open' | 'none';
  crown?: 'round' | 'star' | 'triple' | 'circlet' | 'helm';
  halo?: boolean;
  fill?: string;
  children?: ReactNode;
}) {
  const st = S(ink, 1.4 / s);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {halo && <circle cx={0} cy={-62} r={14} fill={ink.glow} opacity={0.55} />}
      <path d="M-6 -46 Q-10 -20 -20 0 L20 0 Q10 -20 6 -46 Z" fill={fill ?? ink.dark} {...{ stroke: ink.line, strokeWidth: 1.4 / s }} />
      <path d="M-6 -46 Q0 -40 6 -46" {...st} />
      <circle cx={0} cy={-55} r={8} fill={fill ?? ink.dark} stroke={ink.line} strokeWidth={1.4 / s} />
      {arms === 'down' && <path d="M-6 -42 L-12 -18 M6 -42 L12 -18" {...st} />}
      {arms === 'up' && <path d="M-6 -42 L-18 -66 M6 -42 L18 -66" {...st} />}
      {arms === 'out' && <path d="M-6 -42 L-24 -34 M6 -42 L24 -34" {...st} />}
      {arms === 'open' && <path d="M-6 -42 L-22 -56 M6 -42 L22 -56" {...st} />}
      {arms === 'raise-right' && <path d="M-6 -42 L-16 -24 M6 -42 L16 -70" {...st} />}
      {arms === 'hold' && <path d="M-6 -42 L-10 -28 L0 -26 M6 -42 L10 -28 L0 -26" {...st} />}
      {crown === 'round' && <path d="M-8 -62 L-9 -70 L-4 -65 L0 -72 L4 -65 L9 -70 L8 -62 Z" fill={ink.line} />}
      {crown === 'circlet' && <ellipse cx={0} cy={-62} rx={9} ry={2.5} {...S(ink, 1.2 / s)} />}
      {crown === 'triple' && <path d="M-7 -61 L-6 -80 Q0 -88 6 -80 L7 -61 Z M-7 -67 L7 -67 M-6.5 -73 L6.5 -73" fill={ink.soft} stroke={ink.line} strokeWidth={1.1 / s} />}
      {crown === 'helm' && <path d="M-9 -58 Q-9 -70 0 -70 Q9 -70 9 -58 Z M0 -70 L0 -78" fill={ink.soft} stroke={ink.line} strokeWidth={1.1 / s} />}
      {crown === 'star' && (
        <g>
          {Array.from({ length: 7 }).map((_, i) => {
            const a = Math.PI + (i / 6) * Math.PI;
            return <path key={i} d={starPath(Math.cos(a) * 14, -58 + Math.sin(a) * 14, 2.6, 5)} fill={ink.line} />;
          })}
        </g>
      )}
      {children}
    </g>
  );
}

/* ---------- 四花色符号（以中心定位，size 为整体高度） ---------- */

export const WandIcon = ({ x, y, size, ink, rotate = 0 }: { x: number; y: number; size: number; ink: Ink; rotate?: number }) => {
  const h = size / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={0} y1={-h} x2={0} y2={h} stroke={ink.line} strokeWidth={Math.min(4.2, Math.max(2, size * 0.036))} strokeLinecap="round" />
      <path d={`M0 ${-h * 0.55} q${size * 0.14} ${-size * 0.05} ${size * 0.18} ${-size * 0.16}`} {...S(ink, 1)} />
      <ellipse cx={size * 0.17} cy={-h * 0.86} rx={size * 0.06} ry={size * 0.03} fill={ink.accent} />
      <path d={`M0 ${h * 0.1} q${-size * 0.13} ${-size * 0.04} ${-size * 0.16} ${-size * 0.14}`} {...S(ink, 1)} />
      <ellipse cx={-size * 0.15} cy={-h * 0.24} rx={size * 0.055} ry={size * 0.028} fill={ink.accent} />
      <circle cx={0} cy={-h} r={size * 0.045} fill={ink.accent} />
    </g>
  );
};

export const CupIcon = ({ x, y, size, ink, rotate = 0, spill = false }: { x: number; y: number; size: number; ink: Ink; rotate?: number; spill?: boolean }) => {
  const w = size * 0.42;
  const h = size / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M${-w} ${-h} Q${-w} ${-h * 0.05} 0 ${h * 0.05} Q${w} ${-h * 0.05} ${w} ${-h} Z`} fill={ink.soft} stroke={ink.line} strokeWidth={1.3} />
      <ellipse cx={0} cy={-h} rx={w} ry={size * 0.07} fill={ink.accent} opacity={0.85} stroke={ink.line} strokeWidth={1} />
      <path d={`M0 ${h * 0.05} L0 ${h * 0.7} M${-w * 0.7} ${h} Q0 ${h * 0.62} ${w * 0.7} ${h} Z`} fill={ink.line} stroke={ink.line} strokeWidth={1.4} />
      <circle cx={0} cy={h * 0.38} r={size * 0.045} fill={ink.line} />
      {spill && <path d={`M${w} ${-h} q${w * 0.8} ${h * 0.5} ${w * 0.5} ${h * 1.6}`} stroke={ink.accent} strokeWidth={2} fill="none" opacity={0.8} />}
    </g>
  );
};

export const SwordIcon = ({ x, y, size, ink, rotate = 0 }: { x: number; y: number; size: number; ink: Ink; rotate?: number }) => {
  const h = size / 2;
  const bw = Math.max(2.2, size * 0.055);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M${-bw} ${h * 0.45} L${-bw} ${-h * 0.82} L0 ${-h} L${bw} ${-h * 0.82} L${bw} ${h * 0.45} Z`} fill={ink.accent} stroke={ink.line} strokeWidth={0.9} />
      <line x1={0} y1={-h * 0.8} x2={0} y2={h * 0.42} stroke={ink.line} strokeWidth={0.6} opacity={0.6} />
      <path d={`M${-size * 0.17} ${h * 0.45} L${size * 0.17} ${h * 0.45}`} stroke={ink.line} strokeWidth={Math.max(2, size * 0.05)} strokeLinecap="round" />
      <line x1={0} y1={h * 0.45} x2={0} y2={h * 0.88} stroke={ink.line} strokeWidth={Math.max(2.2, size * 0.06)} />
      <circle cx={0} cy={h * 0.93} r={size * 0.04} fill={ink.line} />
    </g>
  );
};

export const PentacleIcon = ({ x, y, size, ink }: { x: number; y: number; size: number; ink: Ink }) => {
  const r = size / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={ink.soft} stroke={ink.line} strokeWidth={1.4} />
      <circle r={r * 0.82} fill="none" stroke={ink.line} strokeWidth={0.7} />
      <path d={pentagram(r * 0.78)} fill="none" stroke={ink.accent} strokeWidth={Math.max(1, size * 0.045)} strokeLinejoin="round" />
    </g>
  );
};

export function pentagram(r: number, cx = 0, cy = 0, inverted = false): string {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = ((inverted ? 90 : -90) + i * 144) * (Math.PI / 180);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}Z`;
}

export const Lemniscate = ({ x, y, w, ink, sw = 1.6 }: { x: number; y: number; w: number; ink: Ink; sw?: number }) => (
  <path
    transform={`translate(${x} ${y})`}
    d={`M0 0 C${w * 0.25} ${-w * 0.32} ${w * 0.5} ${-w * 0.32} ${w * 0.5} 0 C${w * 0.5} ${w * 0.32} ${w * 0.25} ${w * 0.32} 0 0 C${-w * 0.25} ${-w * 0.32} ${-w * 0.5} ${-w * 0.32} ${-w * 0.5} 0 C${-w * 0.5} ${w * 0.32} ${-w * 0.25} ${w * 0.32} 0 0Z`}
    {...S(ink, sw)}
  />
);

export const Rose = ({ x, y, r, ink, color }: { x: number; y: number; r: number; ink: Ink; color?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.45} ry={r * 0.6} transform={`rotate(${i * 72})`} fill={color ?? ink.soft} stroke={ink.line} strokeWidth={0.8} />
    ))}
    <circle r={r * 0.3} fill={ink.line} />
  </g>
);

export const Cloud = ({ x, y, w, ink }: { x: number; y: number; w: number; ink: Ink }) => (
  <path
    transform={`translate(${x} ${y})`}
    d={`M${-w / 2} 0 q${w * 0.05} ${-w * 0.22} ${w * 0.22} ${-w * 0.15} q${w * 0.1} ${-w * 0.2} ${w * 0.28} ${-w * 0.08} q${w * 0.18} ${-w * 0.1} ${w * 0.22} ${w * 0.1} q${w * 0.12} 0 ${w * 0.08} ${w * 0.13} Z`}
    fill={ink.dark}
    stroke={ink.line}
    strokeWidth={1}
    opacity={0.9}
  />
);

/** 云中伸出的手（王牌） */
export const HandFromCloud = ({ x, y, ink, side = 'left' }: { x: number; y: number; ink: Ink; side?: 'left' | 'right' }) => (
  <g transform={`translate(${x} ${y}) scale(${side === 'left' ? 1 : -1} 1)`}>
    <path d="M-34 6 q4 -6 14 -4 l14 -2 q6 0 6 6 l-2 10 q-2 4 -8 4 l-18 0" fill={ink.soft} stroke={ink.line} strokeWidth={1.2} />
    <Cloud x={-40} y={14} w={44} ink={ink} />
  </g>
);

export const Tower = ({ x, y, w, h, ink, window = true }: { x: number; y: number; w: number; h: number; ink: Ink; window?: boolean }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    <path d={`M${x - w / 2 - 2} ${y - h} h${w + 4} v-5 h-4 v3 h-4 v-3 h-4 v3 h-4 v-3 h-4 v3 h-4 v-3 h-${Math.max(0, w - 20)} v5`} fill={ink.dark} stroke={ink.line} strokeWidth={1} />
    {window && <rect x={x - 2.5} y={y - h * 0.7} width={5} height={8} rx={2.5} fill={ink.glow} />}
  </g>
);

export const Tree = ({ x, y, h, ink, fruit }: { x: number; y: number; h: number; ink: Ink; fruit?: string }) => (
  <g>
    <path d={`M${x} ${y} L${x} ${y - h * 0.55}`} stroke={ink.line} strokeWidth={2.4} />
    <ellipse cx={x} cy={y - h * 0.72} rx={h * 0.32} ry={h * 0.3} fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    {fruit &&
      [[-0.12, -0.78], [0.1, -0.66], [0.05, -0.88], [-0.15, -0.6], [0.18, -0.8]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx * h} cy={y + dy * h} r={2.2} fill={fruit} />
      ))}
  </g>
);

export const Wings = ({ x, y, span, ink }: { x: number; y: number; span: number; ink: Ink }) => (
  <g transform={`translate(${x} ${y})`} fill={ink.soft} stroke={ink.line} strokeWidth={1}>
    <path d={`M0 0 Q${-span * 0.5} ${-span * 0.6} ${-span} ${-span * 0.3} Q${-span * 0.65} ${-span * 0.15} ${-span * 0.75} ${span * 0.05} Q${-span * 0.4} ${-span * 0.05} 0 ${span * 0.2} Z`} />
    <path d={`M0 0 Q${span * 0.5} ${-span * 0.6} ${span} ${-span * 0.3} Q${span * 0.65} ${-span * 0.15} ${span * 0.75} ${span * 0.05} Q${span * 0.4} ${-span * 0.05} 0 ${span * 0.2} Z`} />
  </g>
);
