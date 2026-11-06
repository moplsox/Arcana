import { motion } from 'framer-motion';
import { ArrowRight, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { CardBack } from '../components/cards/CardBack';
import { CardFace } from '../components/cards/CardFace';
import { FadeIn, Page, PageTitle } from '../components/ui/Section';
import { getCard } from '../data/deck';
import { interpret } from '../engine/interpret';
import { navigate } from '../lib/router';
import { useApp } from '../store/AppStore';
import { todayKey } from '../store/storage';

export function Daily() {
  const { state, todayDaily } = useApp();
  const today = todayDaily();
  const it = useMemo(() => (today ? interpret(today) : null), [today]);

  // 最近 7 天的每日牌（含今天）
  const recent = state.daily
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 7)
    .map((d) => ({ date: d.date, reading: state.history.find((r) => r.id === d.readingId) }))
    .filter((x) => x.reading);

  // 连续天数：今天未抽时从昨天开始往回数
  const dates = new Set(state.daily.map((d) => d.date));
  const cursor = new Date();
  if (!dates.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <Page className="max-w-3xl">
      <PageTitle en="CARD OF THE DAY" title="每日之牌" sub={`${dateStr} · 每天只能抽取一张，它会陪伴你度过这一天。`} />

      {today && it ? (
        <FadeIn className="panel flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
          <motion.button
            onClick={() => navigate(`/result/${today.id}`)}
            className="w-40 shrink-0 sm:w-48"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.9 }}
            aria-label="查看今日完整解读"
          >
            <div className="card-thickness overflow-hidden rounded-[7%/4.2%]" style={{ transform: today.cards[0].reversed ? 'rotate(180deg)' : undefined }}>
              <CardFace card={it.insights[0].card} className="block w-full" />
            </div>
          </motion.button>
          <div className="min-w-0 text-center sm:text-left">
            <div className="text-xs tracking-[0.3em] text-gold-deep">今日之牌</div>
            <h2 className="mt-1 text-3xl tracking-[0.2em] text-gold-gradient">
              {it.insights[0].card.name}
              <span className="ml-2 text-base text-ink-dim">{today.cards[0].reversed ? '逆位' : '正位'}</span>
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {it.insights[0].keywords.map((k) => <span key={k} className="chip">{k}</span>)}
            </div>
            <p className="mt-4 text-[15px] leading-8 text-ink">{it.insights[0].reading}</p>
            {it.daily && (
              <p className="mt-3 text-sm text-ink-dim">
                幸运色 <span className="text-gold">{it.daily.color}</span> · 幸运数字 <span className="text-gold">{it.daily.number}</span> · 今日箴言 <span className="text-gold">「{it.daily.mantra}」</span>
              </p>
            )}
            <button className="btn-ghost mt-5 text-sm" onClick={() => navigate(`/result/${today.id}`)}>
              查看完整解读 <ArrowRight size={15} />
            </button>
          </div>
        </FadeIn>
      ) : (
        <FadeIn className="flex flex-col items-center">
          <motion.button
            onClick={() => navigate('/reading?topic=daily&spread=single')}
            className="w-44 sm:w-52"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.04 }}
            aria-label="抽取今日之牌"
          >
            <div className="card-thickness overflow-hidden rounded-[7%/4.2%] shadow-[0_0_60px_var(--glow)]">
              <CardBack className="block w-full" />
            </div>
          </motion.button>
          <p className="mt-8 max-w-sm text-center text-sm leading-7 text-ink-dim">深呼吸三次，想一想今天你最需要什么样的指引。</p>
          <button className="btn-arcane mt-6" onClick={() => navigate('/reading?topic=daily&spread=single')}>
            <Sun size={18} /> 抽取今日之牌
          </button>
        </FadeIn>
      )}

      <div className="mt-10 text-center text-sm text-ink-dim">
        已连续抽牌 <span className="font-display text-xl text-gold">{streak}</span> 天
      </div>

      {recent.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-center text-sm tracking-[0.3em] text-gold">最近的每日之牌</h3>
          <div className="flex justify-center gap-3 overflow-x-auto pb-2">
            {recent.map(({ date, reading }) => {
              const card = getCard(reading!.cards[0].cardId);
              return (
                <button key={date} onClick={() => navigate(`/result/${reading!.id}`)} className="w-16 shrink-0 text-center sm:w-20">
                  <div className="hover-glow overflow-hidden rounded-[7%/4.2%]" style={{ transform: reading!.cards[0].reversed ? 'rotate(180deg)' : undefined }}>
                    <CardFace card={card} showName={false} className="block w-full" />
                  </div>
                  <div className="mt-1.5 text-[11px] text-ink-dim">{date.slice(5).replace('-', '/')}</div>
                  <div className="truncate text-[11px] text-ink">{card.name}</div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </Page>
  );
}
