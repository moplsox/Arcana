import type { Spread, SpreadId, Topic, TopicId } from '../types/tarot';

/**
 * 牌阵定义。坐标单位：x 以"卡宽"计，y 以"卡高"计，原点在布局中心。
 */
export const SPREADS: Record<SpreadId, Spread> = {
  single: {
    id: 'single',
    name: '单张指引',
    nameEn: 'Single Card',
    description: '抽一张牌，聚焦当下最核心的讯息。',
    suitableFor: '每日运势 · 今日指引 · 快速解答',
    positions: [
      { key: 'guide', label: '指引', meaning: '此刻宇宙给你的核心讯息', x: 0, y: 0, lens: 'state' },
    ],
  },
  three: {
    id: 'three',
    name: '时间之流',
    nameEn: 'Past · Present · Future',
    description: '过去、现在、未来三张牌，看清事情的来龙去脉与走向。',
    suitableFor: '了解事件发展 · 梳理处境',
    positions: [
      { key: 'past', label: '过去', meaning: '造成现状的根源与过往影响', x: -1.25, y: 0, lens: 'past' },
      { key: 'present', label: '现在', meaning: '你当下所处的状态与核心课题', x: 0, y: 0, lens: 'present' },
      { key: 'future', label: '未来', meaning: '按照目前轨迹可能的发展', x: 1.25, y: 0, lens: 'future' },
    ],
  },
  love: {
    id: 'love',
    name: '爱情之镜',
    nameEn: 'Mirror of Love',
    description: '五张牌映照你与对方的心意、阻碍与未来。',
    suitableFor: '恋爱 · 暧昧 · 婚姻 · 复合',
    positions: [
      { key: 'me', label: '我的感情状态', meaning: '你在这段关系中的真实状态与需求', x: -1.3, y: -0.05, lens: 'self' },
      { key: 'partner', label: '对方的真实想法', meaning: '对方内心对你和这段关系的态度', x: 1.3, y: -0.05, lens: 'other' },
      { key: 'obstacle', label: '关系的阻碍', meaning: '横亘在你们之间的问题或挑战', x: 0, y: 0.15, lens: 'obstacle' },
      { key: 'future', label: '未来发展', meaning: '这段关系接下来的走向', x: 0, y: -1.05, lens: 'future' },
      { key: 'advice', label: '最终建议', meaning: '塔罗给你的行动建议', x: 0, y: 1.35, lens: 'advice' },
    ],
  },
  celtic: {
    id: 'celtic',
    name: '凯尔特十字',
    nameEn: 'Celtic Cross',
    description: '最经典的十张牌阵，全面剖析问题的核心、根源、环境与结果。',
    suitableFor: '重大抉择 · 复杂问题 · 全面分析',
    positions: [
      { key: 'present', label: '1 · 现状', meaning: '问题的核心，你此刻的处境', x: -1.1, y: 0, lens: 'present' },
      { key: 'challenge', label: '2 · 阻碍', meaning: '横跨在你面前的挑战或助力', x: -1.1, y: 0, rotate: 90, lens: 'obstacle' },
      { key: 'foundation', label: '3 · 根基', meaning: '潜意识中的根源，事情的基础', x: -1.1, y: 1.1, lens: 'foundation' },
      { key: 'past', label: '4 · 过去', meaning: '正在离去的过去影响', x: -2.35, y: 0, lens: 'past' },
      { key: 'crown', label: '5 · 目标', meaning: '意识层面的目标、理想或最佳可能', x: -1.1, y: -1.1, lens: 'conscious' },
      { key: 'near', label: '6 · 近未来', meaning: '即将到来的发展', x: 0.15, y: 0, lens: 'future' },
      { key: 'self', label: '7 · 自我', meaning: '你对此事的态度与自我定位', x: 1.65, y: 1.65, lens: 'self' },
      { key: 'environment', label: '8 · 环境', meaning: '他人与外部环境的影响', x: 1.65, y: 0.55, lens: 'environment' },
      { key: 'hopes', label: '9 · 希望与恐惧', meaning: '你内心的期盼与担忧', x: 1.65, y: -0.55, lens: 'hope' },
      { key: 'outcome', label: '10 · 结果', meaning: '综合所有因素后最可能的结果', x: 1.65, y: -1.65, lens: 'outcome' },
    ],
  },
};

export const SPREAD_LIST: Spread[] = [SPREADS.single, SPREADS.three, SPREADS.love, SPREADS.celtic];

export const TOPICS: Record<TopicId, Topic> = {
  general: { id: 'general', name: '综合运势', nameEn: 'Destiny', tagline: '洞见此刻的命运走向', spreads: ['three', 'celtic', 'single'] },
  love: { id: 'love', name: '爱情', nameEn: 'Love', tagline: '照见心意与缘分', spreads: ['love', 'three', 'single'], domain: 'love' },
  career: { id: 'career', name: '事业', nameEn: 'Career', tagline: '前路、抉择与机遇', spreads: ['three', 'celtic', 'single'], domain: 'career' },
  study: { id: 'study', name: '学业', nameEn: 'Study', tagline: '考试、方向与成长', spreads: ['three', 'single', 'celtic'], domain: 'study' },
  wealth: { id: 'wealth', name: '财运', nameEn: 'Fortune', tagline: '金钱流动与机会', spreads: ['three', 'single', 'celtic'], domain: 'wealth' },
  daily: { id: 'daily', name: '每日指引', nameEn: 'Daily', tagline: '属于今天的一张牌', spreads: ['single'] },
};

export const TOPIC_LIST: Topic[] = [TOPICS.general, TOPICS.love, TOPICS.career, TOPICS.study, TOPICS.wealth];
