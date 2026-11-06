import { BookOpen, History, Home, Settings, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '../../lib/router';

const ITEMS = [
  { to: '/', label: '首页', icon: Home, match: (p: string) => p === '/' },
  { to: '/daily', label: '每日', icon: Sun, match: (p: string) => p.startsWith('/daily') },
  { to: '/library', label: '图鉴', icon: BookOpen, match: (p: string) => p.startsWith('/library') },
  { to: '/history', label: '历史', icon: History, match: (p: string) => p.startsWith('/history') || p.startsWith('/result') },
  { to: '/settings', label: '设置', icon: Settings, match: (p: string) => p.startsWith('/settings') },
];

export function TopNav({ path }: { path: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 hidden md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
            <circle cx="20" cy="20" r="17" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
            <path d="M25 6a14 14 0 1 0 0 28a11 11 0 1 1 0-28z" fill="var(--gold)" />
          </svg>
          <span className="font-display text-lg tracking-[0.4em] text-gold-gradient">ARCANA</span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-2 py-1.5 backdrop-blur-md">
          {ITEMS.map((it) => {
            const active = it.match(path);
            return (
              <Link key={it.to} to={it.to} className="relative rounded-full px-4 py-1.5 text-sm tracking-widest transition-colors" aria-current={active ? 'page' : undefined}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] ring-1 ring-[var(--gold)]/40" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className={`relative ${active ? 'text-gold-bright' : 'text-ink-dim hover:text-gold'}`}>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function BottomNav({ path }: { path: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--bg-0)_82%,transparent)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((it) => {
          const active = it.match(path);
          const Icon = it.icon;
          return (
            <Link key={it.to} to={it.to} className="flex flex-col items-center gap-1 py-2.5 text-[11px] tracking-widest" aria-current={active ? 'page' : undefined}>
              <Icon size={20} strokeWidth={1.5} className={active ? 'text-gold-bright drop-shadow-[0_0_6px_var(--glow)]' : 'text-ink-faint'} />
              <span className={active ? 'text-gold' : 'text-ink-faint'}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
