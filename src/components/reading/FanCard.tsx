import { motion, useTransform, type MotionValue } from 'framer-motion';
import { memo } from 'react';
import { CardBack } from '../cards/CardBack';
import { fanPosition, type FanGeometry } from './layout';

interface Props {
  index: number;
  total: number;
  geo: FanGeometry;
  offset: MotionValue<number>;
  progress: MotionValue<number>;
  liftIdx: MotionValue<number>;
  liftY: MotionValue<number>;
  origin: { x: number; y: number };
  /** 预先栅格化的牌背图片 */
  backUrl: string | null;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** 每张牌在 [start, start+0.5] 区间内完成从牌堆到扇形的过渡，形成依次展开的效果 */
export function localProgress(p: number, index: number, total: number) {
  const start = (index / total) * 0.5;
  return easeOut(Math.min(1, Math.max(0, (p - start) / 0.5)));
}

export function fanCardPose(geo: FanGeometry, index: number, total: number, o: number, p: number, origin: { x: number; y: number }) {
  const t = localProgress(p, index, total);
  const f = fanPosition(geo, index, total, o);
  return { x: origin.x + (f.x - origin.x) * t, y: origin.y + (f.y - origin.y) * t, rotate: f.rotate * t, t };
}

/** 扇形中的一张牌，位置完全由 MotionValue 驱动，拖动牌扇时不触发 React 重渲染 */
export const FanCard = memo(function FanCard({ index, total, geo, offset, progress, liftIdx, liftY, origin, backUrl }: Props) {
  const x = useTransform([offset, progress] as MotionValue<number>[], ([o, p]: number[]) => fanCardPose(geo, index, total, o, p, origin).x - geo.cardW / 2);
  const y = useTransform([offset, progress, liftIdx, liftY] as MotionValue<number>[], ([o, p, li, ly]: number[]) => {
    const pose = fanCardPose(geo, index, total, o, p, origin);
    return pose.y - geo.cardH / 2 + (li === index ? ly : 0);
  });
  const rotate = useTransform([offset, progress] as MotionValue<number>[], ([o, p]: number[]) => fanCardPose(geo, index, total, o, p, origin).rotate);
  const opacity = useTransform(progress, (p) => (p <= 0.001 ? 0 : 1));

  return (
    <motion.div
      data-idx={index}
      className="absolute left-0 top-0 cursor-pointer select-none"
      style={{ x, y, rotate, opacity, width: geo.cardW, height: geo.cardH, zIndex: index + 1, transformOrigin: '50% 60%', willChange: 'transform' }}
    >
      <div className="hover-glow card-thickness h-full w-full overflow-hidden rounded-[7%/4.2%]">
        {backUrl ? (
          <img src={backUrl} alt="" draggable={false} className="pointer-events-none block h-full w-full select-none" />
        ) : (
          <CardBack className="pointer-events-none block h-full w-full" />
        )}
      </div>
    </motion.div>
  );
});
