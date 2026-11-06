import { motion } from 'framer-motion';
import { ChevronRight, MoonStar } from 'lucide-react';
import { MagicCircle } from '../components/background/MagicCircle';
import { CardBack } from '../components/cards/CardBack';
import { CardFace } from '../components/cards/CardFace';
import { FadeIn } from '../components/ui/Section';
import { TopicIcon } from '../components/ui/TopicIcon';
import { getCard } from '../data/deck';
import { SPREAD_LIST, TOPIC_LIST } from '../data/spreads';
import { Link, navigate } from '../lib/router';
import { useApp } from '../store/AppStore';

const FLOAT = [
  { x: '-36vw', y: '-6vh', r: -18, d: 0 },
  { x: '34vw', y: '-12vh', r: 14, d: 1.2 },
  { x: '-30vw', y: '22vh', r: 8, d: 0.6 },
  { x: '31vw', y: '20vh', r: -10, d: 1.8 },
];

export function Home() {
  const { todayDaily } = useApp();
  const daily = todayDaily();
  const dailyCard = daily ? getCard(daily.cards[0].cardId) : null;

  return (
    <div className="relative z-10">
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-10 text-center md:pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(118vw,760px)] -translate-x-1/2 -translate-y-1/2"
        >
          <MagicCircle />
        </motion.div>

        {/* 漂浮的牌背 */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex" aria-hidden="true">
          {FLOAT.map((f, i) => (
            <motion.div
              key={i}
              className="absolute w-24 opacity-60 xl:w-28"
              initial={{ opacity: 0, x: f.x, y: f.y, rotate: f.r }}
              animate={{ opacity: 0.55, y: [`calc(${f.y} - 10px)`, `calc(${f.y} + 10px)`], rotate: [f.r - 2, f.r + 2] }}
              transition={{ opacity: { duration: 2, delay: 0.6 + f.d * 0.3 }, y: { duration: 6 + i, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: f.d }, rotate: { duration: 7 + i, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }}
            >
              <div className="card-thickness aspect-[200/340] overflow-hidden rounded-[7%/4.2%]">
                <CardBack className="h-full w-full" />
              </div>
            </motion.div>
          ))}
        </div>

        <FadeIn delay={0.2} className="font-display text-[11px] tracking-[0.7em] text-gold-deep sm:text-xs">
          ✦ THE TAROT OF SHADOWS ✦
        </FadeIn>
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.9em', filter: 'blur(12px)' }}
          animate={{ opacity: 1, letterSpacing: '0.32em', filter: 'blur(0px)' }}
          transition={{ duration: 2.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="shimmer-text mt-4 pl-[0.32em] font-display text-6xl font-semibold drop-shadow-[0_0_30px_var(--glow)] sm:text-8xl md:text-9xl"
        >
          ARCANA
        </motion.h1>
        <FadeIn delay={0.9} className="mt-3 font-cn text-base tracking-[0.6em] text-gold sm:text-lg">
          塔 罗 秘 仪
        </FadeIn>
        <FadeIn delay={1.3} className="mx-auto mt-8 max-w-md px-2 font-serif text-lg italic leading-relaxed text-ink-dim sm:text-xl">
          「星辰不会替你做决定，
          <br />
          但它们会为你照亮那条你早已知道的路。」
        </FadeIn>
        <FadeIn delay={1.7} className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button className="btn-arcane text-base sm:text-lg" onClick={() => navigate('/select')}>
            <MoonStar size={18} /> 开始占卜
          </button>
          <Link to="/daily" className="btn-ghost text-sm">
            {dailyCard ? `今日之牌 · ${dailyCard.name}` : '抽取今日之牌'} <ChevronRight size={16} />
          </Link>
        </FadeIn>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.3] }}
          transition={{ delay: 2.6, duration: 3, repeat: Infinity, repeatType: 'mirror' }}
          className="absolute bottom-24 font-display text-[10px] tracking-[0.5em] text-gold-deep md:bottom-8"
        >
          SCROLL ✦ 选择你的问题
        </motion.div>
      </section>

      {/* ---------- 主题入口 ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <div className="font-display text-xs tracking-[0.5em] text-gold-deep">CHOOSE YOUR QUESTION</div>
          <h2 className="mt-2 text-2xl tracking-[0.3em] text-gold-gradient sm:text-3xl">你想问什么</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {TOPIC_LIST.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/select?topic=${t.id}`)}
              className={`panel group relative overflow-hidden p-5 text-left transition-shadow hover:shadow-[0_0_30px_var(--glow)] ${i === 0 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)] opacity-30 transition-opacity group-hover:opacity-70" />
              <TopicIcon topic={t.id} size={26} className="text-gold" />
              <div className="mt-4 text-lg tracking-[0.2em] text-ink">{t.name}</div>
              <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">{t.nameEn.toUpperCase()}</div>
              <div className="mt-2 text-xs leading-relaxed text-ink-dim">{t.tagline}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ---------- 牌阵 ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 md:pb-20">
        <div className="mb-8 text-center">
          <div className="font-display text-xs tracking-[0.5em] text-gold-deep">FOUR SPREADS</div>
          <h2 className="mt-2 text-2xl tracking-[0.3em] text-gold-gradient sm:text-3xl">四种经典牌阵</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPREAD_LIST.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/select?spread=${s.id}`)}
              className="panel group p-5 text-left transition hover:border-[var(--gold)]"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg tracking-[0.2em]">{s.name}</span>
                <span className="font-display text-xs text-gold">{s.positions.length} 张</span>
              </div>
              <div className="font-display text-[10px] tracking-[0.25em] text-gold-deep">{s.nameEn.toUpperCase()}</div>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">{s.description}</p>
              <p className="mt-3 text-xs text-gold/80">{s.suitableFor}</p>
            </motion.button>
          ))}
        </div>

        {dailyCard && daily && (
          <FadeIn className="panel mx-auto mt-10 flex max-w-xl items-center gap-5 p-4">
            <button onClick={() => navigate(`/result/${daily.id}`)} className="w-16 shrink-0" aria-label="查看今日之牌">
              <div className="card-thickness overflow-hidden rounded-[7%/4.2%]" style={{ transform: daily.cards[0].reversed ? 'rotate(180deg)' : undefined }}>
                <CardFace card={dailyCard} showName={false} className="block w-full" />
              </div>
            </button>
            <div className="text-left">
              <div className="text-xs tracking-widest text-gold-deep">今日之牌</div>
              <div className="mt-1 text-lg tracking-widest">{dailyCard.name} · {daily.cards[0].reversed ? '逆位' : '正位'}</div>
              <div className="mt-1 text-xs text-ink-dim">{(daily.cards[0].reversed ? dailyCard.keywords.reversed : dailyCard.keywords.upright).join(' · ')}</div>
            </div>
          </FadeIn>
        )}

        <p className="mt-14 text-center text-xs leading-relaxed text-ink-faint">
          塔罗是一面映照内心的镜子，而非不可更改的预言。
          <br />
          所有数据仅保存在你的浏览器本地。
        </p>
      </section>
    </div>
  );
}
