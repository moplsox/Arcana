/**
 * 本地中文解读引擎。
 *
 * 解读分四层，逐层综合，而不是把牌义简单拼接：
 *   1. 位置视角：牌义 × 牌阵位置 → 情境化讯息
 *   2. 牌间关系：元素尊贵、能量轨迹、牌阵特有的对位关系
 *   3. 整体能量：大小阿尔卡那比例、元素分布、逆位、数字、经典组合、灵数牌
 *   4. 综合结论：根据趋势、关键牌与建议牌生成叙事，并给出分领域建议
 *
 * 所有文案选择都基于 reading.id 的哈希，同一次占卜每次打开结果一致。
 */
import type { Domain, Reading, SpreadPosition, TarotCard } from '../../types/tarot';
import { getCard, ELEMENT_NAMES, SUITS } from '../../data/deck';
import { SPREADS, TOPICS } from '../../data/spreads';
import { hashString } from '../random';
import {
  DOMAIN_NAMES, cardLabel, elementRelation, posName, elementRelationText, essence, kws, meaningOf, ori, pick, seededPick, toneOf, trajectory,
} from './helpers';
import { readPosition } from './positions';
import { computeStats, energyAnalysis, findCombos, quintessence, type EnergyStats, type PlacedCard } from './patterns';

export interface CardInsight {
  position: SpreadPosition;
  card: TarotCard;
  reversed: boolean;
  keywords: string[];
  meaning: string;
  reading: string;
  tone: number;
}

export interface Connection {
  title: string;
  text: string;
}

export interface DomainAdvice {
  domain: Domain;
  name: string;
  text: string;
  focus: boolean;
  mood: 'good' | 'caution' | 'neutral';
}

export type TrendKey = 'bright' | 'rising' | 'balance' | 'trial' | 'rebirth';

export interface Interpretation {
  title: string;
  trend: TrendKey;
  trendLabel: string;
  score: number;
  summary: string;
  insights: CardInsight[];
  stats: EnergyStats;
  energy: string[];
  connections: Connection[];
  combos: Connection[];
  keyCard: { insight: CardInsight; reason: string };
  quintessence: { card: TarotCard; text: string };
  conclusion: string[];
  domains: DomainAdvice[];
  finalAdvice: string;
  daily?: { color: string; number: number; mantra: string };
}

const TREND_LABEL: Record<TrendKey, string> = {
  bright: '光明顺遂',
  rising: '渐入佳境',
  balance: '转折之间',
  trial: '试炼与磨砺',
  rebirth: '破而后立',
};

const TREND_TITLES: Record<TrendKey, string[]> = {
  bright: ['星辉照路', '曙光已至', '金色潮汐'],
  rising: ['破晓前行', '月升之时', '静待花开'],
  balance: ['十字路口', '静水深流', '天平之上'],
  trial: ['风暴中的灯', '荆棘之冠', '试炼之途'],
  rebirth: ['灰烬重生', '长夜将尽', '破茧之时'],
};

const POSITION_WEIGHT: Partial<Record<SpreadPosition['lens'], number>> = {
  outcome: 2,
  future: 1.5,
  present: 1.2,
  state: 1.5,
  obstacle: 0.6,
  advice: 0.8,
  hope: 0.5,
};

const DOMAIN_SUIT: Record<Domain, string> = { love: 'cups', career: 'wands', study: 'swords', wealth: 'pentacles' };

const DOMAIN_TIPS: Record<Domain, Record<DomainAdvice['mood'], string>> = {
  love: {
    good: '勇敢表达心意，让关系自然升温。',
    caution: '先照顾好自己的情绪，再决定如何面对这段关系。',
    neutral: '多一些沟通与耐心，关系会逐渐明朗。',
  },
  career: {
    good: '适合主动争取机会、推进重要计划。',
    caution: '稳住节奏，先解决眼前的问题再谋发展。',
    neutral: '做好本职、积累实力，等待更清晰的时机。',
  },
  study: {
    good: '保持当前节奏，可以挑战更高的目标。',
    caution: '调整方法与心态，必要时向老师或同伴求助。',
    neutral: '把大目标拆成可执行的小目标，稳步推进。',
  },
  wealth: {
    good: '可以适度把握机会，但仍需量力而行。',
    caution: '控制支出、避开高风险投资，先守后攻。',
    neutral: '保持收支平衡，做好长期规划。',
  },
};

const ELEMENT_COLOR: Record<string, string> = { fire: '赤金色', water: '深海蓝', air: '月光银', earth: '森林绿' };

function trendOf(score: number): TrendKey {
  if (score >= 1) return 'bright';
  if (score >= 0.3) return 'rising';
  if (score > -0.3) return 'balance';
  if (score > -1) return 'trial';
  return 'rebirth';
}

const lensWeight = (p: SpreadPosition) => POSITION_WEIGHT[p.lens] ?? 1;

/* ---------------- 牌间关系 ---------------- */

function relate(a: CardInsight, b: CardInsight, title: string, lead: string, temporal = true): Connection {
  const rel = elementRelationText(a.card.element, b.card.element);
  let text = `${lead}${cardLabel(a.card, a.reversed)}与${cardLabel(b.card, b.reversed)}：${rel}。`;
  if (a.card.suit && a.card.suit === b.card.suit) {
    text += `两者同为${SUITS[a.card.suit].name}，说明此事始终围绕「${SUITS[a.card.suit].realm}」展开。`;
  } else if (a.card.arcana === 'major' && b.card.arcana === 'major') {
    text += '两张都是大阿尔卡那，这条线索承载着命运层面的分量。';
  }
  if (temporal) {
    text += `从「${posName(a.position.label)}」到「${posName(b.position.label)}」，${trajectory(b.tone - a.tone)}。`;
  } else {
    const diff = Math.abs(b.tone) - Math.abs(a.tone) + (b.card.arcana === 'major' ? 0.5 : 0) - (a.card.arcana === 'major' ? 0.5 : 0);
    text +=
      diff >= 1 ? `「${posName(b.position.label)}」的力量明显强于「${posName(a.position.label)}」，它是此刻最需要被处理的部分。`
        : diff <= -1 ? `「${posName(a.position.label)}」的力量更强，你有足够的底气应对「${posName(b.position.label)}」带来的影响。`
          : '两股力量旗鼓相当，彼此牵制，局面的走向取决于你更愿意喂养哪一边。';
  }
  return { title, text };
}

function loveSync(me: CardInsight, partner: CardInsight): Connection {
  const rel = elementRelation(me.card.element, partner.card.element);
  let sync: string;
  if (me.tone > 0 && partner.tone > 0) sync = '你们的心意基本同频，都对这段关系抱有期待，是一种双向奔赴的状态。';
  else if (me.tone > 0 && partner.tone <= 0) sync = '你投入得更多、更主动，而对方有所保留——不一定是不在乎，更可能是有自己的顾虑尚未说出。';
  else if (me.tone <= 0 && partner.tone > 0) sync = '对方的态度其实比你想象的更积极，反倒是你的不安或犹豫让距离被拉开。';
  else sync = '你们此刻都处在各自的困扰里，彼此都需要先照顾好自己，才能真正靠近。';
  const relText =
    rel === 'same' ? '两人元素相同，性情相近、容易理解彼此，但也可能放大相同的问题。'
      : rel === 'support' ? `${ELEMENT_NAMES[me.card.element]}与${ELEMENT_NAMES[partner.card.element]}相生，你们天然地能补足对方。`
        : rel === 'oppose' ? `${ELEMENT_NAMES[me.card.element]}与${ELEMENT_NAMES[partner.card.element]}相克，表达爱的方式不同，容易误解彼此的用意。`
          : '两人的能量各自独立，需要主动创造交集。';
  return { title: '你们是否同频', text: `你是${cardLabel(me.card, me.reversed)}，对方是${cardLabel(partner.card, partner.reversed)}。${sync}${relText}` };
}

function adviceVsObstacle(advice: CardInsight, obstacle: CardInsight): Connection {
  const rel = elementRelation(advice.card.element, obstacle.card.element);
  const how =
    rel === 'oppose' ? '建议牌与阻碍牌元素相克，以克制之力化解——这正是对症下药。'
      : rel === 'same' ? '建议牌与阻碍牌元素相同，意味着你需要正面穿越它，而不是绕开。'
        : rel === 'support' ? '建议牌与阻碍牌元素相生，化解的方式是理解与转化，而非对抗。'
          : '建议牌另辟蹊径，从一个全新的角度切入问题。';
  return {
    title: '化解之钥',
    text: advice.reversed
      ? `面对「${kws(obstacle.card, obstacle.reversed)[0]}」的阻碍，逆位的${advice.card.name}提醒你先避开「${kws(advice.card, true)[0]}」的陷阱，转而回到它正位的力量——「${kws(advice.card, false)[0]}」。${how}`
      : `面对「${kws(obstacle.card, obstacle.reversed)[0]}」的阻碍，${advice.card.name}给出的钥匙是「${kws(advice.card, false)[0]}」。${how}`,
  };
}

function hopeVsOutcome(hope: CardInsight, outcome: CardInsight): Connection {
  const sign = (t: number) => (t > 0 ? 1 : t < 0 ? -1 : 0);
  const h = sign(hope.tone);
  const o = sign(outcome.tone);
  let text: string;
  if (o === 0) {
    text = `结果（${outcome.card.name}）本身尚未定型，而你内心${h >= 0 ? '的期待' : '的担忧'}（${hope.card.name}）会实实在在地影响它——心态就是此刻最大的变量。`;
  } else if (h === o || (h === 0 && o > 0)) {
    text = `你的内心（${hope.card.name}）与结果（${outcome.card.name}）方向一致：${o > 0 ? '你所盼望的，很可能会以某种形式实现。' : '你所担心的事有其依据，提前准备会让冲击小得多。'}`;
  } else {
    text = `你的内心（${hope.card.name}）与结果（${outcome.card.name}）方向不同：${o > 0 ? '你的担忧比实际情况更严重，事情会比预期顺利。' : '现实可能与期待有落差，调整预期能让你更从容。'}`;
  }
  return { title: '期待与结果', text };
}

function buildConnections(spreadId: Reading['spread'], ins: CardInsight[]): Connection[] {
  switch (spreadId) {
    case 'single': {
      const c = ins[0];
      const astro = c.card.astrology ? `它对应${c.card.astrology}，` : '';
      const num = c.card.arcana === 'major' ? `数字 ${c.card.number} 在灵魂旅程中代表这一阶段的课题。` : '';
      return [{ title: '牌的深层讯息', text: `${astro}${c.card.description}${num}` }];
    }
    case 'three':
      return [
        relate(ins[0], ins[1], '过去如何造就现在', ''),
        relate(ins[1], ins[2], '现在如何通往未来', ''),
        {
          title: '整条时间线',
          text: `从「${kws(ins[0].card, ins[0].reversed)[0]}」到「${kws(ins[1].card, ins[1].reversed)[0]}」，再到「${kws(ins[2].card, ins[2].reversed)[0]}」——${trajectory(ins[2].tone - ins[0].tone)}。${ins[2].tone >= ins[1].tone ? '你正在走一条上升的路，当下的努力会被未来回报。' : '未来需要你更多的主动与调整，现在就是改变轨迹的最佳时机。'}`,
        },
      ];
    case 'love':
      return [
        loveSync(ins[0], ins[1]),
        relate(ins[2], ins[3], '阻碍如何影响走向', ''),
        adviceVsObstacle(ins[4], ins[2]),
      ];
    case 'celtic':
      return [
        relate(ins[0], ins[1], '核心与挑战（1 × 2）', '处境与横跨其上的力量——', false),
        {
          title: '潜意识与意识（3 ↔ 5）',
          text: `根基是「${kws(ins[2].card, ins[2].reversed)[0]}」，而你有意识追求的是「${kws(ins[4].card, ins[4].reversed)[0]}」。${(ins[2].tone >= 0) === (ins[4].tone >= 0) ? '内在动机与外在目标是一致的，你很清楚自己要什么。' : '内心深处的驱动力与你以为的目标并不一致——这正是矛盾与纠结的来源，值得深挖。'}`,
        },
        relate(ins[3], ins[5], '过去到近未来（4 → 6）', '时间轴上——'),
        {
          title: '自我与环境（7 ↔ 8）',
          text: `你自身是${cardLabel(ins[6].card, ins[6].reversed)}，外部环境是${cardLabel(ins[7].card, ins[7].reversed)}。${elementRelationText(ins[6].card.element, ins[7].card.element)}。${ins[6].tone >= ins[7].tone ? '你的状态比环境更有力量，主动权在你。' : '环境的影响比你自身更强，借力或设限都是可行的策略。'}`,
        },
        hopeVsOutcome(ins[8], ins[9]),
        relate(ins[0], ins[9], '整体轨迹（1 → 10）', '从起点到终点——'),
      ];
  }
}

/* ---------------- 关键牌与分领域建议 ---------------- */

function chooseKeyCard(ins: CardInsight[]): { insight: CardInsight; reason: string } {
  let best = ins[0];
  let bestScore = -Infinity;
  for (const i of ins) {
    const s = Math.abs(i.tone) + (i.card.arcana === 'major' ? 1.2 : 0) + (lensWeight(i.position) - 1);
    if (s > bestScore) { bestScore = s; best = i; }
  }
  const reason =
    ins.length === 1
      ? '它是这次占卜唯一、也是全部的答案。'
      : best.card.arcana === 'major'
        ? `它是大阿尔卡那，且在「${posName(best.position.label)}」的位置上能量最为强烈，是整个牌阵的重心。`
        : `它在「${posName(best.position.label)}」的位置上能量最为鲜明，牵动着整个牌阵的走向。`;
  return { insight: best, reason };
}

function buildDomains(ins: CardInsight[], focus: Domain | undefined, key: CardInsight): DomainAdvice[] {
  const order: Domain[] = ['love', 'career', 'study', 'wealth'];
  if (focus) order.sort((a, b) => (a === focus ? -1 : b === focus ? 1 : 0));
  return order.map((domain) => {
    const suit = DOMAIN_SUIT[domain];
    const affine = ins.filter((i) => i.card.suit === suit);
    const majors = ins.filter((i) => i.card.arcana === 'major' && !affine.includes(i));
    const chosen: CardInsight[] = [...affine, ...majors].slice(0, 2);
    if (chosen.length === 0) chosen.push(key);
    const avg = chosen.reduce((s, i) => s + i.tone, 0) / chosen.length;
    const mood: DomainAdvice['mood'] = avg > 0.4 ? 'good' : avg < -0.4 ? 'caution' : 'neutral';
    const lines = chosen.map((i) => `${i.card.name}${ori(i.reversed)}提示：${pick(i.card[domain], i.reversed)}`);
    return { domain, name: DOMAIN_NAMES[domain], focus: domain === focus, mood, text: `${lines.join('')}${DOMAIN_TIPS[domain][mood]}` };
  });
}

/* ---------------- 综合结论 ---------------- */

function narrative(spreadId: Reading['spread'], ins: CardInsight[]): string {
  const k = (i: number) => `「${kws(ins[i].card, ins[i].reversed)[0]}」`;
  switch (spreadId) {
    case 'single':
      return `${ins[0].card.name}${ori(ins[0].reversed)}给出的关键词是${k(0)}与「${kws(ins[0].card, ins[0].reversed)[1]}」。${essence(ins[0].card, ins[0].reversed)}`;
    case 'three':
      return `故事从${ins[0].card.name}的${k(0)}开始，走到如今${ins[1].card.name}的${k(1)}，并将走向${ins[2].card.name}所预示的${k(2)}——${trajectory(ins[2].tone - ins[0].tone)}。`;
    case 'love':
      return `在这段关系里，你处于${k(0)}，对方则是${k(1)}；你们之间真正需要跨越的是${k(2)}。若能正视它，关系将走向${k(3)}。`;
    case 'celtic':
      return `你的核心处境是${k(0)}，同时被${k(1)}所牵制；事情的根源在于${k(2)}，而过去的${k(3)}正在退场。接下来的发展是${k(5)}，最终指向${k(9)}。`;
  }
}

export function interpret(reading: Reading): Interpretation {
  const spread = SPREADS[reading.spread];
  const topic = TOPICS[reading.topic];
  const seed = hashString(reading.id);
  const ctx = { topic: reading.topic, domain: topic.domain };

  const insights: CardInsight[] = reading.cards
    .slice()
    .sort((a, b) => a.positionIndex - b.positionIndex)
    .map((d) => {
      const card = getCard(d.cardId);
      const position = spread.positions[d.positionIndex];
      return {
        position,
        card,
        reversed: d.reversed,
        keywords: kws(card, d.reversed),
        meaning: meaningOf(card, d.reversed),
        reading: readPosition(position, card, d.reversed, ctx),
        tone: toneOf(card, d.reversed),
      };
    });

  const placed: PlacedCard[] = insights.map((i) => ({ card: i.card, reversed: i.reversed }));
  const stats = computeStats(placed);
  const energy = energyAnalysis(placed, stats);
  const combos = findCombos(placed);
  const connections = buildConnections(reading.spread, insights);

  // 加权整体分数：结果、未来位置权重更高；阻碍位置本就预期偏负，权重降低
  let wsum = 0;
  let tsum = 0;
  for (const i of insights) {
    const w = lensWeight(i.position);
    wsum += w;
    tsum += i.tone * w;
  }
  const score = Math.round((tsum / wsum) * 100) / 100;
  const trend = trendOf(score);
  const title = seededPick(TREND_TITLES[trend], seed);

  const keyCard = chooseKeyCard(insights);
  const qNum = quintessence(placed);
  const qCard = getCard(`major-${String(qNum).padStart(2, '0')}`);
  const qText = `将所有牌的数字相加并约化，得到第 ${qNum} 号大阿尔卡那「${qCard.name}」。它是这次占卜的灵魂底色：${qCard.keywords.upright.slice(0, 3).join('、')}。${qCard.advice[0]}`;

  const domains = buildDomains(insights, topic.domain, keyCard.insight);

  // 建议来源：优先「建议」位置，其次结果/未来位置，最后关键牌
  const adviceIns =
    insights.find((i) => i.position.lens === 'advice') ??
    insights.find((i) => i.position.lens === 'outcome') ??
    insights.find((i) => i.position.lens === 'future') ??
    keyCard.insight;
  const finalAdvice = pick(adviceIns.card.advice, adviceIns.reversed);

  const questionLead = reading.question?.trim() ? `关于「${reading.question.trim()}」，` : '';
  const topicLead = reading.topic === 'daily' ? '今天的整体能量' : `这次${topic.name === '综合运势' ? '' : `关于${topic.name}的`}${spread.name}占卜`;

  const trendSentence: Record<TrendKey, string> = {
    bright: '牌面整体明亮而有力，顺流而行的时机已经到来。',
    rising: '虽然仍有需要留意的地方，但整体趋势向好，耐心会被回报。',
    balance: '吉与凶的力量大致相当，结果很大程度取决于你接下来的选择。',
    trial: '眼前存在真实的考验，但每一张挑战牌同时也指出了成长的方向。',
    rebirth: '牌面呈现深刻的考验与转化——旧的东西正在瓦解，而这恰恰是重建的前提。',
  };

  const conclusion: string[] = [];
  conclusion.push(`${questionLead}${topicLead}呈现出「${TREND_LABEL[trend]}」的走向。${trendSentence[trend]}`);
  conclusion.push(narrative(reading.spread, insights));
  if (insights.length > 1) {
    const ki = keyCard.insight;
    conclusion.push(`本次占卜的关键牌是${cardLabel(ki.card, ki.reversed)}。${keyCard.reason}${essence(ki.card, ki.reversed)}`);
  }
  if (stats.dominantElement && insights.length > 1) {
    conclusion.push(`牌阵以${ELEMENT_NAMES[stats.dominantElement]}元素为主调，这意味着解决问题的突破口在于${ELEMENT_DOMINANT_KEY[stats.dominantElement]}。`);
  }
  if (combos.length > 0) conclusion.push(`值得特别注意的是「${combos[0].title}」的组合：${combos[0].text}`);
  conclusion.push(`综合来看，塔罗给你的核心建议是：${finalAdvice}${CLOSINGS[trend]}`);

  const summary = `${TREND_LABEL[trend]} · 关键牌「${keyCard.insight.card.name}」${ori(keyCard.insight.reversed)} · ${finalAdvice}`;

  const result: Interpretation = {
    title,
    trend,
    trendLabel: TREND_LABEL[trend],
    score,
    summary,
    insights,
    stats,
    energy,
    connections,
    combos,
    keyCard,
    quintessence: { card: qCard, text: qText },
    conclusion,
    domains,
    finalAdvice,
  };

  if (reading.topic === 'daily' || reading.spread === 'single') {
    const c = insights[0].card;
    result.daily = {
      color: ELEMENT_COLOR[c.element],
      number: ((c.number + (insights[0].reversed ? 3 : 0)) % 9) + 1,
      mantra: kws(c, insights[0].reversed)[0],
    };
  }
  return result;
}

const ELEMENT_DOMINANT_KEY: Record<string, string> = {
  fire: '果断的行动与重新点燃的热情',
  water: '倾听内心的感受，修复与人之间的情感连结',
  air: '理清思路、坦诚沟通，并做出清晰的判断',
  earth: '务实的计划、稳定的节奏，以及对身体与资源的照顾',
};

const CLOSINGS: Record<TrendKey, string> = {
  bright: '星辰站在你这一边，放心前行。',
  rising: '光已经在前方，保持步伐即可。',
  balance: '天平的另一端，由你亲手放上砝码。',
  trial: '风暴会过去，而你会比从前更坚韧。',
  rebirth: '长夜终将过去，灰烬里会长出新的自己。',
};

/** 纯文本导出（复制/分享用） */
export function interpretationToText(reading: Reading, it: Interpretation): string {
  const spread = SPREADS[reading.spread];
  const topic = TOPICS[reading.topic];
  const date = new Date(reading.createdAt).toLocaleString('zh-CN', { hour12: false });
  const lines: string[] = [];
  lines.push(`✦ ARCANA 塔罗占卜 · ${it.title} ✦`);
  lines.push(`${topic.name} · ${spread.name} · ${date}`);
  if (reading.question) lines.push(`问题：${reading.question}`);
  lines.push('');
  lines.push('【抽到的牌】');
  for (const i of it.insights) {
    lines.push(`· ${i.position.label}：${i.card.name}（${ori(i.reversed)}）— ${i.keywords.slice(0, 3).join('、')}`);
    lines.push(`  ${i.reading}`);
  }
  lines.push('');
  lines.push(`【综合结论 · ${it.trendLabel}】`);
  it.conclusion.forEach((p) => lines.push(p));
  lines.push('');
  lines.push('【生活建议】');
  it.domains.forEach((d) => lines.push(`· ${d.name}：${d.text}`));
  lines.push('');
  lines.push(`灵数牌：${it.quintessence.card.name}`);
  lines.push('— 来自 ARCANA · 塔罗只照亮可能，选择永远在你手中 —');
  return lines.join('\n');
}
