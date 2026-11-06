import { motion } from 'framer-motion';
import { MoonStar } from 'lucide-react';
import { useState } from 'react';
import { SpreadDiagram } from '../components/reading/SpreadDiagram';
import { Page, PageTitle } from '../components/ui/Section';
import { TopicIcon } from '../components/ui/TopicIcon';
import { SPREADS, SPREAD_LIST, TOPICS, TOPIC_LIST } from '../data/spreads';
import { navigate } from '../lib/router';
import type { SpreadId, TopicId } from '../types/tarot';

const PLACEHOLDER: Record<TopicId, string> = {
  general: '例如：接下来三个月，我的整体运势如何？',
  love: '例如：我和 TA 的关系会如何发展？',
  career: '例如：我应该接受这份新工作吗？',
  study: '例如：这次考试我该如何准备？',
  wealth: '例如：近期适合做投资吗？',
  daily: '',
};

export function Select({ query }: { query: URLSearchParams }) {
  const qTopic = query.get('topic') as TopicId | null;
  const qSpread = query.get('spread') as SpreadId | null;
  const [topic, setTopic] = useState<TopicId>(qTopic && TOPICS[qTopic] && qTopic !== 'daily' ? qTopic : 'general');
  const [spread, setSpread] = useState<SpreadId>(qSpread && SPREADS[qSpread] ? qSpread : TOPICS[topic].spreads[0]);
  const [question, setQuestion] = useState('');

  const pickTopic = (t: TopicId) => {
    setTopic(t);
    if (!qSpread) setSpread(TOPICS[t].spreads[0]);
  };

  const start = () => {
    const params = new URLSearchParams({ topic, spread });
    if (question.trim()) params.set('q', question.trim().slice(0, 120));
    navigate(`/reading?${params.toString()}`);
  };

  return (
    <Page className="max-w-4xl">
      <PageTitle en="PREPARE THE RITUAL" title="准备仪式" sub="选择你关心的领域与牌阵。在心中默念你的问题——越具体，牌越清晰。" />

      <section className="mb-8">
        <h2 className="mb-3 text-sm tracking-[0.3em] text-gold">一 · 占卜主题</h2>
        <div className="flex flex-wrap gap-2">
          {TOPIC_LIST.map((t) => (
            <button key={t.id} className="btn-ghost text-sm" aria-pressed={topic === t.id} onClick={() => pickTopic(t.id)}>
              <TopicIcon topic={t.id} size={16} /> {t.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm tracking-[0.3em] text-gold">二 · 选择牌阵</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SPREAD_LIST.map((s) => {
            const active = s.id === spread;
            const recommended = TOPICS[topic].spreads[0] === s.id;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSpread(s.id)}
                aria-pressed={active}
                className={`panel relative flex items-center gap-4 p-4 text-left transition ${active ? 'border-[var(--gold)]! shadow-[0_0_28px_var(--glow)]' : 'hover:border-[var(--gold)]/60'}`}
              >
                <SpreadDiagram spread={s} active={active} className="h-20 w-20 shrink-0" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base tracking-[0.15em]">{s.name}</span>
                    <span className="font-display text-xs text-gold">{s.positions.length} 张</span>
                    {recommended && <span className="chip border-[var(--gold)]/50! text-gold!">推荐</span>}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-dim">{s.description}</p>
                  <p className="mt-1 text-[11px] text-gold/70">{s.positions.map((p) => p.label.replace(/^\d+ · /, '')).join(' · ')}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm tracking-[0.3em] text-gold">三 · 你的问题（可选）</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={120}
          rows={2}
          placeholder={PLACEHOLDER[topic]}
          className="panel w-full resize-none bg-transparent px-4 py-3 text-base text-ink outline-none placeholder:text-ink-faint focus:border-[var(--gold)]"
        />
        <div className="mt-1 text-right text-xs text-ink-faint">{question.length}/120</div>
      </section>

      <div className="flex justify-center">
        <button className="btn-arcane text-lg" onClick={start}>
          <MoonStar size={18} /> 进入占卜
        </button>
      </div>
    </Page>
  );
}
