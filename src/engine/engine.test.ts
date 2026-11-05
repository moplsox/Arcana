import { describe, expect, it } from 'vitest';
import { DECK, MAJOR_ARCANA, MINOR_ARCANA, getCard } from '../data/deck';
import { SPREADS, SPREAD_LIST } from '../data/spreads';
import type { Reading, SpreadId, TopicId } from '../types/tarot';
import { applyCut, cutPiles, drawByIndices, fisherYates, freshDeck, quickDraw, shuffleDeck } from './deckEngine';
import { interpret, interpretationToText } from './interpret';
import { quintessence } from './interpret/patterns';
import { seededRandom } from './random';

describe('塔罗牌数据', () => {
  it('共 78 张：22 大阿尔卡那 + 56 小阿尔卡那', () => {
    expect(DECK).toHaveLength(78);
    expect(MAJOR_ARCANA).toHaveLength(22);
    expect(MINOR_ARCANA).toHaveLength(56);
  });

  it('id 与名称唯一', () => {
    expect(new Set(DECK.map((c) => c.id)).size).toBe(78);
    expect(new Set(DECK.map((c) => c.name)).size).toBe(78);
    expect(new Set(DECK.map((c) => c.nameEn)).size).toBe(78);
  });

  it('每个花色 14 张，编号 1-14', () => {
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
      const cards = MINOR_ARCANA.filter((c) => c.suit === suit);
      expect(cards).toHaveLength(14);
      expect(cards.map((c) => c.rank)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    }
  });

  it('每张牌的牌义字段完整', () => {
    for (const c of DECK) {
      expect(c.keywords.upright.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.keywords.reversed.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.upright.length, c.id).toBeGreaterThan(30);
      expect(c.reversed.length, c.id).toBeGreaterThan(30);
      expect(c.description.length, c.id).toBeGreaterThan(20);
      for (const f of ['advice', 'love', 'career', 'study', 'wealth'] as const) {
        expect(c[f][0].length, `${c.id}.${f}`).toBeGreaterThan(4);
        expect(c[f][1].length, `${c.id}.${f}`).toBeGreaterThan(4);
      }
      expect(c.tone[0]).toBeGreaterThanOrEqual(-2);
      expect(c.tone[0]).toBeLessThanOrEqual(2);
    }
  });

  it('大阿尔卡那编号 0-21 且有星象对应', () => {
    MAJOR_ARCANA.forEach((c, i) => {
      expect(c.number).toBe(i);
      expect(c.astrology).toBeTruthy();
    });
    expect(getCard('major-00').name).toBe('愚者');
    expect(getCard('major-21').name).toBe('世界');
    expect(getCard('swords-03').name).toBe('宝剑三');
    expect(getCard('pentacles-14').name).toBe('星币国王');
  });
});

describe('洗牌、切牌与抽牌', () => {
  it('Fisher-Yates 是原数组的排列', () => {
    const arr = Array.from({ length: 78 }, (_, i) => i);
    const out = fisherYates(arr, seededRandom(42));
    expect(out).toHaveLength(78);
    expect([...out].sort((a, b) => a - b)).toEqual(arr);
    expect(out).not.toEqual(arr);
    expect(arr[0]).toBe(0); // 原数组不变
  });

  it('洗牌后仍为完整 78 张，且产生逆位', () => {
    const d = shuffleDeck(freshDeck(), { allowReversed: true }, seededRandom(1));
    expect(new Set(d.cards.map((c) => c.cardId)).size).toBe(78);
    const rev = d.cards.filter((c) => c.reversed).length;
    expect(rev).toBeGreaterThan(20);
    expect(rev).toBeLessThan(58);
    expect(d.shuffleCount).toBe(1);
  });

  it('关闭逆位时所有牌正位', () => {
    let d = shuffleDeck(freshDeck(), { allowReversed: true }, seededRandom(3));
    d = shuffleDeck(d, { allowReversed: false }, seededRandom(4));
    expect(d.cards.every((c) => !c.reversed)).toBe(true);
  });

  it('切牌把所选牌叠移到顶部，牌数不变', () => {
    const d = shuffleDeck(freshDeck(), { allowReversed: true }, seededRandom(7));
    const bounds = cutPiles(78, 3, seededRandom(8));
    expect(bounds[0]).toBe(0);
    expect(bounds[3]).toBe(78);
    const cut = applyCut(d, bounds, 2);
    expect(cut.cards).toHaveLength(78);
    expect(cut.cards[0]).toEqual(d.cards[bounds[2]]);
    expect(cut.cut).toBe(true);
  });

  it('按序号抽牌并校验数量与重复', () => {
    const d = shuffleDeck(freshDeck(), { allowReversed: true }, seededRandom(9));
    const drawn = drawByIndices(d, [5, 40, 77], 'three');
    expect(drawn.map((x) => x.cardId)).toEqual([d.cards[5].cardId, d.cards[40].cardId, d.cards[77].cardId]);
    expect(drawn.map((x) => x.positionIndex)).toEqual([0, 1, 2]);
    expect(() => drawByIndices(d, [1, 1, 2], 'three')).toThrow();
    expect(() => drawByIndices(d, [1, 2], 'three')).toThrow();
  });
});

describe('解读引擎', () => {
  const topics: TopicId[] = ['general', 'love', 'career', 'study', 'wealth', 'daily'];

  it('所有牌阵 × 主题 × 多次随机抽牌均可生成完整解读', () => {
    let seed = 100;
    for (const spread of SPREAD_LIST) {
      for (const topic of topics) {
        for (let k = 0; k < 15; k++) {
          const cards = quickDraw(spread.id as SpreadId, { allowReversed: true }, seededRandom(seed++));
          const reading: Reading = { id: `t-${seed}`, createdAt: 0, topic, spread: spread.id, cards, question: '我该怎么做？' };
          const it = interpret(reading);
          expect(it.insights).toHaveLength(SPREADS[spread.id].positions.length);
          for (const ins of it.insights) {
            expect(ins.reading.length).toBeGreaterThan(20);
            expect(ins.reading).not.toContain('undefined');
          }
          expect(it.connections.length).toBeGreaterThan(0);
          expect(it.conclusion.length).toBeGreaterThanOrEqual(3);
          expect(it.domains).toHaveLength(4);
          expect(it.conclusion.join('')).not.toContain('undefined');
          expect(it.conclusion[0]).toContain('我该怎么做');
          const text = interpretationToText(reading, it);
          expect(text).toContain('ARCANA');
          expect(text).not.toContain('undefined');
        }
      }
    }
  });

  it('解读对同一次占卜是确定性的', () => {
    const cards = quickDraw('celtic', { allowReversed: true }, seededRandom(5));
    const r: Reading = { id: 'fixed', createdAt: 0, topic: 'career', spread: 'celtic', cards };
    expect(interpret(r)).toEqual(interpret(r));
  });

  it('主题领域排在建议首位', () => {
    const cards = quickDraw('three', { allowReversed: true }, seededRandom(11));
    const it = interpret({ id: 'x', createdAt: 0, topic: 'wealth', spread: 'three', cards });
    expect(it.domains[0].domain).toBe('wealth');
    expect(it.domains[0].focus).toBe(true);
  });

  it('经典组合可被识别', () => {
    const it = interpret({
      id: 'combo', createdAt: 0, topic: 'general', spread: 'three',
      cards: [
        { cardId: 'major-16', reversed: false, positionIndex: 0 },
        { cardId: 'cups-05', reversed: false, positionIndex: 1 },
        { cardId: 'major-17', reversed: false, positionIndex: 2 },
      ],
    });
    expect(it.combos.map((c) => c.title)).toContain('崩塌之后的星光');
    // 过去的高塔（-2）→ 未来的星星（+2）应显示上升轨迹
    expect(it.connections[2].text).toContain('回升');
  });

  it('灵数牌约化到 0-21', () => {
    const q = quintessence([
      { card: getCard('major-21'), reversed: false },
      { card: getCard('major-20'), reversed: false },
      { card: getCard('major-19'), reversed: false },
    ]);
    expect(q).toBe(6); // 60 → 6
  });
});
