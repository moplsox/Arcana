/**
 * 22 张大阿尔卡那的独立插画。每张都依据 Rider-Waite-Smith 的核心象征重新绘制为金箔线描风格。
 * 绘制区域约为 x:14-186, y:40-272。
 */
import type { ReactNode } from 'react';
import {
  Cloud, CupIcon, Figure, Ground, Lemniscate, Moon, Mountains, PentacleIcon, Pillar, Rose, S, Sparkle, Star, Sun, SwordIcon,
  Tower, Tree, WandIcon, Waves, Wings, pentagram, starPath, type Ink,
} from './primitives';

type Art = (ink: Ink) => ReactNode;

const Fool: Art = (ink) => (
  <g>
    <Sun cx={150} cy={78} r={16} ink={ink} />
    <Mountains y={205} ink={ink} peaks={[[20, 50], [60, 80], [110, 55]]} />
    {/* 悬崖 */}
    <path d="M14 272 L14 222 L120 222 L138 236 L132 272 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.3} />
    <Figure x={92} y={222} s={1.05} ink={ink} arms="open">
      <line x1={18} y1={-58} x2={-6} y2={-90} {...S(ink, 1.4)} />
      <circle cx={-8} cy={-92} r={6} fill={ink.accent} stroke={ink.line} strokeWidth={1} />
      <Rose x={-22} y={-58} r={5} ink={ink} color="#f6efe0" />
    </Figure>
    {/* 小白犬 */}
    <g transform="translate(130 222)">
      <path d="M0 0 q-2 -10 6 -12 l10 0 q4 -6 8 -2 q2 4 -2 6 l0 8" {...S(ink, 1.3)} fill={ink.soft} />
      <path d="M6 0 l0 -4 M16 0 l0 -4" {...S(ink, 1.2)} />
    </g>
    <Sparkle cx={40} cy={70} r={5} color={ink.line} />
  </g>
);

const Magician: Art = (ink) => (
  <g>
    <Lemniscate x={100} y={58} w={34} ink={ink} sw={2} />
    <Figure x={100} y={202} s={1.25} ink={ink} arms="raise-right" fill={ink.dark}>
      <WandIcon x={16} y={-84} size={30} ink={ink} />
      <path d="M-20 -14 q20 6 40 0" {...S(ink, 1)} />
    </Figure>
    {/* 祭坛桌 */}
    <rect x={30} y={204} width={140} height={34} fill={ink.dark} stroke={ink.line} strokeWidth={1.4} />
    <line x1={30} y1={212} x2={170} y2={212} {...S(ink, 0.8)} />
    <CupIcon x={58} y={192} size={20} ink={ink} />
    <SwordIcon x={86} y={190} size={22} ink={ink} rotate={90} />
    <PentacleIcon x={118} y={194} size={16} ink={ink} />
    <WandIcon x={146} y={194} size={22} ink={ink} rotate={80} />
    <Rose x={36} y={252} r={7} ink={ink} color="#b5404b" />
    <Rose x={164} y={252} r={7} ink={ink} color="#f3eadb" />
    <Rose x={100} y={258} r={6} ink={ink} color="#b5404b" />
  </g>
);

const HighPriestess: Art = (ink) => (
  <g>
    <rect x={44} y={70} width={112} height={150} fill={ink.soft} opacity={0.45} />
    {[60, 84, 108, 132].map((x) =>
      [96, 126, 156, 186].map((y) => <circle key={`${x}-${y}`} cx={x + (y % 60 === 6 ? 8 : 0)} cy={y} r={4.5} fill={ink.accent} opacity={0.75} />),
    )}
    <Pillar x={34} top={70} bottom={252} ink={ink} label="B" dark />
    <Pillar x={166} top={70} bottom={252} ink={ink} label="J" />
    <Figure x={100} y={242} s={1.35} ink={ink} arms="hold" fill={ink.dark}>
      <Moon cx={0} cy={-80} r={6} ink={ink} rotate={-90} />
      <circle cx={-6} cy={-80} r={3.5} fill={ink.line} />
      <circle cx={6} cy={-80} r={3.5} fill={ink.line} />
      <rect x={-7} y={-34} width={14} height={9} rx={2} fill={ink.soft} stroke={ink.line} strokeWidth={0.8} />
      <path d="M-6 -42 h12 M0 -46 v10" {...S(ink, 1)} />
    </Figure>
    <Moon cx={100} cy={256} r={12} ink={ink} rotate={90} phase={0.4} />
  </g>
);

const Empress: Art = (ink) => (
  <g>
    <Tree x={36} y={200} h={90} ink={ink} />
    <Tree x={166} y={196} h={80} ink={ink} />
    <Waves y={66} ink={ink} count={1} x0={120} x1={180} />
    <Figure x={100} y={218} s={1.4} ink={ink} arms="hold" crown="star" fill={ink.dark} />
    {/* 金星盾 */}
    <g transform="translate(140 196)">
      <path d="M-14 -16 h28 v14 q0 14 -14 20 q-14 -6 -14 -20 Z" fill={ink.soft} stroke={ink.line} strokeWidth={1.2} />
      <circle cx={0} cy={-4} r={5} {...S(ink, 1.2)} />
      <path d="M0 1 v9 M-4 6 h8" {...S(ink, 1.2)} />
    </g>
    {/* 麦穗 */}
    {[30, 50, 70, 130, 150, 170].map((x, i) => (
      <g key={x} transform={`translate(${x} 266) rotate(${(i - 2.5) * 4})`}>
        <line x1={0} y1={0} x2={0} y2={-34} {...S(ink, 1)} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <ellipse cx={-3} cy={-30 + k * 6} rx={2.4} ry={4} transform={`rotate(-25 ${-3} ${-30 + k * 6})`} fill={ink.line} />
            <ellipse cx={3} cy={-30 + k * 6} rx={2.4} ry={4} transform={`rotate(25 3 ${-30 + k * 6})`} fill={ink.line} />
          </g>
        ))}
      </g>
    ))}
  </g>
);

const Emperor: Art = (ink) => (
  <g>
    <Mountains y={160} ink={ink} peaks={[[16, 70], [70, 90], [130, 75], [160, 60]]} />
    {/* 石座 */}
    <rect x={46} y={110} width={108} height={150} fill={ink.dark} stroke={ink.line} strokeWidth={1.5} />
    {[[46, 110], [154, 110], [46, 196], [154, 196]].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y + 8} q${x < 100 ? -14 : 14} -2 ${x < 100 ? -10 : 10} 12 q${x < 100 ? 8 : -8} 2 ${x < 100 ? 6 : -6} -6`} {...S(ink, 1.4)} />
    ))}
    <Figure x={100} y={248} s={1.5} ink={ink} arms="hold" crown="round" fill={ink.soft}>
      {/* 安卡权杖 */}
      <g transform="translate(-24 -50)">
        <line x1={0} y1={0} x2={0} y2={34} {...S(ink, 2)} />
        <ellipse cx={0} cy={-6} rx={4} ry={6} {...S(ink, 1.6)} />
        <line x1={-6} y1={2} x2={6} y2={2} {...S(ink, 1.6)} />
      </g>
      <circle cx={22} cy={-32} r={5} fill={ink.line} />
      <path d="M-14 -20 h28" {...S(ink, 1)} />
    </Figure>
  </g>
);

const Hierophant: Art = (ink) => (
  <g>
    <Pillar x={34} top={80} bottom={232} ink={ink} dark />
    <Pillar x={166} top={80} bottom={232} ink={ink} dark />
    <Figure x={100} y={212} s={1.45} ink={ink} arms="raise-right" crown="triple" fill={ink.dark}>
      <g transform="translate(-20 -60)">
        <line x1={0} y1={0} x2={0} y2={44} {...S(ink, 1.6)} />
        <path d="M-6 0 h12 M-5 -5 h10 M-4 -10 h8" {...S(ink, 1.4)} />
      </g>
      <path d="M-6 -36 l12 0 M0 -42 l0 14" {...S(ink, 1)} />
    </Figure>
    {/* 交叉钥匙 */}
    <g transform="translate(100 240)">
      {[-35, 35].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <line x1={0} y1={-18} x2={0} y2={14} {...S(ink, 2)} />
          <circle cx={0} cy={-22} r={5} {...S(ink, 1.6)} />
          <path d="M0 8 h6 M0 13 h5" {...S(ink, 1.6)} />
        </g>
      ))}
    </g>
    <circle cx={70} cy={262} r={7} fill={ink.soft} stroke={ink.line} />
    <circle cx={130} cy={262} r={7} fill={ink.soft} stroke={ink.line} />
  </g>
);

const Lovers: Art = (ink) => (
  <g>
    <Sun cx={100} cy={60} r={12} ink={ink} />
    <Wings x={100} y={104} span={58} ink={ink} />
    <circle cx={100} cy={96} r={7} fill={ink.soft} stroke={ink.line} />
    <Cloud x={100} y={128} w={110} ink={ink} />
    <Mountains y={196} ink={ink} peaks={[[80, 40]]} />
    <Tree x={40} y={226} h={70} ink={ink} fruit="#c84b4b" />
    <path d="M40 222 q-8 -12 2 -20 q10 -8 0 -18 q-6 -6 0 -12" stroke={ink.accent} strokeWidth={1.8} fill="none" />
    <Tree x={160} y={226} h={70} ink={ink} fruit="#e3a24a" />
    <Figure x={64} y={262} s={1} ink={ink} arms="open" fill={ink.soft} />
    <Figure x={136} y={262} s={1} ink={ink} arms="open" fill={ink.soft} />
  </g>
);

const Chariot: Art = (ink) => (
  <g>
    {/* 星幕顶篷 */}
    <path d="M40 70 L160 70 L150 88 L50 88 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    {[56, 76, 96, 116, 136].map((x) => <Star key={x} cx={x + 4} cy={79} r={3.2} ink={ink} />)}
    <line x1={52} y1={88} x2={52} y2={170} {...S(ink, 1.6)} />
    <line x1={148} y1={88} x2={148} y2={170} {...S(ink, 1.6)} />
    <Figure x={100} y={170} s={1.15} ink={ink} arms="hold" crown="star" fill={ink.soft}>
      <WandIcon x={18} y={-50} size={30} ink={ink} />
    </Figure>
    {/* 车身 */}
    <rect x={40} y={164} width={120} height={50} fill={ink.dark} stroke={ink.line} strokeWidth={1.6} />
    <circle cx={100} cy={189} r={10} fill={ink.soft} stroke={ink.line} />
    <Wings x={100} y={189} span={22} ink={ink} />
    {/* 黑白斯芬克斯 */}
    {[[64, '#e9e3d4'], [136, '#151022']].map(([x, c]) => (
      <g key={x as number} transform={`translate(${x} 250)`}>
        <path d="M-20 0 q0 -16 10 -18 l0 -12 q10 -8 20 0 l0 12 q10 2 10 18 Z" fill={c as string} stroke={ink.line} strokeWidth={1.2} />
        <circle cx={0} cy={-28} r={5} fill={c as string} stroke={ink.line} />
      </g>
    ))}
    <Ground y={254} ink={ink} />
  </g>
);

const Strength: Art = (ink) => (
  <g>
    <Lemniscate x={86} y={74} w={28} ink={ink} />
    <Mountains y={170} ink={ink} peaks={[[110, 50]]} />
    <Figure x={74} y={252} s={1.4} ink={ink} arms="out" fill={ink.soft} />
    {/* 狮子 */}
    <g transform="translate(132 206)">
      <circle cx={0} cy={0} r={26} fill={ink.accent} opacity={0.85} stroke={ink.line} strokeWidth={1.4} />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <path key={i} d={`M${Math.cos(a) * 22} ${Math.sin(a) * 22} q${Math.cos(a + 0.4) * 10} ${Math.sin(a + 0.4) * 10} ${Math.cos(a) * 34} ${Math.sin(a) * 34}`} {...S(ink, 1.3)} />;
      })}
      <circle cx={0} cy={2} r={15} fill={ink.dark} stroke={ink.line} strokeWidth={1.3} />
      <circle cx={-5} cy={-1} r={1.8} fill={ink.line} />
      <circle cx={5} cy={-1} r={1.8} fill={ink.line} />
      <path d="M-3 6 l3 3 l3 -3 M0 9 v3" {...S(ink, 1.1)} />
    </g>
    <path d="M60 200 q40 -30 70 -6" stroke="#c96f7c" strokeWidth={2} fill="none" strokeDasharray="2 4" />
    <Ground y={254} ink={ink} />
  </g>
);

const Hermit: Art = (ink) => (
  <g>
    <Star cx={40} cy={64} r={3} ink={ink} />
    <Star cx={160} cy={84} r={2.5} ink={ink} />
    <Star cx={130} cy={56} r={2} ink={ink} />
    <path d="M14 272 L60 200 L100 176 L140 200 L186 272 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    <path d="M86 186 l14 -10 l14 10" stroke="#e8eef8" strokeWidth={2} fill="none" />
    <Figure x={96} y={196} s={1.45} ink={ink} arms="raise-right" fill={ink.soft}>
      <line x1={-14} y1={-34} x2={-20} y2={0} {...S(ink, 1.8)} />
      <line x1={-12} y1={-36} x2={-14} y2={-74} {...S(ink, 1.8)} />
    </Figure>
    {/* 明灯 */}
    <g transform="translate(122 92)">
      <circle r={26} fill={ink.glow} opacity={0.5} />
      <line x1={0} y1={-16} x2={0} y2={-8} {...S(ink, 1.2)} />
      <path d="M-8 -8 h16 l-2 20 h-12 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
      <path d={starPath(0, 2, 6, 6, 0.55)} fill="#fff6d0" />
    </g>
  </g>
);

const Wheel: Art = (ink) => (
  <g>
    <g transform="translate(100 156)">
      <circle r={62} fill={ink.dark} stroke={ink.line} strokeWidth={2} />
      <circle r={52} {...S(ink, 1)} />
      <circle r={26} fill={ink.soft} stroke={ink.line} strokeWidth={1.2} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8} x2={Math.cos(a) * 52} y2={Math.sin(a) * 52} {...S(ink, 1.1)} />;
      })}
      {['T', 'A', 'R', 'O'].map((l, i) => {
        const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
        return (
          <text key={l} x={Math.cos(a) * 57} y={Math.sin(a) * 57 + 3.5} textAnchor="middle" fontSize={10} fontFamily="Cinzel, serif" fill={ink.line} fontWeight={700}>
            {l}
          </text>
        );
      })}
      <circle r={6} fill={ink.line} />
      {/* 炼金符号 */}
      <path d="M-4 -40 h8 M0 -44 v8 M36 -4 l6 8 l-12 0 Z M-4 36 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M-40 -4 l6 8 l-6 0" {...S(ink, 1)} />
    </g>
    {/* 斯芬克斯坐镇轮顶 */}
    <g transform="translate(100 90)">
      <path d="M-16 0 q0 -12 8 -14 l0 -10 q8 -6 16 0 l0 10 q8 2 8 14 Z" fill={ink.soft} stroke={ink.line} strokeWidth={1.2} />
      <SwordIcon x={14} y={-14} size={22} ink={ink} />
    </g>
    {/* 蛇 */}
    <path d="M30 120 q10 20 -2 40 q-10 18 4 40" stroke={ink.accent} strokeWidth={2.4} fill="none" />
    {/* 四角生灵（符号化） */}
    {[[30, 58, '♒'], [170, 58, '♏'], [30, 258, '♉'], [170, 258, '♌']].map(([x, y, g]) => (
      <g key={g as string}>
        <circle cx={x as number} cy={y as number} r={12} fill={ink.dark} stroke={ink.line} />
        <text x={x as number} y={(y as number) + 5} textAnchor="middle" fontSize={14} fill={ink.line}>{(g as string) + '\uFE0E'}</text>
      </g>
    ))}
  </g>
);

const Justice: Art = (ink) => (
  <g>
    <Pillar x={34} top={70} bottom={252} ink={ink} dark />
    <Pillar x={166} top={70} bottom={252} ink={ink} dark />
    <rect x={44} y={70} width={112} height={120} fill={ink.accent} opacity={0.25} />
    <Figure x={100} y={250} s={1.55} ink={ink} arms="hold" crown="round" fill={ink.dark} />
    <SwordIcon x={124} y={118} size={70} ink={ink} />
    {/* 天平 */}
    <g transform="translate(70 150)">
      <line x1={0} y1={-34} x2={0} y2={0} {...S(ink, 1.4)} />
      <line x1={-20} y1={-30} x2={20} y2={-30} {...S(ink, 1.6)} />
      <path d="M-20 -30 l-8 18 h16 Z M20 -30 l-8 18 h16 Z" fill={ink.soft} stroke={ink.line} strokeWidth={1} />
    </g>
  </g>
);

const HangedMan: Art = (ink) => (
  <g>
    {/* T 形生命之树 */}
    <path d="M100 252 L100 70 M46 70 L154 70" stroke={ink.line} strokeWidth={6} strokeLinecap="round" />
    {[52, 80, 122, 148].map((x) => <ellipse key={x} cx={x} cy={64} rx={5} ry={3} fill={ink.accent} />)}
    <line x1={100} y1={70} x2={100} y2={86} {...S(ink, 1.4)} />
    <g transform="translate(100 210) rotate(180)">
      <Figure x={0} y={0} s={1.3} ink={ink} arms="none" halo fill={ink.soft} />
    </g>
    {/* 交叉的腿形成 4 */}
    <path d="M100 136 L100 86 M100 112 L116 100 L116 86" stroke={ink.line} strokeWidth={2.4} fill="none" />
    <circle cx={100} cy={281 - 60} r={22} fill={ink.glow} opacity={0.4} />
  </g>
);

const Death: Art = (ink) => (
  <g>
    {/* 双塔与初升太阳 */}
    <Tower x={140} y={190} w={16} h={56} ink={ink} />
    <Tower x={176} y={190} w={14} h={50} ink={ink} />
    <path d="M144 190 a14 14 0 0 1 28 0 Z" fill={ink.line} />
    {Array.from({ length: 5 }).map((_, i) => (
      <line key={i} x1={158} y1={186} x2={158 + Math.cos(Math.PI + (i + 1) * 0.52) * 24} y2={186 + Math.sin(Math.PI + (i + 1) * 0.52) * 24} {...S(ink, 1)} />
    ))}
    <Waves y={200} ink={ink} count={2} x0={120} x1={184} />
    {/* 旗帜与白玫瑰 */}
    <line x1={56} y1={60} x2={56} y2={240} {...S(ink, 2)} />
    <path d="M56 64 L120 70 L112 96 L120 124 L56 118 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.4} />
    <Rose x={86} y={92} r={11} ink={ink} color="#f3eadb" />
    {/* 骷髅 */}
    <g transform="translate(92 196)">
      <path d="M-18 -10 a18 18 0 1 1 36 0 l-4 10 h-28 Z" fill="#e8e2d2" stroke={ink.line} strokeWidth={1.4} />
      <circle cx={-7} cy={-8} r={5} fill={ink.dark} />
      <circle cx={7} cy={-8} r={5} fill={ink.dark} />
      <path d="M0 -2 l-3 6 h6 Z" fill={ink.dark} />
      <path d="M-10 6 v6 M-4 6 v6 M2 6 v6 M8 6 v6" stroke={ink.dark} strokeWidth={1.5} />
      <path d="M-14 0 v12 h28 v-12" stroke={ink.line} strokeWidth={1.2} fill="none" />
    </g>
    <Ground y={252} ink={ink} />
  </g>
);

const Temperance: Art = (ink) => (
  <g>
    <Sun cx={160} cy={72} r={10} ink={ink} rays={12} />
    <path d="M150 90 q-20 50 -30 100" {...S(ink, 1)} strokeDasharray="3 4" />
    <Wings x={92} y={128} span={56} ink={ink} />
    <Figure x={92} y={230} s={1.5} ink={ink} arms="out" halo fill={ink.soft}>
      <path d={`M-6 -40 l6 -6 l6 6 Z`} fill={ink.accent} />
      <rect x={-5} y={-38} width={10} height={8} {...S(ink, 0.8)} />
    </Figure>
    <CupIcon x={52} y={162} size={20} ink={ink} rotate={-25} />
    <CupIcon x={132} y={182} size={20} ink={ink} rotate={10} />
    <path d="M60 156 q30 0 70 20" stroke={ink.accent} strokeWidth={2.4} fill="none" opacity={0.85} />
    <Waves y={246} ink={ink} count={2} x0={16} x1={110} />
    <Ground y={240} ink={ink} />
    <Rose x={160} y={234} r={5} ink={ink} color="#e9c46a" />
    <Rose x={172} y={226} r={4} ink={ink} color="#e9c46a" />
  </g>
);

const Devil: Art = (ink) => (
  <g>
    <path d={pentagram(16, 100, 66, true)} {...S(ink, 1.6)} />
    <circle cx={100} cy={66} r={19} {...S(ink, 1)} />
    {/* 蝙蝠翼 */}
    <path d="M100 120 L40 92 L48 108 L30 112 L46 124 L34 136 L100 136 Z M100 120 L160 92 L152 108 L170 112 L154 124 L166 136 L100 136 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    <g transform="translate(100 130)">
      <circle cx={0} cy={-8} r={14} fill={ink.dark} stroke={ink.line} strokeWidth={1.4} />
      <path d="M-10 -18 q-8 -12 -4 -22 M10 -18 q8 -12 4 -22" {...S(ink, 2)} />
      <circle cx={-5} cy={-10} r={2} fill={ink.accent} />
      <circle cx={5} cy={-10} r={2} fill={ink.accent} />
      <path d="M-12 6 q12 30 24 0" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    </g>
    {/* 方形基座 */}
    <rect x={76} y={170} width={48} height={30} fill={ink.dark} stroke={ink.line} strokeWidth={1.4} />
    <circle cx={88} cy={178} r={2.5} fill={ink.line} />
    <circle cx={112} cy={178} r={2.5} fill={ink.line} />
    {/* 锁链与两人 */}
    <path d="M88 180 Q70 210 62 222 M112 180 Q130 210 138 222" stroke={ink.line} strokeWidth={1.2} fill="none" strokeDasharray="3 2" />
    <Figure x={58} y={262} s={0.9} ink={ink} arms="down" fill={ink.soft}>
      <path d="M-3 -66 l-4 -8 M3 -66 l4 -8" {...S(ink, 1.4)} />
    </Figure>
    <Figure x={142} y={262} s={0.9} ink={ink} arms="down" fill={ink.soft}>
      <path d="M-3 -66 l-4 -8 M3 -66 l4 -8" {...S(ink, 1.4)} />
    </Figure>
    <Ground y={262} ink={ink} />
  </g>
);

const TowerArt: Art = (ink) => (
  <g>
    <Cloud x={50} y={70} w={70} ink={ink} />
    <Cloud x={160} y={84} w={50} ink={ink} />
    {/* 闪电 */}
    <path d="M150 50 L118 96 L132 98 L104 132" stroke="#fff3c4" strokeWidth={3} fill="none" strokeLinejoin="round" />
    {/* 山岩与高塔 */}
    <path d="M40 272 L64 230 L136 230 L160 272 Z" fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    <rect x={76} y={120} width={48} height={110} fill={ink.dark} stroke={ink.line} strokeWidth={1.6} />
    <rect x={92} y={150} width={16} height={22} fill="#ff9a4a" opacity={0.9} />
    <rect x={84} y={190} width={10} height={14} fill="#ff9a4a" opacity={0.9} />
    {/* 被掀飞的王冠 */}
    <path d="M118 118 L120 104 L127 112 L133 100 L138 112 L146 106 L144 120 Z" fill={ink.line} transform="rotate(25 132 112)" />
    {/* 火焰 */}
    {[[80, 150], [120, 170], [100, 128]].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y} q-8 -10 0 -22 q2 10 8 6 q4 10 -8 16`} fill="#ff7a3a" opacity={0.9} />
    ))}
    {/* 坠落者 */}
    <g transform="translate(52 186) rotate(-140)"><Figure x={0} y={0} s={0.7} ink={ink} arms="up" fill={ink.soft} /></g>
    <g transform="translate(152 176) rotate(150)"><Figure x={0} y={0} s={0.7} ink={ink} arms="up" crown="round" fill={ink.soft} /></g>
    {Array.from({ length: 12 }).map((_, i) => (
      <path key={i} d={starPath(28 + ((i * 37) % 150), 100 + ((i * 53) % 120), 2.5, 4, 0.3)} fill={ink.line} opacity={0.8} />
    ))}
  </g>
);

const StarArt: Art = (ink) => (
  <g>
    <path d={starPath(100, 82, 30, 8, 0.38)} fill={ink.line} />
    <circle cx={100} cy={82} r={44} fill={ink.glow} opacity={0.3} />
    {[[42, 60], [158, 60], [34, 110], [166, 110], [60, 136], [140, 136], [100, 132]].map(([x, y], i) => (
      <path key={i} d={starPath(x, y, 7, 8, 0.4)} fill={ink.line} opacity={0.9} />
    ))}
    <Tree x={160} y={208} h={56} ink={ink} />
    <path d="M154 166 q6 -6 12 0 l-4 6 Z" fill={ink.accent} />
    <Mountains y={206} ink={ink} peaks={[[24, 34], [70, 22]]} />
    {/* 池塘 */}
    <ellipse cx={130} cy={242} rx={52} ry={14} fill={ink.accent} opacity={0.35} stroke={ink.line} strokeWidth={1} />
    {/* 跪姿女子 */}
    <g transform="translate(86 250)">
      <circle cx={0} cy={-58} r={8} fill={ink.soft} stroke={ink.line} strokeWidth={1.3} />
      <path d="M-4 -50 Q-12 -30 -8 -16 L-28 0 L10 0 L6 -16 Q8 -32 4 -50 Z" fill={ink.soft} stroke={ink.line} strokeWidth={1.3} />
      <path d="M-4 -44 L-26 -30 M4 -44 L26 -32" {...S(ink, 1.3)} />
      <path d="M-30 -32 l-4 -6 h8 Z M28 -34 l4 -6 h-8 Z" fill={ink.line} />
      <path d="M-32 -30 q-6 14 -2 30" stroke={ink.accent} strokeWidth={1.8} fill="none" />
      <path d="M30 -32 q10 4 16 -6" stroke={ink.accent} strokeWidth={1.8} fill="none" transform="translate(0 30)" />
    </g>
  </g>
);

const MoonArt: Art = (ink) => (
  <g>
    <circle cx={100} cy={82} r={30} fill={ink.soft} stroke={ink.line} strokeWidth={1.6} />
    <Moon cx={106} cy={82} r={22} ink={ink} phase={0.45} rotate={0} />
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <line key={i} x1={100 + Math.cos(a) * 34} y1={82 + Math.sin(a) * 34} x2={100 + Math.cos(a) * (i % 2 ? 42 : 48)} y2={82 + Math.sin(a) * (i % 2 ? 42 : 48)} {...S(ink, 1)} />;
    })}
    {[[60, 126], [80, 140], [120, 132], [140, 120]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l-2 6 l4 0 Z`} fill={ink.line} />)}
    <Tower x={34} y={200} w={20} h={70} ink={ink} />
    <Tower x={166} y={200} w={20} h={70} ink={ink} />
    {/* 小径 */}
    <path d="M100 252 Q86 230 104 214 Q120 196 98 176 Q86 160 100 150" stroke={ink.line} strokeWidth={1.2} fill="none" strokeDasharray="4 3" />
    {/* 狗与狼 */}
    {[[64, '#e9e3d4'], [136, '#6e6a80']].map(([x, c]) => (
      <g key={x as number} transform={`translate(${x} 220) scale(${(x as number) < 100 ? 1 : -1} 1)`}>
        <path d="M-12 14 L-12 0 Q-12 -10 -2 -14 L4 -24 L6 -14 Q14 -12 12 -2 L4 0 L4 14 Z" fill={c as string} stroke={ink.line} strokeWidth={1.1} />
      </g>
    ))}
    {/* 池与龙虾 */}
    <path d="M30 272 Q30 250 70 252 L130 252 Q170 250 170 272 Z" fill={ink.accent} opacity={0.4} stroke={ink.line} strokeWidth={1} />
    <g transform="translate(100 262)">
      <ellipse rx={6} ry={9} fill="#c45a4a" stroke={ink.line} strokeWidth={0.8} />
      <path d="M-5 -6 q-8 -6 -6 -12 M5 -6 q8 -6 6 -12" stroke="#c45a4a" strokeWidth={2} fill="none" />
    </g>
  </g>
);

const SunArt: Art = (ink) => (
  <g>
    <Sun cx={100} cy={92} r={30} ink={ink} rays={22} face wavy />
    {/* 墙 */}
    <rect x={16} y={200} width={168} height={22} fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
    {[16, 40, 64, 88, 112, 136, 160].map((x) => <line key={x} x1={x} y1={200} x2={x} y2={222} {...S(ink, 0.6)} />)}
    {/* 向日葵 */}
    {[36, 70, 130, 164].map((x, i) => (
      <g key={x} transform={`translate(${x} ${186 + (i % 2) * 6})`}>
        <line x1={0} y1={6} x2={0} y2={16} {...S(ink, 1.2)} />
        {Array.from({ length: 10 }).map((_, k) => (
          <ellipse key={k} cx={0} cy={-8} rx={2.6} ry={6} transform={`rotate(${k * 36})`} fill="#f1c24a" />
        ))}
        <circle r={4.5} fill="#6b3f1d" />
      </g>
    ))}
    {/* 骑白马的孩童 */}
    <g transform="translate(100 262)">
      <path d="M-40 0 L-36 -18 Q-34 -32 -14 -32 L20 -32 Q30 -46 40 -38 Q44 -30 34 -26 L30 -14 L32 0 M-26 -18 L-28 0 M14 -18 L16 0" fill="#ece6d6" stroke={ink.line} strokeWidth={1.3} />
      <Figure x={0} y={-30} s={0.75} ink={ink} arms="up" fill={ink.soft} />
    </g>
  </g>
);

const Judgement: Art = (ink) => (
  <g>
    <Cloud x={100} y={110} w={150} ink={ink} />
    <Wings x={100} y={78} span={60} ink={ink} />
    <circle cx={100} cy={68} r={8} fill={ink.soft} stroke={ink.line} />
    {/* 号角与旗帜 */}
    <path d="M108 80 L150 120 L156 112 Z" fill={ink.line} />
    <rect x={128} y={96} width={22} height={16} fill="#f3eadb" stroke={ink.line} transform="rotate(42 128 96)" />
    <path d="M136 108 v8 M132 112 h8" stroke="#b5404b" strokeWidth={2} transform="rotate(42 136 112)" />
    {[[40, 50], [90, 60], [140, 42]].map(([x, h], i) => <line key={i} x1={x} y1={140} x2={x + 6} y2={140 - h * 0.4} {...S(ink, 0.8)} opacity={0.6} />)}
    <Mountains y={200} ink={ink} peaks={[[16, 50], [130, 56]]} />
    <Waves y={210} ink={ink} count={2} />
    {/* 棺木与复活者 */}
    {[50, 100, 150].map((x, i) => (
      <g key={x}>
        <rect x={x - 22} y={240} width={44} height={16} fill={ink.dark} stroke={ink.line} strokeWidth={1.2} />
        <Figure x={x} y={246} s={i === 1 ? 0.75 : 0.85} ink={ink} arms="open" fill="#c9c3b6" />
      </g>
    ))}
  </g>
);

const World: Art = (ink) => (
  <g>
    {/* 月桂花环 */}
    <ellipse cx={100} cy={160} rx={52} ry={84} fill="none" stroke="#7aa35a" strokeWidth={6} />
    {Array.from({ length: 28 }).map((_, i) => {
      const a = (i / 28) * Math.PI * 2;
      const x = 100 + Math.cos(a) * 52, y = 160 + Math.sin(a) * 84;
      return <ellipse key={i} cx={x} cy={y} rx={3} ry={6} fill="#9cc072" transform={`rotate(${(a * 180) / Math.PI + 30} ${x} ${y})`} />;
    })}
    <path d="M96 76 q-6 -8 4 -8 q10 0 4 8 M96 244 q-6 8 4 8 q10 0 4 -8" stroke="#c4404b" strokeWidth={2.4} fill="none" />
    {/* 舞者 */}
    <g transform="translate(100 214)">
      <circle cx={0} cy={-90} r={8} fill={ink.soft} stroke={ink.line} strokeWidth={1.3} />
      <path d="M-4 -82 Q-8 -50 -4 -30 L-14 0 M4 -82 Q10 -50 4 -30 L10 -14 L-2 -10" fill="none" stroke={ink.line} strokeWidth={1.6} />
      <path d="M-14 -76 Q20 -60 -8 -40 Q-22 -26 12 -24" fill="none" stroke="#8a5bb5" strokeWidth={6} opacity={0.7} />
      <path d="M-4 -76 L-24 -64 M4 -76 L24 -86" {...S(ink, 1.4)} />
      <WandIcon x={-26} y={-64} size={18} ink={ink} />
      <WandIcon x={26} y={-86} size={18} ink={ink} />
    </g>
    {/* 四生灵 */}
    {[[32, 60, '♒'], [168, 60, '♏'], [32, 256, '♉'], [168, 256, '♌']].map(([x, y, g]) => (
      <g key={g as string}>
        <circle cx={x as number} cy={y as number} r={13} fill={ink.dark} stroke={ink.line} />
        <text x={x as number} y={(y as number) + 5} textAnchor="middle" fontSize={14} fill={ink.line}>{(g as string) + '\uFE0E'}</text>
      </g>
    ))}
  </g>
);

export const MAJOR_ART: Art[] = [
  Fool, Magician, HighPriestess, Empress, Emperor, Hierophant, Lovers, Chariot, Strength, Hermit, Wheel,
  Justice, HangedMan, Death, Temperance, Devil, TowerArt, StarArt, MoonArt, SunArt, Judgement, World,
];

/** 大阿尔卡那背景的星点 */
export const majorBackdrop = (ink: Ink, seed: number) =>
  Array.from({ length: 14 }).map((_, i) => {
    const x = 20 + ((seed * 31 + i * 47) % 160);
    const y = 44 + ((seed * 17 + i * 71) % 220);
    return <Sparkle key={i} cx={x} cy={y} r={1.4 + (i % 3) * 0.6} color={ink.line} />;
  });

export { CupIcon, PentacleIcon, SwordIcon, WandIcon };
