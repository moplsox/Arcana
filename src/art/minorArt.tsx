/**
 * 56 张小阿尔卡那插画：
 * - 数字牌（1-10）：花色符号按牌面意涵排布 + 每张独立的场景母题
 * - 宫廷牌（侍从/骑士/王后/国王）：人物 + 坐骑/王座 + 花色徽记 + 花色环境
 */
import type { ReactNode } from 'react';
import type { Suit } from '../types/tarot';
import {
  Cloud, CupIcon, Figure, Ground, HandFromCloud, Lemniscate, Moon, Mountains, PentacleIcon, Rose, S, Sparkle, Star, SwordIcon,
  Tower, Tree, WandIcon, Waves, starPath, type Ink,
} from './primitives';

type Pt = [number, number, number?]; // x, y, rotate

function Icon({ suit, x, y, size, ink, rotate = 0, spill }: { suit: Suit; x: number; y: number; size: number; ink: Ink; rotate?: number; spill?: boolean }) {
  switch (suit) {
    case 'wands': return <WandIcon x={x} y={y} size={size} ink={ink} rotate={rotate} />;
    case 'cups': return <CupIcon x={x} y={y} size={size} ink={ink} rotate={rotate} spill={spill} />;
    case 'swords': return <SwordIcon x={x} y={y} size={size} ink={ink} rotate={rotate} />;
    case 'pentacles': return <PentacleIcon x={x} y={y} size={size} ink={ink} />;
  }
}

/** 默认排布（两列 + 中线），返回点位与建议尺寸 */
function defaultLayout(n: number): { pts: Pt[]; size: number } {
  const L = 66, R = 134, C = 100;
  const rows = (ys: number[], cols = [L, R]) => ys.flatMap((y) => cols.map((x) => [x, y] as Pt));
  switch (n) {
    case 1: return { pts: [[C, 156]], size: 110 };
    case 2: return { pts: [[C, 104], [C, 210]], size: 70 };
    case 3: return { pts: [[C, 86], [C, 156], [C, 226]], size: 54 };
    case 4: return { pts: rows([108, 204]), size: 58 };
    case 5: return { pts: [...rows([90, 222]), [C, 156]], size: 50 };
    case 6: return { pts: rows([82, 156, 230]), size: 48 };
    case 7: return { pts: [...rows([96, 166, 236]), [C, 64]], size: 42 };
    case 8: return { pts: [...rows([74, 238]), [L, 128], [R, 128], [L, 184], [R, 184]], size: 40 };
    case 9: return { pts: [...rows([70, 126, 186, 242]), [C, 156]], size: 36 };
    default: return { pts: [...rows([70, 128, 186, 244]), [C, 100], [C, 214]], size: 34 };
  }
}

/** 特殊排布（贴近 RWS 画面的构图） */
function specialLayout(suit: Suit, n: number): { pts: Pt[]; size: number; spill?: number[] } | null {
  const key = `${suit}-${n}`;
  switch (key) {
    case 'wands-1': return { pts: [[106, 150, 8]], size: 150 };
    case 'wands-5': return { pts: [[60, 156, -30], [140, 156, 30], [100, 150, 0], [76, 160, 50], [124, 160, -50]], size: 120 };
    case 'wands-8': return { pts: Array.from({ length: 8 }, (_, i) => [56 + i * 13, 130 + i * 8, 55] as Pt), size: 120 };
    case 'wands-10': return { pts: Array.from({ length: 10 }, (_, i) => [64 + i * 8, 150 + Math.abs(i - 4.5) * 3, -22 + i * 4.9] as Pt), size: 120 };
    case 'wands-2': return { pts: [[56, 150], [146, 150]], size: 150 };
    case 'wands-3': return { pts: [[50, 152], [100, 146], [150, 152]], size: 140 };
    case 'wands-4': return { pts: [[40, 168], [76, 168], [124, 168], [160, 168]], size: 120 };
    case 'wands-6': return { pts: [[40, 150, -8], [64, 152, -4], [88, 154], [112, 154], [136, 152, 4], [160, 150, 8]], size: 120 };
    case 'wands-7': return { pts: [[60, 140, -20], ...[46, 72, 100, 128, 154, 180].map((x) => [x - 8, 236, 0] as Pt)], size: 90 };
    case 'wands-9': return { pts: [[50, 150], ...[70, 90, 110, 130, 150, 170, 186, 30].map((x) => [x, 160] as Pt)], size: 120 };
    case 'cups-1': return { pts: [[100, 170]], size: 96 };
    case 'cups-2': return { pts: [[72, 196, -8], [128, 196, 8]], size: 56 };
    case 'cups-3': return { pts: [[66, 110, -14], [100, 92], [134, 110, 14]], size: 46 };
    case 'cups-4': return { pts: [[56, 220], [100, 220], [144, 220], [140, 100]], size: 42 };
    case 'cups-5': return { pts: [[44, 244, -90], [80, 248, 90], [62, 214, -80], [146, 210], [172, 214]], size: 36, spill: [0, 1, 2] };
    case 'cups-7': return { pts: [[54, 84], [100, 76], [146, 84], [54, 150], [100, 142], [146, 150], [100, 208]], size: 38 };
    case 'cups-8': return { pts: [[40, 236], [66, 236], [92, 236], [118, 236], [52, 204], [80, 204], [106, 204], [144, 236]], size: 30 };
    case 'cups-9': return { pts: Array.from({ length: 9 }, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return [100 + Math.cos(a) * 70, 128 + Math.sin(a) * 52] as Pt; }), size: 30 };
    case 'cups-10': return { pts: Array.from({ length: 10 }, (_, i) => { const a = Math.PI + (i / 9) * Math.PI; return [100 + Math.cos(a) * 72, 136 + Math.sin(a) * 74] as Pt; }), size: 26 };
    case 'swords-1': return { pts: [[100, 162]], size: 170 };
    case 'swords-2': return { pts: [[100, 144, -50], [100, 144, 50]], size: 130 };
    case 'swords-3': return { pts: [[100, 156, 0], [82, 160, -28], [118, 160, 28]], size: 140 };
    case 'swords-4': return { pts: [[56, 110, 180], [100, 104, 180], [144, 110, 180], [100, 222, 90]], size: 80 };
    case 'swords-5': return { pts: [[86, 150, -10], [100, 150], [114, 150, 10], [40, 236, 80], [160, 238, -70]], size: 80 };
    case 'swords-6': return { pts: Array.from({ length: 6 }, (_, i) => [74 + i * 10, 182, 0] as Pt), size: 76 };
    case 'swords-7': return { pts: [[60, 166, -40], [68, 170, -34], [76, 174, -28], [84, 178, -22], [92, 182, -16], [150, 210, 0], [166, 212, 6]], size: 80 };
    case 'swords-8': return { pts: [[32, 140], [52, 140], [72, 140], [128, 140], [148, 140], [168, 140], [42, 210], [158, 210]], size: 110 };
    case 'swords-9': return { pts: Array.from({ length: 9 }, (_, i) => [100, 66 + i * 14, 90] as Pt), size: 150 };
    case 'swords-10': return { pts: Array.from({ length: 10 }, (_, i) => [36 + i * 14, 180, 180] as Pt), size: 90 };
    case 'pentacles-1': return { pts: [[100, 110]], size: 92 };
    case 'pentacles-2': return { pts: [[82, 120], [118, 196]], size: 44 };
    case 'pentacles-3': return { pts: [[76, 92], [124, 92], [100, 124]], size: 34 };
    case 'pentacles-4': return { pts: [[100, 66], [100, 152], [72, 252], [128, 252]], size: 38 };
    case 'pentacles-5': return { pts: [[58, 76], [100, 70], [142, 76], [76, 112], [124, 112]], size: 28 };
    case 'pentacles-6': return { pts: [[54, 214], [80, 230], [120, 230], [146, 214], [100, 70], [100, 200]], size: 26 };
    case 'pentacles-7': return { pts: [[56, 100], [86, 92], [116, 104], [70, 136], [104, 140], [134, 128], [150, 228]], size: 30 };
    case 'pentacles-8': return { pts: [[40, 72], [40, 112], [40, 152], [40, 192], [76, 72], [76, 112], [76, 152], [138, 214]], size: 30 };
    case 'pentacles-9': return { pts: [[40, 90], [40, 130], [40, 170], [40, 210], [160, 90], [160, 130], [160, 170], [160, 210], [160, 250]], size: 28 };
    case 'pentacles-10': return { pts: [[100, 68], [66, 96], [134, 96], [66, 140], [134, 140], [100, 160], [66, 186], [134, 186], [100, 212], [100, 252]], size: 28 };
    default: return null;
  }
}

/* ---------------- 数字牌场景母题 ---------------- */

const Ship = ({ x, y, ink }: { x: number; y: number; ink: Ink }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-10 0 h20 l-4 5 h-12 Z" fill={ink.line} />
    <path d="M0 0 v-14 l8 12 Z" fill={ink.soft} stroke={ink.line} strokeWidth={0.6} />
  </g>
);

const Heart = ({ x, y, r, color, ink }: { x: number; y: number; r: number; color: string; ink: Ink }) => (
  <path d={`M${x} ${y + r * 0.9} C${x - r * 1.6} ${y - r * 0.2} ${x - r * 0.8} ${y - r * 1.4} ${x} ${y - r * 0.5} C${x + r * 0.8} ${y - r * 1.4} ${x + r * 1.6} ${y - r * 0.2} ${x} ${y + r * 0.9} Z`} fill={color} stroke={ink.line} strokeWidth={1.2} />
);

const Rain = ({ ink }: { ink: Ink }) => (
  <g opacity={0.6}>
    {Array.from({ length: 26 }).map((_, i) => {
      const x = 20 + ((i * 37) % 160), y = 60 + ((i * 59) % 200);
      return <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 12} {...S(ink, 0.8)} />;
    })}
  </g>
);

const Arch = ({ x, y, w, h, ink, gothic }: { x: number; y: number; w: number; h: number; ink: Ink; gothic?: boolean }) => (
  <path
    d={gothic
      ? `M${x - w / 2} ${y} V${y - h * 0.55} Q${x - w / 2} ${y - h * 0.95} ${x} ${y - h} Q${x + w / 2} ${y - h * 0.95} ${x + w / 2} ${y - h * 0.55} V${y}`
      : `M${x - w / 2} ${y} V${y - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${y - h + w / 2} V${y}`}
    {...S(ink, 2)}
  />
);

const Lying = ({ x, y, ink, s = 1 }: { x: number; y: number; ink: Ink; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={-44} cy={-6} r={7} fill={ink.soft} stroke={ink.line} strokeWidth={1.2} />
    <path d="M-36 -10 L40 -8 L42 4 L-36 2 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
  </g>
);

function pipMotif(suit: Suit, n: number, ink: Ink): ReactNode {
  const key = `${suit}-${n}`;
  switch (key) {
    // ---- 权杖 ----
    case 'wands-1': return <g><HandFromCloud x={92} y={192} ink={ink} /><Tower x={150} y={258} w={18} h={30} ink={ink} /><Mountains y={262} ink={ink} peaks={[[20, 24], [120, 30]]} /></g>;
    case 'wands-2': return <g><circle cx={100} cy={226} r={20} fill={ink.soft} stroke={ink.line} /><path d="M80 226 h40 M100 206 v40 M86 212 q14 14 0 28 M114 212 q-14 14 0 28" {...S(ink, 0.8)} /><Ground y={252} ink={ink} /></g>;
    case 'wands-3': return <g><Waves y={232} ink={ink} /><Ship x={70} y={232} ink={ink} /><Ship x={134} y={238} ink={ink} /><Mountains y={226} ink={ink} peaks={[[150, 20]]} /></g>;
    case 'wands-4': return <g><path d="M40 108 Q100 70 160 108" stroke="#8fb36a" strokeWidth={5} fill="none" /><Rose x={70} y={92} r={5} ink={ink} color="#e47a7a" /><Rose x={130} y={92} r={5} ink={ink} color="#f0c25a" /><Tower x={100} y={262} w={22} h={36} ink={ink} /><Ground y={262} ink={ink} /></g>;
    case 'wands-5': return <g><Ground y={252} ink={ink} />{[40, 80, 120, 160].map((x) => <path key={x} d={`M${x} 250 q6 -8 12 0`} {...S(ink, 0.8)} />)}</g>;
    case 'wands-6': return <g><circle cx={100} cy={72} r={14} fill="none" stroke="#8fb36a" strokeWidth={4} /><Figure x={100} y={262} s={0.8} ink={ink} arms="raise-right" crown="circlet" fill={ink.soft} /></g>;
    case 'wands-7': return <g><path d="M14 272 L14 196 Q80 176 120 210 L186 272 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1} /><Figure x={60} y={204} s={0.8} ink={ink} arms="out" fill={ink.soft} /></g>;
    case 'wands-8': return <g><Mountains y={258} ink={ink} peaks={[[30, 22], [120, 30]]} /><Waves y={262} ink={ink} count={1} /></g>;
    case 'wands-9': return <g><Figure x={100} y={262} s={1} ink={ink} arms="hold" fill={ink.soft}><path d="M-8 -58 h16" stroke="#f3eadb" strokeWidth={3} /></Figure><Ground y={262} ink={ink} /></g>;
    case 'wands-10': return <g><Figure x={100} y={262} s={1} ink={ink} arms="out" fill={ink.soft} /><Tower x={168} y={262} w={16} h={26} ink={ink} /><Ground y={262} ink={ink} /></g>;
    // ---- 圣杯 ----
    case 'cups-1': return <g><HandFromCloud x={70} y={232} ink={ink} />{[-24, -12, 0, 12, 24].map((d) => <path key={d} d={`M${100 + d / 3} 130 q${d} 60 ${d * 1.6} 120`} stroke={ink.accent} strokeWidth={1.4} fill="none" opacity={0.8} />)}<path d="M92 72 l8 10 l8 -10 l-8 -4 Z M84 66 l16 6 l16 -6" fill="#f3eadb" stroke={ink.line} strokeWidth={0.8} /><Waves y={256} ink={ink} count={2} /></g>;
    case 'cups-2': return <g><path d="M100 80 v70" {...S(ink, 2)} /><path d="M100 90 q-14 10 0 20 q14 10 0 20 q-14 10 0 20 M100 90 q14 10 0 20 q-14 10 0 20 q14 10 0 20" stroke={ink.accent} strokeWidth={1.4} fill="none" /><path d="M84 82 q16 -16 32 0" {...S(ink, 1.4)} /><circle cx={100} cy={72} r={7} fill={ink.accent} stroke={ink.line} /><Figure x={56} y={262} s={0.8} ink={ink} arms="hold" fill={ink.soft} /><Figure x={144} y={262} s={0.8} ink={ink} arms="hold" crown="circlet" fill={ink.soft} /></g>;
    case 'cups-3': return <g>{[[60, 230], [100, 240], [140, 228]].map(([x, y], i) => <Figure key={i} x={x} y={y + 20} s={0.85} ink={ink} arms="up" fill={ink.soft} />)}<g fill="#8a5bb5">{[40, 46, 52].map((x) => <circle key={x} cx={x} cy={256} r={3} />)}</g><circle cx={164} cy={254} r={6} fill="#e3a24a" /></g>;
    case 'cups-4': return <g><Tree x={44} y={256} h={70} ink={ink} /><HandFromCloud x={176} y={104} ink={ink} side="right" /><Figure x={100} y={262} s={0.8} ink={ink} arms="hold" fill={ink.soft} /></g>;
    case 'cups-5': return <g><Waves y={186} ink={ink} count={2} /><path d="M120 176 q20 -16 40 0" {...S(ink, 2)} /><Tower x={166} y={176} w={14} h={24} ink={ink} /><Figure x={110} y={252} s={1} ink={ink} arms="down" fill="#1a1426" /></g>;
    case 'cups-6': return <g>{[[66, 204], [134, 204], [100, 108]].map(([x, y], i) => <Rose key={i} x={x} y={y - 26} r={6} ink={ink} color="#f3eadb" />)}<Tower x={170} y={262} w={18} h={44} ink={ink} /><Figure x={60} y={262} s={0.6} ink={ink} arms="hold" fill={ink.soft} /><Figure x={84} y={262} s={0.75} ink={ink} arms="hold" fill={ink.soft} /></g>;
    case 'cups-7': return <g>{[[54, 104], [100, 96], [146, 104], [54, 170], [100, 162], [146, 170], [100, 228]].map(([x, y], i) => <Cloud key={i} x={x} y={y} w={40} ink={ink} />)}<g transform="translate(54 70)"><circle r={4} fill={ink.soft} /></g><path d={starPath(146, 132, 5, 6)} fill={ink.accent} /><path d="M92 134 q8 -10 16 0" stroke={ink.accent} strokeWidth={1.6} fill="none" /><Figure x={100} y={276} s={0.55} ink={ink} arms="out" fill="#0d0a18" /></g>;
    case 'cups-8': return <g><Moon cx={100} cy={70} r={16} ink={ink} phase={0.5} /><Mountains y={190} ink={ink} peaks={[[24, 60], [90, 80], [140, 64]]} /><Waves y={262} ink={ink} count={1} /><Figure x={156} y={186} s={0.6} ink={ink} arms="hold" fill="#a2414a" /></g>;
    case 'cups-9': return <g><path d="M30 130 Q100 60 170 130" {...S(ink, 1)} opacity={0.6} /><Figure x={100} y={250} s={1.25} ink={ink} arms="hold" crown="round" fill={ink.soft} /><rect x={60} y={248} width={80} height={10} fill={ink.dark} stroke={ink.line} /></g>;
    case 'cups-10': return <g>{['#c84b4b', '#e3a24a', '#e8d65a', '#6fae6a', '#5f8fd1'].map((c, i) => <path key={c} d={`M${18 + i * 5} 150 A${82 - i * 5} ${84 - i * 5} 0 0 1 ${182 - i * 5} 150`} stroke={c} strokeWidth={3} fill="none" opacity={0.7} />)}<Figure x={70} y={262} s={0.75} ink={ink} arms="open" fill={ink.soft} /><Figure x={96} y={262} s={0.75} ink={ink} arms="open" fill={ink.soft} /><Figure x={132} y={262} s={0.45} ink={ink} arms="up" fill={ink.soft} /><Figure x={150} y={262} s={0.45} ink={ink} arms="up" fill={ink.soft} /><Ground y={262} ink={ink} /></g>;
    // ---- 宝剑 ----
    case 'swords-1': return <g><HandFromCloud x={84} y={236} ink={ink} /><path d="M80 82 L84 70 L92 78 L100 64 L108 78 L116 70 L120 82 Z" fill={ink.line} /><path d="M80 84 q-20 20 -14 46 M120 84 q20 20 14 46" stroke="#8fb36a" strokeWidth={2} fill="none" />{Array.from({ length: 6 }).map((_, i) => <path key={i} d={starPath(60 + i * 16, 104 + (i % 2) * 10, 3, 6, 0.4)} fill={ink.line} />)}<Mountains y={262} ink={ink} peaks={[[20, 30], [120, 40]]} /></g>;
    case 'swords-2': return <g><Moon cx={150} cy={66} r={12} ink={ink} phase={0.5} /><Waves y={210} ink={ink} count={3} /><Figure x={100} y={258} s={1.05} ink={ink} arms="none" fill="#e9e3d4"><rect x={-9} y={-58} width={18} height={4} fill={ink.dark} /></Figure></g>;
    case 'swords-3': return <g><Cloud x={56} y={84} w={70} ink={ink} /><Cloud x={150} y={74} w={60} ink={ink} /><Rain ink={ink} /><Heart x={100} y={164} r={36} color="#b8303f" ink={ink} /></g>;
    case 'swords-4': return <g><Arch x={100} y={176} w={70} h={86} ink={ink} /><path d="M70 128 h60 M100 100 v60" stroke={ink.accent} strokeWidth={1} opacity={0.7} /><rect x={40} y={246} width={120} height={16} fill={ink.dark} stroke={ink.line} /><Lying x={104} y={244} ink={ink} s={0.9} /></g>;
    case 'swords-5': return <g><Cloud x={40} y={70} w={50} ink={ink} /><Cloud x={150} y={84} w={46} ink={ink} /><Waves y={250} ink={ink} count={1} /><Figure x={100} y={262} s={1} ink={ink} arms="hold" fill={ink.soft} /><Figure x={40} y={262} s={0.6} ink={ink} arms="down" fill={ink.dark} /><Figure x={164} y={262} s={0.6} ink={ink} arms="down" fill={ink.dark} /></g>;
    case 'swords-6': return <g><Waves y={228} ink={ink} count={3} /><path d="M40 214 h120 l-16 18 h-88 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.4} /><Figure x={90} y={214} s={0.6} ink={ink} arms="down" fill={ink.soft} /><Figure x={140} y={214} s={0.7} ink={ink} arms="out" fill={ink.soft} /><Mountains y={182} ink={ink} peaks={[[110, 26]]} /></g>;
    case 'swords-7': return <g>{[[150, 100], [176, 108], [40, 98]].map(([x, y], i) => <path key={i} d={`M${x - 16} ${y + 26} L${x} ${y} L${x + 16} ${y + 26} Z`} fill={ink.dark} stroke={ink.line} />)}<Figure x={78} y={262} s={1} ink={ink} arms="out" fill={ink.soft} /><Ground y={262} ink={ink} /></g>;
    case 'swords-8': return <g><Tower x={160} y={88} w={18} h={30} ink={ink} /><path d="M140 88 q20 -10 46 0" {...S(ink, 1)} /><Figure x={100} y={250} s={1.15} ink={ink} arms="none" fill="#a2414a"><rect x={-9} y={-58} width={18} height={4} fill={ink.dark} /><path d="M-10 -40 l20 6 M-10 -32 l20 6 M-10 -24 l20 6" {...S(ink, 1)} /></Figure><Waves y={262} ink={ink} count={1} /></g>;
    case 'swords-9': return <g><rect x={30} y={226} width={140} height={30} fill={ink.dark} stroke={ink.line} />{Array.from({ length: 6 }).map((_, i) => <Rose key={i} x={44 + i * 22} y={240} r={3} ink={ink} color="#b8303f" />)}<g transform="translate(100 226)"><circle cx={0} cy={-34} r={8} fill={ink.soft} stroke={ink.line} /><path d="M-8 -30 l4 -10 M8 -30 l-4 -10" {...S(ink, 2)} /><path d="M-12 0 Q-10 -20 0 -26 Q10 -20 12 0 Z" fill="#e9e3d4" stroke={ink.line} /></g></g>;
    case 'swords-10': return <g><rect x={14} y={40} width={172} height={100} fill="#05030a" opacity={0.5} /><path d="M14 210 Q100 196 186 210" stroke="#f0b65a" strokeWidth={3} fill="none" /><Waves y={220} ink={ink} count={2} /><Lying x={104} y={196} ink={ink} s={1.25} /><Mountains y={210} ink={ink} peaks={[[150, 16]]} /></g>;
    // ---- 星币 ----
    case 'pentacles-1': return <g><HandFromCloud x={70} y={124} ink={ink} /><Arch x={100} y={258} w={56} h={70} ink={ink} /><path d="M72 192 q28 -40 56 0" stroke="#8fb36a" strokeWidth={4} fill="none" />{[40, 60, 140, 160].map((x) => <g key={x}><line x1={x} y1={262} x2={x} y2={232} stroke="#8fb36a" strokeWidth={1.4} /><Rose x={x} y={230} r={5} ink={ink} color="#f3eadb" /></g>)}<Mountains y={238} ink={ink} peaks={[[86, 26]]} /></g>;
    case 'pentacles-2': return <g><Lemniscate x={100} y={158} w={100} ink={ink} sw={2.4} /><Waves y={74} ink={ink} count={2} amp={6} /><Ship x={56} y={76} ink={ink} /><Ship x={150} y={84} ink={ink} /><Figure x={100} y={262} s={0.9} ink={ink} arms="out" fill={ink.soft} /></g>;
    case 'pentacles-3': return <g><Arch x={100} y={198} w={110} h={150} ink={ink} gothic /><Arch x={100} y={198} w={80} h={120} ink={ink} gothic /><rect x={60} y={198} width={30} height={10} fill={ink.dark} stroke={ink.line} /><Figure x={76} y={198} s={0.7} ink={ink} arms="raise-right" fill={ink.soft} /><Figure x={128} y={262} s={0.75} ink={ink} arms="hold" fill={ink.dark} /><Figure x={150} y={262} s={0.75} ink={ink} arms="hold" fill={ink.soft} /></g>;
    case 'pentacles-4': return <g>{[30, 50, 150, 172].map((x, i) => <Tower key={x} x={x} y={262} w={16} h={40 + (i % 2) * 18} ink={ink} />)}<Figure x={100} y={262} s={1.25} ink={ink} arms="hold" crown="round" fill={ink.dark} /></g>;
    case 'pentacles-5': return <g>{Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={20 + ((i * 41) % 160)} cy={140 + ((i * 29) % 120)} r={1.5} fill="#f3f3ff" opacity={0.8} />)}<rect x={40} y={50} width={120} height={84} fill={ink.glow} opacity={0.25} stroke={ink.line} /><Figure x={78} y={262} s={0.85} ink={ink} arms="down" fill={ink.dark}><line x1={14} y1={-30} x2={18} y2={0} {...S(ink, 1.6)} /></Figure><Figure x={128} y={262} s={0.85} ink={ink} arms="hold" fill="#2a2440" /></g>;
    case 'pentacles-6': return <g><g transform="translate(100 130)"><line x1={0} y1={-28} x2={0} y2={14} {...S(ink, 1.4)} /><line x1={-26} y1={-24} x2={26} y2={-24} {...S(ink, 1.6)} /><path d="M-26 -24 l-8 16 h16 Z M26 -24 l-8 16 h16 Z" fill={ink.soft} stroke={ink.line} /></g><Figure x={100} y={262} s={1} ink={ink} arms="out" crown="circlet" fill="#a2414a" /><Figure x={52} y={262} s={0.6} ink={ink} arms="up" fill={ink.dark} /><Figure x={148} y={262} s={0.6} ink={ink} arms="up" fill={ink.dark} /></g>;
    case 'pentacles-7': return <g><path d="M40 260 Q60 150 120 120 Q90 170 110 260" fill="#3f6e3a" opacity={0.75} stroke={ink.line} />{[[60, 200], [96, 160], [80, 230]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={10} ry={5} fill="#6fae6a" transform={`rotate(-30 ${x} ${y})`} />)}<Figure x={154} y={262} s={0.9} ink={ink} arms="hold" fill={ink.soft}><line x1={-4} y1={-26} x2={-24} y2={0} {...S(ink, 1.8)} /></Figure></g>;
    case 'pentacles-8': return <g><rect x={90} y={232} width={90} height={10} fill={ink.dark} stroke={ink.line} /><Figure x={136} y={232} s={0.95} ink={ink} arms="hold" fill={ink.soft} /><Tower x={40} y={262} w={16} h={30} ink={ink} /><Ground y={262} ink={ink} /></g>;
    case 'pentacles-9': return <g>{[60, 80, 120, 140].map((x, i) => <g key={x} fill="#8a5bb5">{[0, 1, 2].map((k) => <circle key={k} cx={x + k * 4 - 4} cy={78 + (i % 2) * 20 + k * 4} r={3} />)}</g>)}<Figure x={100} y={262} s={1.3} ink={ink} arms="hold" fill="#d6a64a"><path d="M10 -34 q8 -8 14 0 l-4 6 Z" fill={ink.dark} stroke={ink.line} /></Figure></g>;
    case 'pentacles-10': return <g><Arch x={100} y={272} w={150} h={210} ink={ink} /><Figure x={40} y={266} s={0.8} ink={ink} arms="hold" fill="#a2414a" /><Figure x={160} y={266} s={0.7} ink={ink} arms="hold" fill={ink.soft} /><g transform="translate(64 266)"><path d="M0 0 q-2 -10 6 -12 l10 0 q4 -6 8 -2" {...S(ink, 1.2)} fill={ink.soft} /></g></g>;
  }
  return null;
}

export function PipArt({ suit, rank, ink }: { suit: Suit; rank: number; ink: Ink }) {
  const special = specialLayout(suit, rank);
  const { pts, size } = special ?? defaultLayout(rank);
  return (
    <g>
      <g opacity={0.62}>{pipMotif(suit, rank, ink)}</g>
      {suit === 'swords' && rank === 3 && <Heart x={100} y={164} r={36} color="#b8303f" ink={ink} />}
      {pts.map(([x, y, r], i) => (
        <Icon key={i} suit={suit} x={x} y={y} size={size} ink={ink} rotate={r ?? 0} spill={special?.spill?.includes(i)} />
      ))}
      {suit === 'pentacles' && rank === 2 && null}
    </g>
  );
}

/* ---------------- 宫廷牌 ---------------- */

const Emblem = ({ suit, x, y, ink }: { suit: Suit; x: number; y: number; ink: Ink }) => {
  switch (suit) {
    case 'wands': // 火蜥蜴
      return <path transform={`translate(${x} ${y})`} d="M-14 4 q6 -12 14 -4 q8 8 14 -4 q2 -4 -2 -6" stroke={ink.accent} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case 'cups': // 鱼
      return <path transform={`translate(${x} ${y})`} d="M-12 0 q12 -10 22 0 q-10 10 -22 0 Z M10 0 l8 -6 v12 Z" fill={ink.accent} stroke={ink.line} strokeWidth={0.8} />;
    case 'swords': // 蝴蝶
      return <g transform={`translate(${x} ${y})`} fill={ink.accent} stroke={ink.line} strokeWidth={0.8}><path d="M0 0 q-14 -14 -14 2 q4 8 14 -2 Z" /><path d="M0 0 q14 -14 14 2 q-4 8 -14 -2 Z" /></g>;
    case 'pentacles': // 牛角与葡萄
      return <g transform={`translate(${x} ${y})`}><path d="M-12 -2 q-4 -10 2 -12 M12 -2 q4 -10 -2 -12" {...S(ink, 2)} /><circle r={6} fill={ink.soft} stroke={ink.line} />{[-4, 0, 4].map((d) => <circle key={d} cx={d} cy={10} r={2.4} fill="#8a5bb5" />)}</g>;
  }
};

function SuitScene({ suit, ink }: { suit: Suit; ink: Ink }) {
  switch (suit) {
    case 'wands':
      return <g opacity={0.6}><path d="M14 236 L40 210 L64 236 Z M120 236 L150 200 L180 236 Z" fill={ink.dark} stroke={ink.line} /><Ground y={238} ink={ink} /></g>;
    case 'cups':
      return <g opacity={0.6}><Waves y={232} ink={ink} count={3} /></g>;
    case 'swords':
      return <g opacity={0.6}><Cloud x={50} y={86} w={60} ink={ink} /><Cloud x={156} y={110} w={48} ink={ink} /><path d="M20 140 q30 -6 60 0 M120 160 q30 -6 60 0" {...S(ink, 0.8)} /><Ground y={240} ink={ink} /></g>;
    case 'pentacles':
      return <g opacity={0.6}><Tree x={36} y={240} h={60} ink={ink} /><Tree x={166} y={240} h={50} ink={ink} /><path d="M14 240 h172 M24 248 h152 M40 256 h120" {...S(ink, 0.8)} /></g>;
  }
}

const Horse = ({ x, y, ink, pose, color }: { x: number; y: number; ink: Ink; pose: 'rear' | 'walk' | 'charge' | 'stand'; color: string }) => {
  const rot = pose === 'rear' ? -16 : pose === 'charge' ? 6 : 0;
  const legs =
    pose === 'rear' ? 'M-24 10 L-30 34 M-14 12 L-18 36 M22 8 L34 -6 M30 4 L40 -10'
      : pose === 'charge' ? 'M-24 10 L-40 30 M-14 12 L-6 34 M22 8 L40 26 M30 4 L50 14'
        : pose === 'walk' ? 'M-24 10 L-26 36 M-14 12 L-8 36 M22 8 L20 36 M30 4 L36 34'
          : 'M-24 10 L-24 36 M-14 12 L-14 36 M22 8 L22 36 M30 4 L30 36';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={legs} stroke={ink.line} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={36} ry={16} fill={color} stroke={ink.line} strokeWidth={1.4} />
      <path d="M26 -6 L40 -34 L54 -30 L52 -22 L42 -18 L36 4 Z" fill={color} stroke={ink.line} strokeWidth={1.4} />
      <path d="M40 -34 l2 -8 l4 6" fill={color} stroke={ink.line} />
      <path d="M-34 -4 q-14 4 -10 24" stroke={ink.line} strokeWidth={3} fill="none" />
    </g>
  );
};

export function CourtArt({ suit, rank, ink }: { suit: Suit; rank: 11 | 12 | 13 | 14; ink: Ink }) {
  const pose = ({ wands: 'rear', cups: 'walk', swords: 'charge', pentacles: 'stand' } as const)[suit];
  const horseColor = ({ wands: '#c97a3a', cups: '#e9e3d4', swords: '#d9dbe4', pentacles: '#1b1626' } as const)[suit];
  return (
    <g>
      <SuitScene suit={suit} ink={ink} />
      {rank === 11 && (
        <g>
          <Figure x={100} y={244} s={1.7} ink={ink} arms={suit === 'pentacles' || suit === 'cups' ? 'hold' : 'raise-right'} crown="circlet" fill={ink.soft} />
          <Icon suit={suit} x={suit === 'cups' || suit === 'pentacles' ? 100 : 134} y={suit === 'cups' || suit === 'pentacles' ? 152 : 114} size={suit === 'wands' || suit === 'swords' ? 90 : 34} ink={ink} />
          {suit === 'cups' && <path d="M96 140 q4 -10 10 -4 q-4 4 -10 4" fill={ink.accent} />}
          <Emblem suit={suit} x={100} y={210} ink={ink} />
        </g>
      )}
      {rank === 12 && (
        <g>
          <Horse x={92} y={210} ink={ink} pose={pose} color={horseColor} />
          <Figure x={84} y={200} s={1.1} ink={ink} arms="raise-right" crown="helm" fill={ink.dark}>
            <path d="M-4 -78 q-8 -10 -2 -18" stroke={ink.accent} strokeWidth={2.4} fill="none" />
          </Figure>
          <Icon suit={suit} x={suit === 'cups' || suit === 'pentacles' ? 108 : 104} y={suit === 'cups' || suit === 'pentacles' ? 134 : 96} size={suit === 'wands' || suit === 'swords' ? 74 : 28} ink={ink} rotate={suit === 'swords' ? 20 : 0} />
          <Emblem suit={suit} x={80} y={170} ink={ink} />
        </g>
      )}
      {(rank === 13 || rank === 14) && (
        <g>
          {/* 王座 */}
          <path d="M54 92 Q100 64 146 92 L146 232 L54 232 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.6} />
          <rect x={46} y={232} width={108} height={14} fill={ink.dark} stroke={ink.line} strokeWidth={1.4} />
          <Emblem suit={suit} x={100} y={98} ink={ink} />
          <Figure x={100} y={236} s={1.55} ink={ink} arms={rank === 13 ? 'hold' : 'raise-right'} crown="round" fill={rank === 13 ? ink.soft : ink.accent}>
            {rank === 14 && <path d="M-9 -68 l0 -6 l18 0 l0 6" fill={ink.line} />}
          </Figure>
          <Icon
            suit={suit}
            x={rank === 13 ? 100 : 128}
            y={rank === 13 ? 170 : 132}
            size={suit === 'wands' || suit === 'swords' ? (rank === 13 ? 70 : 84) : 30}
            ink={ink}
            rotate={rank === 13 && (suit === 'wands' || suit === 'swords') ? -20 : 0}
          />
          {suit === 'wands' && rank === 13 && <g transform="translate(66 188)">{Array.from({ length: 8 }).map((_, k) => <ellipse key={k} cx={0} cy={-6} rx={2} ry={5} transform={`rotate(${k * 45})`} fill="#f1c24a" />)}<circle r={3} fill="#6b3f1d" /></g>}
          {suit === 'wands' && rank === 13 && <path d="M118 262 q4 -10 10 -6 q6 -6 8 2 q-2 6 -8 4 Z" fill="#141022" stroke={ink.line} />}
        </g>
      )}
      {[[30, 60], [170, 64]].map(([x, y], i) => <Sparkle key={i} cx={x} cy={y} r={3} color={ink.line} />)}
      <Star cx={100} cy={56} r={0} ink={ink} />
    </g>
  );
}

export { Rose };
