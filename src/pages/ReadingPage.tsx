import { useEffect, useState } from 'react';
import { DrawScene } from '../components/reading/DrawScene';
import { SPREADS, TOPICS } from '../data/spreads';
import { navigate } from '../lib/router';
import { useApp } from '../store/AppStore';
import type { SpreadId, TopicId } from '../types/tarot';

export function ReadingPage({ query }: { query: URLSearchParams }) {
  const { todayDaily } = useApp();
  const topicQ = query.get('topic') as TopicId | null;
  const spreadQ = query.get('spread') as SpreadId | null;
  const topic: TopicId = topicQ && TOPICS[topicQ] ? topicQ : 'general';
  const spread: SpreadId = topic === 'daily' ? 'single' : spreadQ && SPREADS[spreadQ] ? spreadQ : TOPICS[topic].spreads[0];
  const question = query.get('q') ?? undefined;
  // 仅在进入页面时检查一次，避免本次抽完保存后被立即重定向
  const [existingDaily] = useState(() => (topic === 'daily' ? todayDaily() : undefined));

  // 每日一抽：今天已经抽过则直接查看
  useEffect(() => {
    if (existingDaily) navigate(`/result/${existingDaily.id}`, { replace: true });
  }, [existingDaily]);
  if (existingDaily) return null;

  // key 保证"重新占卜"时整个场景重置
  return <DrawScene key={`${topic}-${spread}-${question ?? ''}-${query.get('r') ?? ''}`} topic={topic} spreadId={spread} question={question} />;
}
