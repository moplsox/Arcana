/**
 * 位置视角：同一张牌在不同牌阵位置上被"如何阅读"。
 * 这是让解读不只是牌义拼接的第一步——牌义 × 位置 = 情境化的讯息。
 */
import type { Domain, SpreadPosition, TarotCard, TopicId } from '../../types/tarot';
import { essence, kws, pick, toneOf } from './helpers';

export interface LensContext {
  topic: TopicId;
  domain?: Domain;
}

function domainLine(c: TarotCard, r: boolean, ctx: LensContext): string {
  if (ctx.domain) return pick(c[ctx.domain], r);
  return essence(c, r);
}

const byTone = (t: number, pos: string, neg: string, neu: string) => (t > 0 ? pos : t < 0 ? neg : neu);

const q = (s: string | undefined) => (s ? `「${s}」` : '');

function joinKw(k: string[], n = 2): string {
  return k.slice(0, n).map((x) => `「${x}」`).join('与');
}

export function readPosition(pos: SpreadPosition, c: TarotCard, r: boolean, ctx: LensContext): string {
  const k = kws(c, r);
  const t = toneOf(c, r);
  const d = domainLine(c, r, ctx);
  const nm = `${c.name}`;

  switch (pos.lens) {
    case 'state': {
      const intro = ctx.topic === 'daily' ? `今天陪伴你的是${nm}，` : `此刻浮现的是${nm}，`;
      return (
        intro +
        `它带来的核心讯息是${joinKw(k)}。${d}` +
        byTone(t, '这是一股顺流的能量，适合主动去做。', '它点出了需要正视的课题——看见它，本身就是转变的开始。', '它不预示好坏，而是请你留意事情正在发生的微妙变化。')
      );
    }
    case 'past':
      return (
        `过去，${nm}的能量塑造了今天的局面，关键词是${joinKw(k)}。` +
        byTone(
          t,
          '那是一段为你打下基础的经历，它留下的经验与资源至今仍可调用。',
          '那段经历的影响尚未完全散去，理解它，才能不再被它牵引。',
          '它更像一段酝酿与过渡，把你带到了现在的路口。',
        )
      );
    case 'present':
      return (
        `当下，你正处在${q(k[0])}的状态之中。${d}` +
        byTone(t, '眼下的能量对你有利，适合主动把握。', '这正是你需要直面的核心课题，回避只会让它反复出现。', '局面仍在变化中，你的选择将决定它倒向哪一边。')
      );
    case 'future':
      return (
        `若沿着目前的轨迹前进，接下来将迎来${joinKw(k)}。${d}` +
        byTone(t, '这是令人期待的走向，保持现在的努力即可。', '但这不是注定的结局，而是一则提醒：现在调整，结果仍可改写。', '最终结果取决于你如何回应即将到来的变化。')
      );
    case 'obstacle':
      if (t > 0) {
        return `${nm}本是一张象征${q(k[0])}的牌，却落在阻碍的位置——问题恰恰出在"过犹不及"：对${q(k[0])}的过度追求或依赖，反而成了绊脚石。也可能是你还没准备好接住这份能量。`;
      }
      return (
        `阻碍的本质是${joinKw(k)}。` +
        (r
          ? '逆位显示这份阻力多半来自内在——情绪、信念或尚未处理的心结，比外部环境更值得关注。'
          : '正位显示它是一个现实存在、需要正面应对的问题，绕开它只会让代价更高。')
      );
    case 'advice':
      return r
        ? `塔罗给你的建议是：${pick(c.advice, r)}逆位的${nm}像一面镜子，提醒你避开${joinKw(k)}的陷阱，把它们反过来，就是你的行动方向。`
        : `塔罗给你的建议是：${pick(c.advice, r)}以${nm}的精神行事——${k.slice(0, 3).join('、')}。`;
    case 'self':
      return (
        `你在这件事中呈现出${nm}的姿态：${k.slice(0, 2).join('、')}。${d}` +
        byTone(t, '你的状态本身就是此事最大的资源。', '你可能比自己意识到的更疲惫或不安，先照顾好自己。', '你仍在观察与权衡，尚未完全投入。')
      );
    case 'other':
      return (
        `对方内心的状态如同${nm}——${q(k[0])}。${d}` +
        byTone(t, '对方对你与这段关系抱持着积极的态度。', '对方此刻有自己的顾虑与挣扎，这未必是针对你。', '对方的心意尚在观望之中，还没有下定论。')
      );
    case 'foundation':
      return (
        `在更深的层面，这件事的根基是${joinKw(k)}。这是潜意识里的驱动力，往往比表面的理由更真实。` +
        byTone(t, '这份根基是稳固的，可以依靠。', '根基中埋着需要疗愈的部分，问题的源头可能就在这里。', '')
      );
    case 'conscious':
      return (
        `你有意识追求的目标是${q(k[0])}。` +
        byTone(t, '这是一个值得追求、且在你能力范围之内的方向。', '但这个目标可能夹杂着恐惧或压力，值得重新问自己：你真正想要的是什么？', '这个目标尚未成形，值得你花时间把它想清楚。')
      );
    case 'environment':
      return (
        `外部环境与周围的人呈现${nm}的能量：${k.slice(0, 2).join('、')}。` +
        byTone(t, '周围存在可以借助的支持，不必独自承担。', '环境中存在干扰或阻力，需要设立边界、保护自己的能量。', '外界的影响有限，关键仍在你自己。')
      );
    case 'hope':
      return t >= 0
        ? `你内心所期盼的，是${q(k[0])}。这份期盼本身就是推动你前进的力量——同时也要留意，期待越高，越怕落空。`
        : `你内心所恐惧的，是${q(k[0])}。恐惧揭示了你最在乎的东西——承认它，它就失去了一半的力量。`;
    case 'outcome':
      return (
        `综合所有因素，最可能的结果是${joinKw(k)}。${d}` +
        byTone(t, '这是一个令人欣慰的结局，你的努力会被回报。', '结果带有考验的意味，但塔罗呈现的是趋势而非宿命——你仍有空间调整。', '结果并非非黑即白，它会以你意想不到的方式展开。')
      );
  }
}
