/** 塔罗牌核心类型定义 —— 数据层与 UI 层共享 */

export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Element = 'fire' | 'water' | 'air' | 'earth';
export type CourtRank = 'page' | 'knight' | 'queen' | 'king';
/** 1 = Ace … 10, 11 = Page, 12 = Knight, 13 = Queen, 14 = King */
export type MinorRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

/** [正位, 逆位] */
export type Pair<T = string> = [T, T];

export type Domain = 'love' | 'career' | 'study' | 'wealth';

export interface TarotCard {
  /** 稳定的唯一 id，如 major-00 / wands-01 */
  id: string;
  name: string;
  nameEn: string;
  arcana: Arcana;
  suit?: Suit;
  rank?: MinorRank;
  /** 大阿尔卡那 0-21；小阿尔卡那 1-14 */
  number: number;
  element: Element;
  /** 对应星象/行星（大阿尔卡那） */
  astrology?: string;
  keywords: { upright: string[]; reversed: string[] };
  upright: string;
  reversed: string;
  /** 画面与象征解析 */
  description: string;
  /** 行动建议 [正位, 逆位] */
  advice: Pair;
  love: Pair;
  career: Pair;
  study: Pair;
  wealth: Pair;
  /** 能量倾向 -2(凶) ~ +2(吉)，[正位, 逆位] */
  tone: Pair<number>;
}

/** 原始牌义数据（id/arcana/element 等由构建函数补全） */
export type CardMeaning = Omit<TarotCard, 'id' | 'arcana' | 'suit' | 'rank' | 'element' | 'number'> & {
  element?: Element;
};

export interface DrawnCard {
  cardId: string;
  reversed: boolean;
  positionIndex: number;
}

export interface SpreadPosition {
  key: string;
  label: string;
  /** 该位置的含义说明 */
  meaning: string;
  /** 布局坐标（以卡牌宽度为单位，中心原点） */
  x: number;
  y: number;
  /** 牌在布局中的额外旋转（凯尔特十字第二张横置） */
  rotate?: number;
  /** 解读视角：决定引擎如何引用牌义 */
  lens: 'state' | 'past' | 'present' | 'future' | 'obstacle' | 'advice' | 'other' | 'self' | 'outcome' | 'environment' | 'hope' | 'foundation' | 'conscious';
}

export type SpreadId = 'single' | 'three' | 'love' | 'celtic';

export interface Spread {
  id: SpreadId;
  name: string;
  nameEn: string;
  description: string;
  suitableFor: string;
  positions: SpreadPosition[];
}

export type TopicId = 'general' | 'love' | 'career' | 'study' | 'wealth' | 'daily';

export interface Topic {
  id: TopicId;
  name: string;
  nameEn: string;
  tagline: string;
  /** 推荐牌阵 */
  spreads: SpreadId[];
  domain?: Domain;
}

export interface Reading {
  id: string;
  createdAt: number;
  topic: TopicId;
  spread: SpreadId;
  question?: string;
  cards: DrawnCard[];
  starred?: boolean;
  /** AI 解读缓存（若用户启用） */
  aiInterpretation?: string;
}
