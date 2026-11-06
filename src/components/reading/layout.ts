/** 抽牌场景的几何计算（纯函数，便于推理与调试） */
import type { Spread } from '../../types/tarot';

export const CARD_RATIO = 1.7;

export interface FanGeometry {
  cardW: number;
  cardH: number;
  cx: number;
  /** 中间那张牌的中心 y */
  baseY: number;
  R: number;
  step: number;
  /** 允许左右拨动的最大偏移（弧度） */
  maxOffset: number;
  top: number;
}

export interface SlotGeometry {
  cardW: number;
  slots: { x: number; y: number; rotate: number }[];
  labels: boolean;
}

export const isCompact = (w: number) => w < 640;

export function headerHeight(w: number) {
  return isCompact(w) ? 92 : 120;
}

export function fanGeometry(w: number, h: number, total: number): FanGeometry {
  const compact = isCompact(w);
  const cardW = Math.max(52, Math.min(86, w / 15, h / 9.5));
  const cardH = cardW * CARD_RATIO;
  const baseY = h - cardH / 2 - (compact ? 22 : 34);
  const R = compact ? Math.max(620, w * 1.6) : Math.max(900, w * 0.95);
  const spacing = compact ? 17 : Math.max(10, Math.min(18, (w * 0.86 - cardW) / (total - 1)));
  const step = spacing / R;
  const totalAngle = step * (total - 1);
  const visible = 2 * Math.asin(Math.min(1, (w / 2 - cardW * 0.6) / R));
  const maxOffset = Math.max(0, (totalAngle - visible) / 2 + step * 2);
  return { cardW, cardH, cx: w / 2, baseY, R, step, maxOffset, top: baseY - cardH / 2 - 26 };
}

export function fanPosition(g: FanGeometry, i: number, total: number, offset: number) {
  const theta = (i - (total - 1) / 2) * g.step + offset;
  return {
    x: g.cx + g.R * Math.sin(theta),
    y: g.baseY + g.R * (1 - Math.cos(theta)),
    rotate: (theta * 180) / Math.PI,
  };
}

/** 在给定矩形区域内放置牌阵 */
export function slotGeometry(spread: Spread, region: { x: number; y: number; w: number; h: number }, maxW: number): SlotGeometry {
  const pos = spread.positions;
  const labels = spread.id !== 'celtic';
  const xs = pos.map((p) => p.x);
  const ys = pos.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = maxX - minX + 1.08;
  const spanY = maxY - minY + 1.04;
  const labelSpace = labels ? 44 : 0;
  const cardW = Math.max(36, Math.min(maxW, region.w / spanX, (region.h - labelSpace * (spread.id === 'love' ? 1.4 : 1)) / (spanY * CARD_RATIO)));
  const cx = region.x + region.w / 2 - ((minX + maxX) / 2) * cardW;
  const cy = region.y + (region.h - (labels ? labelSpace * 0.6 : 0)) / 2 - ((minY + maxY) / 2) * cardW * CARD_RATIO;
  return {
    cardW,
    labels,
    slots: pos.map((p) => ({ x: cx + p.x * cardW, y: cy + p.y * cardW * CARD_RATIO, rotate: p.rotate ?? 0 })),
  };
}
