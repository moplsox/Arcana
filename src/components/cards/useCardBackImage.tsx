import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CardBack } from './CardBack';

/**
 * 把牌背 SVG 序列化成一张图片（data URL）。
 * 扇形里有 78 张牌，若每张都是内联 SVG（含渐变和图案），拖动时浏览器需要反复栅格化；
 * 换成同一张 <img> 后只需合成位图，移动端拖动明显更流畅。
 * 主题色来自 CSS 变量，序列化时替换为当前的计算值。
 */
export function useCardBackImage(themeKey: string): [string | null, ReactNode] {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const cs = getComputedStyle(document.documentElement);
    let markup = svg.outerHTML
      .replace(/var\(--card-back-0[^)]*\)/g, cs.getPropertyValue('--card-back-0').trim() || '#2d1d55')
      .replace(/var\(--card-back-1[^)]*\)/g, cs.getPropertyValue('--card-back-1').trim() || '#0b0718');
    if (!markup.includes('xmlns=')) markup = markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    setUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
  }, [themeKey]);

  const hidden = (
    <div ref={ref} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden' }}>
      <CardBack />
    </div>
  );
  return [url, hidden];
}
