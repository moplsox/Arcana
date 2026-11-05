import type { CardMeaning, Element, MinorRank, Suit, TarotCard } from '../types/tarot';
import { MAJOR_MEANINGS } from './cards/major';
import { WANDS_MEANINGS } from './cards/wands';
import { CUPS_MEANINGS } from './cards/cups';
import { SWORDS_MEANINGS } from './cards/swords';
import { PENTACLES_MEANINGS } from './cards/pentacles';

export interface SuitInfo {
  id: Suit;
  name: string;
  nameEn: string;
  element: Element;
  elementName: string;
  /** 该花色主导的生活领域 */
  realm: string;
  color: string;
}

export const SUITS: Record<Suit, SuitInfo> = {
  wands: { id: 'wands', name: '权杖', nameEn: 'Wands', element: 'fire', elementName: '火', realm: '行动、热情与事业抱负', color: '#e8894a' },
  cups: { id: 'cups', name: '圣杯', nameEn: 'Cups', element: 'water', elementName: '水', realm: '情感、关系与直觉', color: '#5fb3d1' },
  swords: { id: 'swords', name: '宝剑', nameEn: 'Swords', element: 'air', elementName: '风', realm: '思想、沟通与冲突', color: '#b9c4dd' },
  pentacles: { id: 'pentacles', name: '星币', nameEn: 'Pentacles', element: 'earth', elementName: '土', realm: '物质、工作与身体', color: '#c9b458' },
};

export const ELEMENT_NAMES: Record<Element, string> = { fire: '火', water: '水', air: '风', earth: '土' };

export const RANK_NAMES: Record<MinorRank, string> = {
  1: '王牌', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十',
  11: '侍从', 12: '骑士', 13: '王后', 14: '国王',
};

const pad = (n: number) => String(n).padStart(2, '0');

function buildMinor(suit: Suit, meanings: CardMeaning[]): TarotCard[] {
  return meanings.map((m, i) => {
    const rank = (i + 1) as MinorRank;
    return { ...m, id: `${suit}-${pad(rank)}`, arcana: 'minor', suit, rank, number: rank, element: SUITS[suit].element };
  });
}

export const MAJOR_ARCANA: TarotCard[] = MAJOR_MEANINGS.map((m, i) => ({
  ...m,
  id: `major-${pad(i)}`,
  arcana: 'major',
  number: i,
  element: m.element ?? 'air',
}));

export const MINOR_ARCANA: TarotCard[] = [
  ...buildMinor('wands', WANDS_MEANINGS),
  ...buildMinor('cups', CUPS_MEANINGS),
  ...buildMinor('swords', SWORDS_MEANINGS),
  ...buildMinor('pentacles', PENTACLES_MEANINGS),
];

/** 完整的 78 张牌 */
export const DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const CARD_INDEX = new Map(DECK.map((c) => [c.id, c]));

export function getCard(id: string): TarotCard {
  const card = CARD_INDEX.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

export function findCard(id: string): TarotCard | undefined {
  return CARD_INDEX.get(id);
}

/** 罗马数字（大阿尔卡那牌面编号） */
export function toRoman(n: number): string {
  if (n === 0) return '0';
  const map: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

export function cardNumeral(card: TarotCard): string {
  if (card.arcana === 'major') return toRoman(card.number);
  if (card.rank === 1) return 'ACE';
  if (card.rank && card.rank > 10) return ['PAGE', 'KNIGHT', 'QUEEN', 'KING'][card.rank - 11];
  return toRoman(card.number);
}
