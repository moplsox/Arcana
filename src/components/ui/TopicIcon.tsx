import { Briefcase, Coins, GraduationCap, Heart, Sparkles, Sun } from 'lucide-react';
import type { TopicId } from '../../types/tarot';

const ICONS = { general: Sparkles, love: Heart, career: Briefcase, study: GraduationCap, wealth: Coins, daily: Sun } as const;

export function TopicIcon({ topic, size = 22, className }: { topic: TopicId; size?: number; className?: string }) {
  const Icon = ICONS[topic];
  return <Icon size={size} strokeWidth={1.4} className={className} />;
}
