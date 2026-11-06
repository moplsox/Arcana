import { useEffect, useRef } from 'react';

interface Props {
  /** 关闭时只绘制静态星空 */
  animated: boolean;
  /** 粒子密度倍率 */
  density?: number;
}

interface StarP { x: number; y: number; r: number; tw: number; sp: number; hue: number }
interface Mote { x: number; y: number; r: number; vx: number; vy: number; life: number; max: number }
interface Meteor { x: number; y: number; vx: number; vy: number; life: number }

/**
 * Canvas 星空：闪烁星点 + 上浮的金色光尘 + 偶发流星。
 * 根据屏幕面积自适应数量，页面隐藏时暂停以节省电量。
 */
export function StarField({ animated, density = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1;
    let stars: StarP[] = [];
    let motes: Mote[] = [];
    let meteors: Meteor[] = [];
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(((w * h) / 5200) * density);
      stars = Array.from({ length: Math.min(count, 420) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() ** 2.2 * 1.6 + 0.25,
        tw: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.6,
        hue: Math.random() < 0.15 ? 40 : Math.random() < 0.5 ? 250 : 220,
      }));
      motes = [];
      if (!animated) drawStatic();
    };

    const spawnMote = (): Mote => ({
      x: Math.random() * w,
      y: h + 10,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 8,
      vy: -(8 + Math.random() * 22),
      life: 0,
      max: 8 + Math.random() * 10,
    });

    const drawStars = (t: number) => {
      for (const s of stars) {
        const a = animated ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.tw)) : 0.7;
        ctx.beginPath();
        ctx.fillStyle = s.hue === 40 ? `rgba(255,226,160,${a})` : `hsla(${s.hue},60%,88%,${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.3) {
          ctx.globalAlpha = a * 0.35;
          ctx.fillRect(s.x - s.r * 3, s.y - 0.3, s.r * 6, 0.6);
          ctx.fillRect(s.x - 0.3, s.y - s.r * 3, 0.6, s.r * 6);
          ctx.globalAlpha = 1;
        }
      }
    };

    function drawStatic() {
      ctx!.clearRect(0, 0, w, h);
      drawStars(0);
    }

    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      ctx.clearRect(0, 0, w, h);
      drawStars(t);

      // 光尘
      const target = Math.round(((w * h) / 26000) * density);
      if (motes.length < target && Math.random() < 0.3) motes.push(spawnMote());
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      motes = motes.filter((m) => {
        m.life += dt;
        m.x += m.vx * dt + Math.sin((m.life + m.r) * 1.3) * 0.25;
        m.y += m.vy * dt;
        const k = m.life / m.max;
        const alpha = Math.sin(Math.PI * Math.min(k, 1)) * 0.75;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0, `rgba(255,230,170,${alpha})`);
        g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fill();
        return m.life < m.max && m.y > -20;
      });

      // 流星
      if (Math.random() < 0.0025 && meteors.length < 2) {
        const sx = Math.random() * w * 0.8 + w * 0.2;
        meteors.push({ x: sx, y: Math.random() * h * 0.4, vx: -(420 + Math.random() * 300), vy: 160 + Math.random() * 120, life: 0 });
      }
      meteors = meteors.filter((m) => {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const len = 0.12;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * len, m.y - m.vy * len);
        grad.addColorStop(0, `rgba(255,245,215,${Math.max(0, 0.9 - m.life)})`);
        grad.addColorStop(1, 'rgba(255,245,215,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * len, m.y - m.vy * len);
        ctx.stroke();
        return m.life < 1.2;
      });
      ctx.restore();
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && animated) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    if (animated) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [animated, density]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}
