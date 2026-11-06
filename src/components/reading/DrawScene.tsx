import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { ArrowRight, Eye, Shuffle, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { getCard } from '../../data/deck';
import { SPREADS, TOPICS } from '../../data/spreads';
import { applyCut, cutPiles, drawByIndices, freshDeck, shuffleDeck, type DeckState } from '../../engine/deckEngine';
import { cryptoRandom, uid } from '../../engine/random';
import { navigate } from '../../lib/router';
import { useApp, useMotionEnabled } from '../../store/AppStore';
import type { Reading, SpreadId, TopicId } from '../../types/tarot';
import { FlipCard } from '../cards/TarotCard';
import { DeckStack } from './DeckStack';
import { FanCard, fanCardPose } from './FanCard';
import { CARD_RATIO, fanGeometry, headerHeight, isCompact, slotGeometry } from './layout';

type Phase = 'intro' | 'shuffling' | 'cut' | 'cutting' | 'spreading' | 'picking' | 'gathering' | 'reveal' | 'done';

interface Picked {
  deckIndex: number;
  from: { x: number; y: number; rotate: number };
}

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

const TOTAL = 78;

export function DrawScene({ topic, spreadId, question }: { topic: TopicId; spreadId: SpreadId; question?: string }) {
  const spread = SPREADS[spreadId];
  const need = spread.positions.length;
  const { state, addReading } = useApp();
  const motionOn = useMotionEnabled();
  const fast = !motionOn;
  const { w, h } = useViewport();
  const compact = isCompact(w);

  const [phase, setPhase] = useState<Phase>('intro');
  const [deck, setDeck] = useState<DeckState>(() => freshDeck());
  const [shuffleKey, setShuffleKey] = useState(0);
  const [bounds, setBounds] = useState<number[]>([]);
  const [chosenPile, setChosenPile] = useState<number | null>(null);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(need).fill(false));
  const [lastRevealed, setLastRevealed] = useState<number | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const offset = useMotionValue(0);
  const progress = useMotionValue(0);
  const liftIdx = useMotionValue(-1);
  const liftY = useMotionValue(0);

  // ---------- 几何 ----------
  const header = headerHeight(w);
  const footer = compact ? 96 : 110;
  const fan = useMemo(() => fanGeometry(w, h, TOTAL), [w, h]);
  const maxSlotW = compact ? (need === 1 ? 170 : 130) : need === 1 ? 230 : 180;
  const pickGeo = useMemo(() => slotGeometry(spread, { x: 16, y: header + 6, w: w - 32, h: Math.max(140, fan.top - header - 18) }, maxSlotW * 0.62), [spread, w, header, fan.top, maxSlotW]);
  const finalGeo = useMemo(() => slotGeometry(spread, { x: 16, y: header + 4, w: w - 32, h: h - header - footer }, maxSlotW), [spread, w, h, header, footer, maxSlotW]);
  const deckPos = useMemo(() => ({ x: w / 2, y: header + (fan.top - header) / 2 + 10 }), [w, header, fan.top]);
  const deckW = Math.min(compact ? 92 : 120, (fan.top - header) / CARD_RATIO / 1.5);
  const exitPos = useMemo(() => ({ x: w / 2, y: h + fan.cardH * 1.2 }), [w, h, fan.cardH]);
  const [fanOrigin, setFanOrigin] = useState(deckPos);
  useEffect(() => {
    if (phase === 'intro' || phase === 'cut' || phase === 'spreading') setFanOrigin(deckPos);
  }, [deckPos, phase]);

  // ---------- 洗牌 / 切牌 ----------
  const doShuffle = useCallback(() => {
    if (phase !== 'intro') return;
    setPhase('shuffling');
    setDeck((d) => shuffleDeck(d, { allowReversed: state.settings.allowReversed }));
    setShuffleKey((k) => k + 1);
    window.setTimeout(() => setPhase('intro'), fast ? 650 : 1800);
  }, [phase, state.settings.allowReversed, fast]);

  const startCut = () => {
    setBounds(cutPiles(TOTAL, 3));
    setChosenPile(null);
    setPhase('cut');
  };

  const pickPile = (pile: number) => {
    setChosenPile(pile);
    setPhase('cutting');
    setDeck((d) => applyCut(d, bounds, pile));
    window.setTimeout(() => {
      setPhase('spreading');
      offset.set(0);
      progress.set(0);
      animate(progress, 1, { duration: fast ? 0.5 : 1.8, ease: 'easeInOut' }).then(() => setPhase('picking'));
    }, fast ? 350 : 1150);
  };

  // ---------- 抽牌 ----------
  const pickedSet = useMemo(() => new Set(picked.map((p) => p.deckIndex)), [picked]);

  const pickCard = useCallback(
    (idx: number) => {
      if (phase !== 'picking' || pickedSet.has(idx) || picked.length >= need) return;
      const pose = fanCardPose(fan, idx, TOTAL, offset.get(), progress.get(), fanOrigin);
      const ly = liftIdx.get() === idx ? liftY.get() : 0;
      const next = [...picked, { deckIndex: idx, from: { x: pose.x, y: pose.y + ly, rotate: pose.rotate } }];
      setPicked(next);
      liftIdx.set(-1);
      liftY.set(0);
      if (next.length === need) {
        setPhase('gathering');
        window.setTimeout(() => {
          setFanOrigin(exitPos);
          animate(progress, 0, { duration: fast ? 0.4 : 1.1, ease: 'easeIn' }).then(() => setPhase('reveal'));
        }, fast ? 250 : 900);
      }
    },
    [phase, pickedSet, picked, need, fan, offset, progress, fanOrigin, liftIdx, liftY, exitPos, fast],
  );

  const pickRandom = () => {
    const remaining = Array.from({ length: TOTAL }, (_, i) => i).filter((i) => !pickedSet.has(i));
    pickCard(remaining[Math.floor(cryptoRandom() * remaining.length)]);
  };

  // 指针交互：点击/向上拖动选牌，左右滑动旋转牌扇
  const gesture = useRef<{ x: number; y: number; idx: number; o: number; mode: 'none' | 'rotate' | 'lift'; id: number } | null>(null);
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (phase !== 'picking') return;
    const el = (e.target as HTMLElement).closest('[data-idx]') as HTMLElement | null;
    const idx = el ? Number(el.dataset.idx) : -1;
    gesture.current = { x: e.clientX, y: e.clientY, idx, o: offset.get(), mode: 'none', id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.mode === 'none') {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) g.mode = 'rotate';
      else if (dy < -8 && Math.abs(dy) > Math.abs(dx) && g.idx >= 0) {
        g.mode = 'lift';
        liftIdx.set(g.idx);
      }
    }
    if (g.mode === 'rotate') {
      const o = Math.max(-fan.maxOffset, Math.min(fan.maxOffset, g.o + dx / fan.R));
      offset.set(o);
    } else if (g.mode === 'lift') {
      liftY.set(Math.min(0, dy));
    }
  };
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.id !== e.pointerId) return;
    const dy = e.clientY - g.y;
    if (g.mode === 'lift') {
      if (dy < -45) pickCard(g.idx);
      else {
        animate(liftY, 0, { duration: 0.25 });
        window.setTimeout(() => liftIdx.set(-1), 260);
      }
    } else if (g.mode === 'none' && g.idx >= 0) {
      pickCard(g.idx);
    } else if (g.mode === 'rotate') {
      // 惯性回弹到边界内
      const o = offset.get();
      const clamped = Math.max(-fan.maxOffset, Math.min(fan.maxOffset, o));
      if (clamped !== o) animate(offset, clamped, { type: 'spring', stiffness: 200, damping: 30 });
    }
  };

  // 鼠标滚轮也可以拨动牌扇
  const onWheel = (e: React.WheelEvent) => {
    if (phase !== 'picking' || fan.maxOffset === 0) return;
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) / fan.R;
    offset.set(Math.max(-fan.maxOffset, Math.min(fan.maxOffset, offset.get() - d)));
  };

  // ---------- 翻牌 ----------
  const drawn = useMemo(() => (picked.length === need ? drawByIndices(deck, picked.map((p) => p.deckIndex), spreadId) : null), [picked, need, deck, spreadId]);

  const reveal = useCallback(
    (k: number) => {
      if (phase !== 'reveal') return;
      setRevealed((r) => {
        if (r[k]) return r;
        const n = [...r];
        n[k] = true;
        return n;
      });
      setLastRevealed(k);
    },
    [phase],
  );

  const revealAll = useCallback(() => {
    revealed.forEach((done, k) => {
      if (!done) window.setTimeout(() => reveal(k), (fast ? 150 : 650) * revealed.slice(0, k).filter((d) => !d).length);
    });
  }, [revealed, reveal, fast]);

  // 自动翻牌设置
  const autoStarted = useRef(false);
  useEffect(() => {
    if (phase === 'reveal' && state.settings.autoReveal && !autoStarted.current) {
      autoStarted.current = true;
      const t = window.setTimeout(revealAll, 500);
      return () => window.clearTimeout(t);
    }
  }, [phase, state.settings.autoReveal, revealAll]);

  // 全部翻开后保存（只保存一次）
  const savedRef = useRef(false);
  const allRevealed = revealed.every(Boolean);
  useEffect(() => {
    if (phase !== 'reveal' || !drawn || !allRevealed || savedRef.current) return;
    savedRef.current = true;
    const id = uid();
    const reading: Reading = { id, createdAt: Date.now(), topic, spread: spreadId, question: question || undefined, cards: drawn };
    addReading(reading, { daily: topic === 'daily' });
    setReadingId(id);
  }, [phase, drawn, allRevealed, topic, spreadId, question, addReading]);
  useEffect(() => {
    if (phase !== 'reveal' || !readingId) return;
    const t = window.setTimeout(() => setPhase('done'), fast ? 300 : 1400);
    return () => window.clearTimeout(t);
  }, [phase, readingId, fast]);

  // ---------- 文案 ----------
  const instruction: Record<Phase, string> = {
    intro: deck.shuffleCount === 0 ? '静心默念你的问题，然后轻触牌堆开始洗牌' : `已洗牌 ${deck.shuffleCount} 次 · 可继续洗牌，或开始切牌`,
    shuffling: '牌在交错之间，聆听你的心声……',
    cut: '凭直觉选择一叠牌，它将被放回最上方',
    cutting: '切牌完成，命运之扇即将展开',
    spreading: '牌阵正在展开……',
    picking: `凭直觉选出 ${need} 张牌 · ${picked.length}/${need}`,
    gathering: '牌已选定，其余的牌退入黑暗',
    reveal: '轻触卡牌，逐一揭示命运',
    done: '所有的牌都已揭晓',
  };

  const dim = phase === 'reveal' ? 0.55 : phase === 'done' ? 0.72 : phase === 'gathering' ? 0.35 : 0;
  const showFan = phase === 'spreading' || phase === 'picking' || phase === 'gathering';
  const showSlotsOutline = phase === 'spreading' || phase === 'picking' || phase === 'gathering';
  const inReveal = phase === 'reveal' || phase === 'done';
  const geo = inReveal ? finalGeo : pickGeo;
  const last = lastRevealed != null && drawn ? { pos: spread.positions[lastRevealed], card: getCard(drawn[lastRevealed].cardId), rev: drawn[lastRevealed].reversed } : null;

  return (
    <div className="fixed inset-0 z-30 overflow-hidden" style={{ touchAction: phase === 'picking' ? 'none' : 'auto' }}>
      {/* 背景变暗 + 聚光 */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 0%, rgba(0,0,0,0.6) 55%, #000 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: dim }}
        transition={{ duration: 1.6 }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--gold) 14%, transparent), transparent 65%)' }}
        animate={{ opacity: inReveal ? 1 : 0.25, scale: inReveal ? 1.1 : 0.9 }}
        transition={{ duration: 2 }}
      />

      {/* 顶部栏 */}
      <div className="absolute inset-x-0 top-0 z-[300] px-4 pt-[max(14px,env(safe-area-inset-top))] text-center">
        <button onClick={() => navigate('/')} className="absolute left-3 top-[max(12px,env(safe-area-inset-top))] rounded-full p-2 text-ink-dim transition hover:text-gold" aria-label="退出占卜">
          <X size={22} />
        </button>
        <div className="font-display text-[10px] tracking-[0.5em] text-gold-deep sm:text-xs">{spread.nameEn.toUpperCase()}</div>
        <div className="mt-1 text-lg tracking-[0.3em] text-gold-gradient sm:text-2xl">
          {TOPICS[topic].name} · {spread.name}
        </div>
        {question && <div className="mx-auto mt-1 max-w-md truncate px-8 text-xs text-ink-dim">「{question}」</div>}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase + (phase === 'picking' ? picked.length : '') + (lastRevealed ?? '')}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="mt-2 text-xs tracking-[0.15em] text-ink sm:text-sm"
            aria-live="polite"
          >
            {phase === 'reveal' && last ? (
              <span>
                <span className="text-gold">{last.pos.label}</span> — {last.card.name}（{last.rev ? '逆位' : '正位'}）
              </span>
            ) : (
              instruction[phase]
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 牌堆 */}
      <AnimatePresence>
        {(phase === 'intro' || phase === 'shuffling' || phase === 'cut' || phase === 'cutting') && (
          <motion.div key="deck" className="absolute inset-0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.6 }}>
            <DeckStack
              x={deckPos.x}
              y={deckPos.y}
              cardW={deckW}
              mode={phase === 'shuffling' ? 'shuffling' : phase === 'cut' ? 'cut' : phase === 'cutting' ? 'cutting' : 'idle'}
              shuffleKey={shuffleKey}
              chosenPile={chosenPile}
              onDeckClick={phase === 'intro' ? doShuffle : undefined}
              onPickPile={pickPile}
              fast={fast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 牌阵占位 */}
      <AnimatePresence>
        {showSlotsOutline &&
          pickGeo.slots.map((s, k) => (
            <motion.div
              key={`slot-${k}`}
              className="pointer-events-none absolute left-0 top-0 flex items-center justify-center rounded-[7%/4.2%] border border-dashed border-[var(--gold)]/45 bg-[color-mix(in_srgb,var(--gold)_5%,transparent)]"
              style={{ width: pickGeo.cardW, height: pickGeo.cardW * CARD_RATIO, x: s.x - pickGeo.cardW / 2, y: s.y - (pickGeo.cardW * CARD_RATIO) / 2, rotate: s.rotate }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: k === picked.length && phase === 'picking' ? [0.5, 1, 0.5] : 0.6, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={k === picked.length && phase === 'picking' ? { duration: 1.8, repeat: Infinity } : { duration: 0.5, delay: k * 0.05 }}
            >
              <span className="px-1 text-center text-[10px] leading-tight text-gold/80" style={{ transform: `rotate(${-s.rotate}deg)` }}>
                {spread.positions[k].label.replace(/^\d+ · /, '')}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* 扇形牌面 */}
      {showFan && (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ top: fan.top - 30, touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <div className="absolute left-0" style={{ top: -(fan.top - 30), width: w, height: h }}>
            {Array.from({ length: TOTAL }).map((_, i) =>
              pickedSet.has(i) ? null : (
                <FanCard key={i} index={i} total={TOTAL} geo={fan} offset={offset} progress={progress} liftIdx={liftIdx} liftY={liftY} origin={fanOrigin} />
              ),
            )}
          </div>
        </div>
      )}

      {/* 已选的牌 */}
      {picked.map((p, k) => {
        const s = geo.slots[k];
        const baseW = finalGeo.cardW;
        const scale = inReveal ? 1 : pickGeo.cardW / baseW;
        const card = drawn ? getCard(drawn[k].cardId) : getCard(deck.cards[p.deckIndex].cardId);
        const rev = deck.cards[p.deckIndex].reversed;
        return (
          <motion.div
            key={`picked-${p.deckIndex}`}
            className="absolute left-0 top-0"
            style={{ width: baseW, height: baseW * CARD_RATIO, zIndex: 200 + k }}
            initial={{ x: p.from.x - baseW / 2, y: p.from.y - (baseW * CARD_RATIO) / 2, rotate: p.from.rotate, scale: fan.cardW / baseW }}
            animate={{ x: s.x - baseW / 2, y: s.y - (baseW * CARD_RATIO) / 2, rotate: s.rotate, scale }}
            transition={{ duration: fast ? 0.35 : inReveal ? 1.1 : 0.85, ease: [0.3, 0.75, 0.25, 1], delay: inReveal ? k * 0.06 : 0 }}
          >
            <button
              type="button"
              className={`block ${phase === 'reveal' && !revealed[k] ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => reveal(k)}
              aria-label={revealed[k] ? `${spread.positions[k].label}：${card.name}` : `翻开${spread.positions[k].label}`}
            >
              <div className={phase === 'reveal' && !revealed[k] ? 'hover-glow rounded-[7%/4.2%]' : ''}>
                <FlipCard card={card} flipped={revealed[k]} reversed={rev} width={baseW} fast={fast} />
              </div>
            </button>
            {/* 位置徽记 */}
            {inReveal && !finalGeo.labels && (
              <div className="pointer-events-none absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--bg-0)] font-display text-[11px] text-gold" style={{ transform: `rotate(${-s.rotate}deg)` }}>
                {k + 1}
              </div>
            )}
            {inReveal && finalGeo.labels && (
              <motion.div
                className="pointer-events-none absolute left-1/2 w-[160%] -translate-x-1/2 text-center"
                style={{ top: baseW * CARD_RATIO + 8 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-[11px] tracking-[0.2em] text-gold sm:text-xs">{spread.positions[k].label}</div>
                <AnimatePresence>
                  {revealed[k] && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fast ? 0.3 : 1.2 }} className="mt-0.5 text-xs text-ink sm:text-sm">
                      {card.name} · <span className={rev ? 'text-[#e08a8a]' : 'text-[#a8d8a0]'}>{rev ? '逆位' : '正位'}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* 底部操作 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[300] flex flex-wrap items-center justify-center gap-3 px-4 pb-[max(20px,env(safe-area-inset-bottom))] [&>*]:pointer-events-auto">
        {phase === 'intro' && (
          <>
            <button className={deck.shuffleCount === 0 ? 'btn-arcane' : 'btn-ghost'} onClick={doShuffle}>
              <Shuffle size={16} /> {deck.shuffleCount === 0 ? '洗牌' : '再洗一次'}
            </button>
            {deck.shuffleCount > 0 && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="btn-arcane" onClick={startCut}>
                切牌 <ArrowRight size={16} />
              </motion.button>
            )}
          </>
        )}
        {phase === 'picking' && (
          <div className="pointer-events-none! flex w-full items-center justify-between text-[11px] text-ink-faint" style={{ marginBottom: fan.cardH + 26 }}>
            <span>{compact ? '左右滑动浏览 · 轻触或上拖选牌' : '悬停查看 · 点击或向上拖动选牌 · 拖动/滚轮旋转牌扇'}</span>
            <button className="pointer-events-auto btn-ghost px-3! py-1! text-xs" onClick={pickRandom}>
              <Sparkles size={13} /> 让命运替我选
            </button>
          </div>
        )}
        {phase === 'reveal' && !revealed.every(Boolean) && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="btn-ghost" onClick={revealAll}>
            <Eye size={16} /> 全部翻开
          </motion.button>
        )}
        {phase === 'done' && readingId && (
          <motion.button
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="btn-arcane text-lg"
            onClick={() => navigate(`/result/${readingId}`, { replace: true })}
          >
            查看解读 <ArrowRight size={18} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
