import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronDown, Copy, Home, RefreshCw, Share2, Star, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { CardDetail } from '../components/cards/CardDetail';
import { CardFace } from '../components/cards/CardFace';
import { SpreadView } from '../components/result/SpreadView';
import { FadeIn, Page } from '../components/ui/Section';
import { ELEMENT_NAMES } from '../data/deck';
import { SPREADS, TOPICS } from '../data/spreads';
import { ClaudeProvider, describeAIError } from '../engine/ai';
import { interpret, interpretationToText } from '../engine/interpret';
import { Link, navigate } from '../lib/router';
import { copyText, useToast } from '../lib/toast';
import { useApp } from '../store/AppStore';
import type { Element } from '../types/tarot';

const ELEMENT_COLOR: Record<Element, string> = { fire: '#ef8d4c', water: '#62b8d6', air: '#cdd6ec', earth: '#b8c25e' };
const MOOD_STYLE = { good: 'text-[#a8d8a0]', caution: 'text-[#e8a07a]', neutral: 'text-gold' };
const MOOD_LABEL = { good: '顺', caution: '慎', neutral: '平' };

function Block({ title, en, children, delay = 0 }: { title: string; en: string; children: ReactNode; delay?: number }) {
  return (
    <FadeIn delay={delay} className="panel mt-6 p-5 sm:p-7">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg tracking-[0.3em] text-gold-gradient sm:text-xl">{title}</h2>
        <span className="font-display text-[10px] tracking-[0.3em] text-gold-deep">{en}</span>
      </div>
      {children}
    </FadeIn>
  );
}

/** 把 **加粗** 渲染为 <strong> */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').filter(Boolean).map((para, i) => (
        <p key={i} className="mb-3 text-[15px] leading-8 text-ink">
          {para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => (seg.startsWith('**') ? <strong key={j} className="text-gold-bright">{seg.slice(2, -2)}</strong> : seg))}
        </p>
      ))}
    </>
  );
}

export function Result({ id }: { id: string }) {
  const { getReading, updateReading, deleteReading, state } = useApp();
  const toast = useToast();
  const reading = getReading(id);
  const it = useMemo(() => (reading ? interpret(reading) : null), [reading]);
  const [detail, setDetail] = useState<number | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [aiText, setAiText] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  if (!reading || !it) {
    return (
      <Page className="text-center">
        <p className="mt-20 text-ink-dim">找不到这次占卜记录，它可能已被删除。</p>
        <Link to="/history" className="btn-ghost mt-6">查看历史记录</Link>
      </Page>
    );
  }

  const spread = SPREADS[reading.spread];
  const topic = TOPICS[reading.topic];
  const date = new Date(reading.createdAt);
  const aiConfigured = state.settings.ai.enabled && state.settings.ai.apiKey.trim().length > 0;
  const shownAi = aiText || reading.aiInterpretation || '';

  const copy = async () => {
    const ok = await copyText(interpretationToText(reading, it));
    toast(ok ? '解读已复制到剪贴板' : '复制失败，请手动选择文本');
  };
  const share = async () => {
    const text = interpretationToText(reading, it);
    if (navigator.share) {
      try {
        await navigator.share({ title: `ARCANA · ${it.title}`, text });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    const ok = await copyText(text);
    toast(ok ? '当前环境不支持系统分享，已复制全文' : '分享失败');
  };
  const redo = () => {
    const p = new URLSearchParams({ topic: reading.topic, spread: reading.spread, r: String(Date.now()) });
    if (reading.question) p.set('q', reading.question);
    if (reading.topic === 'daily') {
      navigate('/select');
      return;
    }
    navigate(`/reading?${p}`);
  };
  const runAI = async () => {
    setAiBusy(true);
    setAiError('');
    setAiText('');
    abortRef.current = new AbortController();
    try {
      const provider = new ClaudeProvider(state.settings.ai.apiKey.trim(), state.settings.ai.model);
      const text = await provider.interpret(reading, it, { onText: setAiText, signal: abortRef.current.signal });
      setAiText(text);
      updateReading(reading.id, { aiInterpretation: text });
    } catch (e) {
      setAiError(await describeAIError(e));
    } finally {
      setAiBusy(false);
    }
  };

  const detailIns = detail != null ? it.insights[detail] : null;
  const maxEl = Math.max(1, ...Object.values(it.stats.elementCounts));

  return (
    <Page className="max-w-4xl">
      {/* 标题 */}
      <FadeIn className="text-center">
        <div className="font-display text-xs tracking-[0.5em] text-gold-deep">THE READING</div>
        <h1 className="mt-2 text-4xl tracking-[0.3em] text-gold-gradient sm:text-5xl">{it.title}</h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-dim">
          <span className="chip">{topic.name}</span>
          <span className="chip">{spread.name}</span>
          <span className="chip">{date.toLocaleString('zh-CN', { hour12: false, month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <span className="chip border-[var(--gold)]! text-gold!">{it.trendLabel}</span>
        </div>
        {reading.question && <p className="mx-auto mt-4 max-w-lg font-cn text-lg tracking-wider text-ink">「{reading.question}」</p>}
      </FadeIn>

      {/* 牌阵 */}
      <FadeIn delay={0.15} className="mt-6">
        <SpreadView reading={reading} onSelect={setDetail} />
        <p className="mt-2 text-center text-xs text-ink-faint">轻触任意一张牌查看完整牌义</p>
      </FadeIn>

      {/* 综合结论 */}
      <Block title="综合结论" en="SYNTHESIS" delay={0.3}>
        {it.conclusion.map((p, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className={`mb-3 leading-8 ${i === 0 ? 'text-base text-gold-bright' : 'text-[15px] text-ink'}`}>
            {p}
          </motion.p>
        ))}
      </Block>

      {/* 逐张解读 */}
      <Block title="逐张解读" en="CARD BY CARD" delay={0.4}>
        <div className="space-y-3">
          {it.insights.map((ins, k) => {
            const expanded = open.has(k);
            return (
              <motion.div key={k} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.05 }} className="rounded-2xl border border-[var(--panel-border)] bg-white/[0.02] p-4">
                <div className="flex gap-4">
                  <button onClick={() => setDetail(k)} className="w-14 shrink-0 sm:w-16" aria-label={`查看${ins.card.name}`}>
                    <div className="card-thickness overflow-hidden rounded-[7%/4.2%]" style={{ transform: ins.reversed ? 'rotate(180deg)' : undefined }}>
                      <CardFace card={ins.card} showName={false} className="block w-full" />
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs tracking-[0.2em] text-gold-deep">{ins.position.label} · {ins.position.meaning}</div>
                    <div className="mt-0.5 text-lg tracking-widest">
                      {ins.card.name}
                      <span className={`ml-2 text-sm ${ins.reversed ? 'text-[#e08a8a]' : 'text-[#a8d8a0]'}`}>{ins.reversed ? '逆位' : '正位'}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ins.keywords.map((k2) => <span key={k2} className="chip text-[11px]!">{k2}</span>)}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[15px] leading-8 text-ink">{ins.reading}</p>
                <button className="mt-1 flex items-center gap-1 text-xs text-gold/80 hover:text-gold" onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })} aria-expanded={expanded}>
                  {expanded ? '收起' : '展开'}完整牌义 <ChevronDown size={14} className={`transition ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="mt-2 text-sm leading-7 text-ink-dim">{ins.meaning}</p>
                      <p className="mt-2 text-sm leading-7 text-ink-faint">{ins.card.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Block>

      {/* 牌间关系 */}
      <Block title="牌间关联" en="CONNECTIONS" delay={0.5}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...it.connections, ...it.combos].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border p-4 ${i >= it.connections.length ? 'border-[var(--gold)]/60 bg-[color-mix(in_srgb,var(--gold)_7%,transparent)]' : 'border-[var(--panel-border)] bg-white/[0.02]'}`}>
              <div className="text-sm tracking-[0.2em] text-gold">{i >= it.connections.length ? '✦ ' : ''}{c.title}</div>
              <p className="mt-1.5 text-sm leading-7 text-ink">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </Block>

      {/* 能量分析 */}
      <Block title="能量图谱" en="ENERGY" delay={0.55}>
        <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
          <div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-[var(--panel-border)] p-2"><div className="font-display text-2xl text-gold">{it.stats.majorCount}</div><div className="text-[11px] text-ink-dim">大阿尔卡那</div></div>
              <div className="rounded-xl border border-[var(--panel-border)] p-2"><div className="font-display text-2xl text-gold">{it.stats.reversedCount}</div><div className="text-[11px] text-ink-dim">逆位</div></div>
              <div className="rounded-xl border border-[var(--panel-border)] p-2"><div className="font-display text-2xl text-gold">{it.score > 0 ? '+' : ''}{it.score}</div><div className="text-[11px] text-ink-dim">能量指数</div></div>
            </div>
            <div className="space-y-2">
              {(Object.keys(it.stats.elementCounts) as Element[]).map((e) => (
                <div key={e} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-ink-dim">{ELEMENT_NAMES[e]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div className="h-full rounded-full" style={{ background: ELEMENT_COLOR[e] }} initial={{ width: 0 }} whileInView={{ width: `${(it.stats.elementCounts[e] / maxEl) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} />
                  </div>
                  <span className="w-4 text-right text-ink">{it.stats.elementCounts[e]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {it.energy.map((e, i) => <p key={i} className="text-sm leading-7 text-ink">{e}</p>)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs tracking-[0.2em] text-gold-deep">灵数牌</div>
            <button className="mx-auto mt-2 block w-28" onClick={() => setDetail(-1)} aria-label={`查看灵数牌${it.quintessence.card.name}`}>
              <div className="card-thickness overflow-hidden rounded-[7%/4.2%]"><CardFace card={it.quintessence.card} className="block w-full" /></div>
            </button>
            <p className="mt-3 text-left text-xs leading-6 text-ink-dim">{it.quintessence.text}</p>
          </div>
        </div>
      </Block>

      {/* 分领域建议 */}
      <Block title="生活指引" en="GUIDANCE" delay={0.6}>
        <div className="grid gap-3 sm:grid-cols-2">
          {it.domains.map((d) => (
            <div key={d.domain} className={`rounded-2xl border p-4 ${d.focus ? 'border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] sm:col-span-2' : 'border-[var(--panel-border)] bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between">
                <span className="tracking-[0.3em] text-gold">{d.name}{d.focus && <span className="ml-2 text-[10px] tracking-widest text-gold-deep">本次主题</span>}</span>
                <span className={`font-cn text-sm ${MOOD_STYLE[d.mood]}`}>{MOOD_LABEL[d.mood]}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink">{d.text}</p>
            </div>
          ))}
        </div>
        {it.daily && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-[var(--panel-border)] p-3"><div className="text-[11px] text-ink-dim">今日幸运色</div><div className="mt-1 text-sm text-gold">{it.daily.color}</div></div>
            <div className="rounded-xl border border-[var(--panel-border)] p-3"><div className="text-[11px] text-ink-dim">幸运数字</div><div className="mt-1 font-display text-lg text-gold">{it.daily.number}</div></div>
            <div className="rounded-xl border border-[var(--panel-border)] p-3"><div className="text-[11px] text-ink-dim">今日箴言</div><div className="mt-1 text-sm text-gold">{it.daily.mantra}</div></div>
          </div>
        )}
        <p className="mt-5 border-t border-[var(--panel-border)] pt-4 text-center font-cn text-lg tracking-wider text-gold-bright">「{it.finalAdvice}」</p>
      </Block>

      {/* AI 深度解读 */}
      <Block title="AI 深度解读" en="CLAUDE" delay={0.65}>
        {shownAi ? (
          <div>
            <RichText text={shownAi} />
            {aiBusy && <span className="inline-block h-4 w-2 animate-pulse bg-gold align-middle" />}
          </div>
        ) : null}
        {aiError && <p className="mb-3 text-sm text-[#e8a07a]">{aiError}</p>}
        {aiConfigured ? (
          <div className="flex flex-wrap gap-2">
            {aiBusy ? (
              <button className="btn-ghost text-sm" onClick={() => abortRef.current?.abort()}>停止生成</button>
            ) : (
              <button className="btn-ghost text-sm" onClick={runAI}>
                <Bot size={16} /> {shownAi ? '重新生成 AI 解读' : '请 Claude 深度解读'}
              </button>
            )}
            <span className="self-center text-xs text-ink-faint">模型：{state.settings.ai.model} · 费用由你的 API Key 承担</span>
          </div>
        ) : (
          <p className="text-sm leading-7 text-ink-dim">
            以上解读全部由本地引擎生成，无需联网。若想获得更自由的 AI 叙事解读，可以在
            <Link to="/settings" className="mx-1 text-gold underline underline-offset-4">设置</Link>
            中启用 Claude API 并填入你自己的 API Key（AI 解读接口已实现，默认关闭）。
          </p>
        )}
      </Block>

      {/* 操作 */}
      <FadeIn delay={0.7} className="mt-8 flex flex-wrap justify-center gap-2">
        <button className="btn-ghost text-sm" onClick={copy}><Copy size={15} /> 复制结果</button>
        <button className="btn-ghost text-sm" onClick={share}><Share2 size={15} /> 分享</button>
        <button className="btn-ghost text-sm" aria-pressed={!!reading.starred} onClick={() => { updateReading(reading.id, { starred: !reading.starred }); toast(reading.starred ? '已取消星标' : '已加入星标占卜'); }}>
          <Star size={15} fill={reading.starred ? 'currentColor' : 'none'} /> {reading.starred ? '已星标' : '星标'}
        </button>
        <button className="btn-ghost text-sm" onClick={redo}><RefreshCw size={15} /> 重新占卜</button>
        <button className="btn-ghost text-sm" onClick={() => navigate('/')}><Home size={15} /> 首页</button>
        <button
          className="btn-ghost text-sm text-[#e8a07a]!"
          onClick={() => {
            if (window.confirm('确定删除这次占卜记录吗？')) {
              deleteReading(reading.id);
              toast('已删除');
              navigate('/history', { replace: true });
            }
          }}
        >
          <Trash2 size={15} /> 删除
        </button>
      </FadeIn>
      <p className="mt-8 text-center text-xs text-ink-faint">塔罗呈现的是可能性与内在状态，而非确定的未来。</p>

      <CardDetail
        card={detail === -1 ? it.quintessence.card : detailIns?.card ?? null}
        initialReversed={detail != null && detail >= 0 ? !!detailIns?.reversed : false}
        onClose={() => setDetail(null)}
      />
    </Page>
  );
}
