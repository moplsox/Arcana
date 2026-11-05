/**
 * 牌阵整体能量分析：大小阿尔卡那比例、元素分布、逆位比例、宫廷牌、数字重复与经典组合。
 */
import type { Element, Suit, TarotCard } from '../../types/tarot';
import { ELEMENT_NAMES, SUITS } from '../../data/deck';
import { ELEMENT_TRAIT, NUMEROLOGY } from './helpers';

export interface PlacedCard {
  card: TarotCard;
  reversed: boolean;
}

export interface EnergyStats {
  total: number;
  majorCount: number;
  reversedCount: number;
  courtCount: number;
  suitCounts: Record<Suit, number>;
  elementCounts: Record<Element, number>;
  dominantElement: Element | null;
  missingElements: Element[];
}

export function computeStats(cards: PlacedCard[]): EnergyStats {
  const suitCounts: Record<Suit, number> = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  const elementCounts: Record<Element, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  let majorCount = 0;
  let reversedCount = 0;
  let courtCount = 0;
  for (const { card, reversed } of cards) {
    if (card.arcana === 'major') majorCount++;
    if (card.suit) suitCounts[card.suit]++;
    if (card.rank && card.rank > 10) courtCount++;
    if (reversed) reversedCount++;
    elementCounts[card.element]++;
  }
  const entries = Object.entries(elementCounts) as [Element, number][];
  const max = Math.max(...entries.map((e) => e[1]));
  const tops = entries.filter((e) => e[1] === max);
  const dominantElement = cards.length >= 2 && max >= 2 && tops.length === 1 ? tops[0][0] : null;
  const missingElements = entries.filter((e) => e[1] === 0).map((e) => e[0]);
  return { total: cards.length, majorCount, reversedCount, courtCount, suitCounts, elementCounts, dominantElement, missingElements };
}

const ELEMENT_DOMINANT_TEXT: Record<Element, string> = {
  fire: '火元素占主导，事情的推动力来自热情、意志与行动——行动越果断，局面越容易打开，但也要防止急躁。',
  water: '水元素占主导，情感与直觉是这件事的核心，真正在意的不是结果本身，而是其中的感受与连结。',
  air: '风元素占主导，思考、沟通与判断主导着局面——想得清楚比做得多更重要，但也要警惕想得太多。',
  earth: '土元素占主导，现实层面的考量最为关键：金钱、时间、身体与可执行的计划会决定结果。',
};

const ELEMENT_MISSING_TEXT: Record<Element, string> = {
  fire: '缺少火元素，暗示行动力与热情不足，可能想得多、做得少。',
  water: '缺少水元素，暗示情感层面被忽视，或许你在用理性压抑真实的感受。',
  air: '缺少风元素，暗示缺乏清晰的思考与沟通，有些话需要说出来。',
  earth: '缺少土元素，暗示计划尚未落地，需要更多现实层面的安排。',
};

export function energyAnalysis(cards: PlacedCard[], stats: EnergyStats): string[] {
  const out: string[] = [];
  const n = stats.total;
  if (n === 1) {
    const { card, reversed } = cards[0];
    const base =
      card.arcana === 'major'
        ? `这是一张大阿尔卡那，代表此刻的讯息关乎更深层的人生课题，而非一时的小事。`
        : `这是一张${SUITS[card.suit!].name}牌，聚焦于${SUITS[card.suit!].realm}的日常层面，掌控权在你手中。`;
    out.push(base + `它属于${ELEMENT_NAMES[card.element]}元素，强调${ELEMENT_TRAIT[card.element]}。` + (reversed ? '逆位意味着这股能量正在受阻或向内运作，需要先调整内在状态。' : ''));
    return out;
  }

  const ratio = stats.majorCount / n;
  if (ratio >= 0.5) {
    out.push(`大阿尔卡那占据主导（${stats.majorCount}/${n}），说明此事触及人生课题与命运层面的转折，背后有超出个人掌控的力量在推动——顺势比硬拼更重要。`);
  } else if (stats.majorCount === 0) {
    out.push(`牌阵全部由小阿尔卡那组成，说明事情发生在日常层面，掌控权主要在你手中，具体的行动就能带来改变。`);
  } else {
    out.push(`大阿尔卡那出现 ${stats.majorCount} 张，命运的推力与个人的选择交织在一起：有些事需要接受，有些事可以改变。`);
  }

  if (stats.dominantElement) out.push(ELEMENT_DOMINANT_TEXT[stats.dominantElement]);
  if (n >= 5 && stats.missingElements.length > 0 && stats.missingElements.length < 3) {
    out.push(stats.missingElements.map((e) => ELEMENT_MISSING_TEXT[e]).join(''));
  }

  const rr = stats.reversedCount / n;
  if (stats.reversedCount === 0 && n >= 3) {
    out.push('所有牌都是正位，能量流动顺畅，事情会以较直接、明朗的方式展开。');
  } else if (rr >= 0.5) {
    out.push(`逆位牌较多（${stats.reversedCount}/${n}），能量多处于受阻、内化或延迟的状态，许多答案需要向内寻找，而非向外求。`);
  }

  if (stats.courtCount >= 2) {
    out.push(`出现 ${stats.courtCount} 张宫廷牌，此事牵涉多个人物，或你需要在不同角色之间切换，人际因素不可忽视。`);
  }

  // 数字重复
  const rankCount = new Map<number, number>();
  for (const { card } of cards) {
    if (card.arcana === 'minor' && card.rank && card.rank <= 10) rankCount.set(card.rank, (rankCount.get(card.rank) ?? 0) + 1);
  }
  for (const [rank, count] of rankCount) {
    if (count >= 2) out.push(`出现 ${count} 张数字 ${rank} 的牌，「${NUMEROLOGY[rank]}」的主题被反复强调，这是此次占卜的重要线索。`);
  }
  return out;
}

/** 经典牌组合（不分顺序） */
const COMBOS: { ids: [string, string]; title: string; text: string }[] = [
  { ids: ['major-16', 'major-17'], title: '崩塌之后的星光', text: '高塔与星星同时出现：最剧烈的震荡之后，疗愈与希望紧随而来。最坏的部分已经或即将过去。' },
  { ids: ['major-13', 'major-19'], title: '死亡与重生', text: '死神与太阳相遇：一个阶段的结束，恰恰是为了迎接更明亮的新生。' },
  { ids: ['major-13', 'swords-10'], title: '彻底的终结', text: '死神与宝剑十相互印证：某件事已经真正结束，不必再回头——放手是唯一的出路，也是新的起点。' },
  { ids: ['major-06', 'cups-02'], title: '双向的心意', text: '恋人与圣杯二同时出现，是极强的情感连结信号：彼此吸引、心意相通。' },
  { ids: ['major-15', 'major-06'], title: '诱惑与选择', text: '恶魔与恋人并现：吸引力强烈，但其中可能夹杂执念与依赖，需要分辨这是爱还是纠缠。' },
  { ids: ['major-18', 'major-02'], title: '迷雾中的直觉', text: '月亮与女祭司相遇：直觉高度敏锐，但真相尚未完全显露，此时宜静观，不宜妄动。' },
  { ids: ['major-18', 'major-19'], title: '由暗转明', text: '月亮与太阳同在：迷惘与清晰交替，困惑终将被阳光照亮。' },
  { ids: ['major-10', 'major-21'], title: '大循环的完成', text: '命运之轮与世界相遇：一个重要的人生周期正在圆满收尾，新的循环即将开启。' },
  { ids: ['major-00', 'major-01'], title: '带着工具出发', text: '愚者与魔术师同现：一个全新的开始，而你已具备实现它的能力。' },
  { ids: ['major-03', 'major-04'], title: '阴阳相合', text: '皇后与皇帝相伴：滋养与秩序、柔与刚达成平衡，适合建立稳固的家庭或合作。' },
  { ids: ['major-11', 'major-20'], title: '因果清算', text: '正义与审判同时出现：过去的选择正在结出果实，是时候诚实面对并做出了断。' },
  { ids: ['major-07', 'major-08'], title: '外刚内柔', text: '战车与力量同在：外在的意志与内在的温柔兼具，这是攻无不克的组合。' },
  { ids: ['major-09', 'major-12'], title: '深度的暂停', text: '隐士与倒吊人同现：现在不是行动的时候，而是向内沉淀、转换视角的时期。' },
  { ids: ['cups-03', 'cups-10'], title: '圆满的情感', text: '圣杯三与圣杯十：友情、亲情与爱情都处在温暖的状态，是幸福感很强的组合。' },
  { ids: ['swords-03', 'cups-05'], title: '心伤待愈', text: '宝剑三与圣杯五：情感上的失落与伤痛需要被正视与哀悼，而后才能放下。' },
  { ids: ['pentacles-10', 'major-21'], title: '物质与精神的圆满', text: '星币十与世界：长期努力换来稳固而完整的成果，适合安定下来、享受收获。' },
];

export function findCombos(cards: PlacedCard[]): { title: string; text: string }[] {
  const ids = new Set(cards.map((c) => c.card.id));
  const found = COMBOS.filter((c) => ids.has(c.ids[0]) && ids.has(c.ids[1])).map(({ title, text }) => ({ title, text }));

  // 王牌重复：多个新开始
  const aces = cards.filter((c) => c.card.rank === 1);
  if (aces.length >= 2) {
    found.push({ title: '多重开端', text: `出现 ${aces.length} 张王牌，生活的多个层面同时迎来新开始，机会密集，需要选择投入的重点。` });
  }
  return found;
}

/** 灵数牌（Quintessence）：所有数字相加后约化为一张大阿尔卡那，代表整次占卜的精髓 */
export function quintessence(cards: PlacedCard[]): number {
  let sum = 0;
  for (const { card } of cards) {
    if (card.arcana === 'major') sum += card.number;
    else if (card.rank && card.rank <= 10) sum += card.rank;
  }
  while (sum > 22) sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
  return sum === 22 ? 0 : sum;
}
