/**
 * AI 解读接口（可选）。
 *
 * 默认使用本地解读引擎；用户在「设置」中填写自己的 Anthropic API Key 后，
 * 结果页可请求 Claude 生成一段更自由的深度解读。
 *
 * 设计要点：
 * - `InterpretationProvider` 是统一接口，未来可替换为自建后端代理（推荐生产环境这样做，
 *   避免在浏览器中暴露密钥），只需实现同一接口。
 * - SDK 通过动态 import 加载，未启用 AI 的用户不会下载这部分代码。
 * - 本地引擎的结构化分析会作为上下文交给模型，让 AI 解读与牌面逻辑保持一致。
 */
import type { Reading } from '../types/tarot';
import { getCard } from '../data/deck';
import { SPREADS, TOPICS } from '../data/spreads';
import type { Interpretation } from './interpret';

export interface InterpretationProvider {
  readonly id: string;
  interpret(reading: Reading, local: Interpretation, opts: { onText?: (fullText: string) => void; signal?: AbortSignal }): Promise<string>;
}

export const AI_MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5（默认 · 解读最细腻）' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5（更快 · 更省）' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5（最快 · 最省）' },
] as const;

const SYSTEM_PROMPT = `你是一位温柔、睿智、富有洞察力的塔罗解读师，使用简体中文写作。
你会收到一次塔罗占卜的完整信息：主题、问题、牌阵、每个位置抽到的牌（含正逆位），以及本地解读引擎已经算好的结构化分析（元素关系、能量趋势、关键牌、灵数牌）。
请在这些分析的基础上，写一段连贯、有层次的深度解读：
1. 先用一两句话点明这次占卜的核心主题；
2. 把牌与牌之间的关系串成一个有因果的故事，而不是逐张罗列牌义；
3. 结合用户的具体问题给出可执行的建议；
4. 结尾一句温暖而有力量的话。
要求：600-900 字，分 4-6 段，可以使用少量 **加粗** 强调，不要使用标题和列表符号。
塔罗是自我觉察的工具而非宿命预言：不要做医疗、法律、投资等专业领域的确定性判断，涉及这些时提醒用户寻求专业意见。`;

export function buildPrompt(reading: Reading, it: Interpretation): string {
  const spread = SPREADS[reading.spread];
  const lines: string[] = [];
  lines.push(`主题：${TOPICS[reading.topic].name}`);
  lines.push(`牌阵：${spread.name}（${spread.positions.length} 张）`);
  lines.push(`问题：${reading.question?.trim() || '（未填写具体问题，请做整体解读）'}`);
  lines.push('');
  lines.push('【抽到的牌】');
  for (const d of [...reading.cards].sort((a, b) => a.positionIndex - b.positionIndex)) {
    const c = getCard(d.cardId);
    const pos = spread.positions[d.positionIndex];
    lines.push(`- ${pos.label}（${pos.meaning}）：${c.name} ${c.nameEn}，${d.reversed ? '逆位' : '正位'}；关键词：${(d.reversed ? c.keywords.reversed : c.keywords.upright).join('、')}`);
  }
  lines.push('');
  lines.push('【本地引擎分析】');
  lines.push(`整体趋势：${it.trendLabel}（加权能量分 ${it.score}）`);
  lines.push(`关键牌：${it.keyCard.insight.card.name}（${it.keyCard.reason}）`);
  lines.push(`灵数牌：${it.quintessence.card.name}`);
  it.energy.forEach((e) => lines.push(`- ${e}`));
  it.connections.forEach((c) => lines.push(`- ${c.title}：${c.text}`));
  it.combos.forEach((c) => lines.push(`- 组合「${c.title}」：${c.text}`));
  return lines.join('\n');
}

export class ClaudeProvider implements InterpretationProvider {
  readonly id = 'claude';
  constructor(private apiKey: string, private model: string) {}

  async interpret(reading: Reading, local: Interpretation, opts: { onText?: (t: string) => void; signal?: AbortSignal } = {}): Promise<string> {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    // 注意：浏览器直连会把密钥留在本机浏览器中。生产环境建议改为由后端代理实现此接口。
    const client = new Anthropic({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });
    // Haiku 没有服务端 fallback；其余模型在安全分类器拒绝时自动改由兼容模型继续
    const supportsFallback = !this.model.startsWith('claude-haiku');
    const stream = client.beta.messages.stream(
      {
        model: this.model,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        output_config: { effort: 'medium' },
        messages: [{ role: 'user', content: buildPrompt(reading, local) }],
        ...(supportsFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      },
      { signal: opts.signal },
    );
    let text = '';
    stream.on('text', (delta) => {
      text += delta;
      opts.onText?.(text);
    });
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      throw new Error('模型拒绝了这次请求，请调整问题后重试。');
    }
    const out = final.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('');
    return out || text;
  }
}

/** 将常见错误翻译成用户可理解的中文 */
export async function describeAIError(err: unknown): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  if (err instanceof Anthropic.AuthenticationError) return 'API Key 无效，请在设置中检查。';
  if (err instanceof Anthropic.PermissionDeniedError) return '该 API Key 没有调用此模型的权限。';
  if (err instanceof Anthropic.RateLimitError) return '请求过于频繁，请稍后再试。';
  if (err instanceof Anthropic.BadRequestError) return `请求参数有误：${err.message}`;
  if (err instanceof Anthropic.APIConnectionError) return '无法连接到 Claude API，请检查网络。';
  if (err instanceof Anthropic.APIError) return `API 错误（${err.status ?? '未知'}）：${err.message}`;
  if (err instanceof Error && err.name === 'AbortError') return '已取消。';
  return err instanceof Error ? err.message : '未知错误';
}
