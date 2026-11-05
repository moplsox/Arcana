/**
 * 牌堆引擎 —— 纯逻辑，与 UI 完全解耦。
 * 模拟真实的塔罗流程：洗牌（含正逆位翻转）→ 切牌 → 抽牌。
 */
import { DECK } from '../data/deck';
import { SPREADS } from '../data/spreads';
import type { DrawnCard, SpreadId } from '../types/tarot';
import { cryptoRandom, type RNG } from './random';

export interface DeckCard {
  cardId: string;
  reversed: boolean;
}

export interface DeckState {
  cards: DeckCard[];
  shuffleCount: number;
  cut: boolean;
}

export interface DeckOptions {
  /** 是否启用逆位 */
  allowReversed: boolean;
  /** 每次洗牌时一张牌被翻转的概率（真实洗牌中约一半的牌会被调转方向） */
  reverseChance?: number;
}

/** 新牌堆：按标准顺序、全部正位 */
export function freshDeck(): DeckState {
  return { cards: DECK.map((c) => ({ cardId: c.id, reversed: false })), shuffleCount: 0, cut: false };
}

/** Fisher–Yates 洗牌。返回新数组，不修改原数组。 */
export function fisherYates<T>(arr: readonly T[], rng: RNG = cryptoRandom): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 洗牌：打乱顺序，并模拟部分牌在洗牌中被调转方向。
 * 逆位概率默认 0.5（每张牌独立），关闭逆位时所有牌恢复正位。
 */
export function shuffleDeck(state: DeckState, opts: DeckOptions, rng: RNG = cryptoRandom): DeckState {
  const chance = opts.reverseChance ?? 0.5;
  const cards = fisherYates(state.cards, rng).map((c) => ({
    cardId: c.cardId,
    reversed: opts.allowReversed ? (rng() < chance ? !c.reversed : c.reversed) : false,
  }));
  return { cards, shuffleCount: state.shuffleCount + 1, cut: false };
}

/**
 * 切牌：将牌堆分成 piles 叠，用户选择的那一叠放到最上面，其余按原顺序跟随。
 * 返回各叠的起止位置，供 UI 渲染。
 */
export function cutPiles(total: number, piles = 3, rng: RNG = cryptoRandom): number[] {
  // 每叠大小在均分附近随机浮动，模拟手工切牌
  const base = total / piles;
  const bounds: number[] = [0];
  for (let i = 1; i < piles; i++) {
    const jitter = Math.round((rng() - 0.5) * base * 0.3);
    bounds.push(Math.round(base * i) + jitter);
  }
  bounds.push(total);
  return bounds;
}

export function applyCut(state: DeckState, bounds: number[], chosenPile: number): DeckState {
  const piles: DeckCard[][] = [];
  for (let i = 0; i < bounds.length - 1; i++) piles.push(state.cards.slice(bounds[i], bounds[i + 1]));
  const chosen = piles[chosenPile];
  const rest = piles.filter((_, i) => i !== chosenPile).flat();
  return { ...state, cards: [...chosen, ...rest], cut: true };
}

/**
 * 根据用户在扇形牌面中点选的序号抽牌，序号即牌堆中的位置。
 * 依次分配到牌阵位置 0..n-1。
 */
export function drawByIndices(state: DeckState, indices: number[], spread: SpreadId): DrawnCard[] {
  const need = SPREADS[spread].positions.length;
  if (indices.length !== need) throw new Error(`牌阵 ${spread} 需要 ${need} 张牌，收到 ${indices.length} 张`);
  if (new Set(indices).size !== indices.length) throw new Error('不能重复抽取同一张牌');
  return indices.map((idx, positionIndex) => {
    const c = state.cards[idx];
    if (!c) throw new Error(`无效的牌序号 ${idx}`);
    return { cardId: c.cardId, reversed: c.reversed, positionIndex };
  });
}

/** 快速抽牌（用于自动占卜/测试）：洗牌后从顶部依次取牌 */
export function quickDraw(spread: SpreadId, opts: DeckOptions, rng: RNG = cryptoRandom): DrawnCard[] {
  const deck = shuffleDeck(freshDeck(), opts, rng);
  const n = SPREADS[spread].positions.length;
  return drawByIndices(deck, Array.from({ length: n }, (_, i) => i), spread);
}
