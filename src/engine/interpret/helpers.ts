import type { Domain, Element, TarotCard } from '../../types/tarot';
import { ELEMENT_NAMES, RANK_NAMES } from '../../data/deck';

export const ori = (r: boolean) => (r ? '逆位' : '正位');
export const kws = (c: TarotCard, r: boolean) => (r ? c.keywords.reversed : c.keywords.upright);
export const toneOf = (c: TarotCard, r: boolean) => c.tone[r ? 1 : 0];
export const meaningOf = (c: TarotCard, r: boolean) => (r ? c.reversed : c.upright);
export const pick = <T>(pair: [T, T], r: boolean): T => pair[r ? 1 : 0];

/** 牌义第一句 —— 作为该牌"本质"的浓缩 */
export function essence(c: TarotCard, r: boolean): string {
  const text = meaningOf(c, r);
  const idx = text.indexOf('。');
  return idx > 0 ? text.slice(0, idx + 1) : text;
}

/** 去掉凯尔特十字标签前的序号："1 · 现状" → "现状" */
export const posName = (label: string) => label.replace(/^\d+\s*·\s*/, '');

export const cardLabel = (c: TarotCard, r: boolean) => `「${c.name}」${ori(r)}`;

export const ELEMENT_TRAIT: Record<Element, string> = {
  fire: '行动与热情',
  water: '情感与直觉',
  air: '思考与沟通',
  earth: '现实与稳定',
};

export const DOMAIN_NAMES: Record<Domain, string> = { love: '感情', career: '事业', study: '学业', wealth: '财运' };

export type ElementRelation = 'same' | 'support' | 'oppose' | 'neutral';

/** 元素尊贵（Elemental Dignities）：同元素加强，火风/水土相生，火水/风土相克 */
export function elementRelation(a: Element, b: Element): ElementRelation {
  if (a === b) return 'same';
  const pair = [a, b].sort().join('-');
  if (pair === 'air-fire' || pair === 'earth-water') return 'support';
  if (pair === 'fire-water' || pair === 'air-earth') return 'oppose';
  return 'neutral';
}

export function elementRelationText(a: Element, b: Element): string {
  const A = ELEMENT_NAMES[a];
  const B = ELEMENT_NAMES[b];
  switch (elementRelation(a, b)) {
    case 'same':
      return `两张牌同属${A}元素，${ELEMENT_TRAIT[a]}的力量相互叠加、被明显放大`;
    case 'support':
      return `${A}与${B}元素相生，「${ELEMENT_TRAIT[a]}」和「${ELEMENT_TRAIT[b]}」彼此滋养、相互成全`;
    case 'oppose':
      return `${A}与${B}元素相克，「${ELEMENT_TRAIT[a]}」和「${ELEMENT_TRAIT[b]}」之间存在张力，需要有意识地调和`;
    default:
      return `${A}与${B}元素彼此独立，「${ELEMENT_TRAIT[a]}」和「${ELEMENT_TRAIT[b]}」各自运作、互不干扰`;
  }
}

/** 数字学含义（小阿尔卡那 1-10） */
export const NUMEROLOGY: Record<number, string> = {
  1: '开端与潜能',
  2: '平衡与抉择',
  3: '成长与表达',
  4: '稳定与结构',
  5: '冲突与变动',
  6: '和谐与调整',
  7: '反思与考验',
  8: '力量与推进',
  9: '临近圆满',
  10: '完成与新循环',
};

export function rankName(c: TarotCard): string {
  return c.rank ? RANK_NAMES[c.rank] : String(c.number);
}

/** 由 A 到 B 的能量轨迹 */
export function trajectory(delta: number): string {
  if (delta >= 2) return '能量明显回升，局面正在好转';
  if (delta >= 1) return '能量逐步向好，事情在缓慢改善';
  if (delta <= -2) return '能量急转直下，需要提前做好准备';
  if (delta <= -1) return '能量有所下滑，过程中会遇到一些阻力';
  return '能量大体延续，局面会保持相似的基调';
}

/** 在数组中按种子挑选，保证同一次占卜每次打开都得到相同文案 */
export function seededPick<T>(arr: T[], seed: number, salt = 0): T {
  return arr[Math.abs((seed + salt * 2654435761) | 0) % arr.length];
}
