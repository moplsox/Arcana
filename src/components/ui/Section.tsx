import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

/** 页面容器：统一的顶部留白（避开导航）与底部留白（避开手机底栏） */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-16 md:pt-24 ${className}`}>{children}</div>;
}

export function PageTitle({ en, title, sub }: { en: string; title: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 text-center">
      <div className="font-display text-xs tracking-[0.5em] text-gold-deep">{en}</div>
      <h1 className="mt-2 font-cn text-3xl tracking-[0.3em] text-gold-gradient sm:text-4xl">{title}</h1>
      {sub && <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">{sub}</p>}
      <div className="divider-ornament mx-auto mt-5 max-w-xs text-xs">✦</div>
    </motion.div>
  );
}

/** 逐段淡入 */
export function FadeIn({ delay = 0, children, className, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
