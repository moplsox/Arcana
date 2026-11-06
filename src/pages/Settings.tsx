import { Download, Eye, EyeOff, Upload } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Page, PageTitle } from '../components/ui/Section';
import { AI_MODELS } from '../engine/ai';
import { useToast } from '../lib/toast';
import { useApp, type AppState, type ThemeId } from '../store/AppStore';

const THEMES: { id: ThemeId; name: string; desc: string; swatch: string[] }[] = [
  { id: 'midnight', name: '午夜紫', desc: '暗紫星空 · 金色', swatch: ['#120c26', '#2d1d55', '#e2c27a'] },
  { id: 'abyss', name: '深海蓝', desc: '午夜深蓝 · 银色', swatch: ['#071628', '#12325a', '#cfd8e6'] },
  { id: 'crimson', name: '血月红', desc: '暗红魅影 · 玫瑰金', swatch: ['#1d0a10', '#4d1426', '#e7b77a'] },
];

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--panel-border)] py-4 last:border-0">
      <div className="min-w-0">
        <div className="text-[15px] tracking-wider">{title}</div>
        {desc && <div className="mt-0.5 text-xs leading-5 text-ink-dim">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition ${checked ? 'border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_35%,transparent)]' : 'border-[var(--panel-border)] bg-white/5'}`}
    >
      <span className={`absolute top-0.5 h-5.5 w-5.5 rounded-full transition-all ${checked ? 'left-6 bg-[var(--gold-bright)] shadow-[0_0_10px_var(--glow)]' : 'left-0.5 bg-ink-faint'}`} />
    </button>
  );
}

export function Settings() {
  const { state, updateSettings, resetAll, importState } = useApp();
  const s = state.settings;
  const toast = useToast();
  const [showKey, setShowKey] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data: AppState = { ...state, settings: { ...state.settings, ai: { ...state.settings.ai, apiKey: '' } } };
    const blob = new Blob([JSON.stringify({ app: 'arcana', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcana-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('数据已导出（不含 API Key）');
  };

  const importData = async (file: File) => {
    try {
      const json = JSON.parse(await file.text());
      const d = json?.data as AppState | undefined;
      if (json?.app !== 'arcana' || !d || !Array.isArray(d.history) || !Array.isArray(d.favorites)) throw new Error('bad');
      importState({
        settings: { ...state.settings, ...d.settings, ai: { ...state.settings.ai, ...(d.settings?.ai ?? {}), apiKey: state.settings.ai.apiKey } },
        history: d.history,
        favorites: d.favorites,
        daily: Array.isArray(d.daily) ? d.daily : [],
      });
      toast(`已导入 ${d.history.length} 条记录`);
    } catch {
      toast('导入失败：文件格式不正确');
    }
  };

  return (
    <Page className="max-w-2xl">
      <PageTitle en="SANCTUM" title="设置" sub="所有设置与数据只保存在你的浏览器本地。" />

      <section className="panel mb-6 p-5">
        <h2 className="mb-3 text-sm tracking-[0.3em] text-gold">主题</h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => updateSettings({ theme: t.id })} aria-pressed={s.theme === t.id} className={`rounded-2xl border p-3 text-left transition ${s.theme === t.id ? 'border-[var(--gold)] shadow-[0_0_20px_var(--glow)]' : 'border-[var(--panel-border)] hover:border-[var(--gold)]/60'}`}>
              <div className="flex gap-1">
                {t.swatch.map((c) => <span key={c} className="h-5 w-5 rounded-full ring-1 ring-white/10" style={{ background: c }} />)}
              </div>
              <div className="mt-2 text-sm tracking-wider">{t.name}</div>
              <div className="text-[11px] text-ink-dim">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel mb-6 px-5 py-1">
        <h2 className="pt-4 text-sm tracking-[0.3em] text-gold">占卜</h2>
        <Row title="启用逆位" desc="关闭后所有牌都以正位出现（部分流派不使用逆位）。">
          <Toggle label="启用逆位" checked={s.allowReversed} onChange={(v) => updateSettings({ allowReversed: v })} />
        </Row>
        <Row title="自动依次翻牌" desc="选完牌后自动逐张揭晓，而不是手动点击。">
          <Toggle label="自动依次翻牌" checked={s.autoReveal} onChange={(v) => updateSettings({ autoReveal: v })} />
        </Row>
      </section>

      <section className="panel mb-6 px-5 py-1">
        <h2 className="pt-4 text-sm tracking-[0.3em] text-gold">视觉与性能</h2>
        <Row title="星空粒子" desc="背景的闪烁星点、光尘与流星。低端设备可关闭以省电。">
          <Toggle label="星空粒子" checked={s.particles} onChange={(v) => updateSettings({ particles: v })} />
        </Row>
        <Row title="减少动效" desc="缩短洗牌、翻牌等动画并停止魔法阵旋转。系统开启「减弱动态效果」时自动生效。">
          <Toggle label="减少动效" checked={s.motion === 'reduced'} onChange={(v) => updateSettings({ motion: v ? 'reduced' : 'full' })} />
        </Row>
      </section>

      <section className="panel mb-6 px-5 py-1">
        <h2 className="pt-4 text-sm tracking-[0.3em] text-gold">AI 深度解读（可选）</h2>
        <Row title="启用 Claude 解读" desc="在结果页额外请求 Claude 生成叙事式解读。需要你自己的 Anthropic API Key，费用由该 Key 承担。">
          <Toggle label="启用 Claude 解读" checked={s.ai.enabled} onChange={(v) => updateSettings({ ai: { ...s.ai, enabled: v } })} />
        </Row>
        {s.ai.enabled && (
          <div className="space-y-3 pb-5">
            <label className="block">
              <span className="text-xs text-ink-dim">API Key</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-white/[0.03] px-3 py-2 focus-within:border-[var(--gold)]">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={s.ai.apiKey}
                  onChange={(e) => updateSettings({ ai: { ...s.ai, apiKey: e.target.value } })}
                  placeholder="sk-ant-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-ink-faint"
                />
                <button onClick={() => setShowKey((v) => !v)} className="text-ink-dim hover:text-gold" aria-label={showKey ? '隐藏' : '显示'}>
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs text-ink-dim">模型</span>
              <select value={s.ai.model} onChange={(e) => updateSettings({ ai: { ...s.ai, model: e.target.value } })} className="mt-1 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--bg-1)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]">
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
            <p className="text-xs leading-5 text-ink-faint">
              ⚠ Key 仅保存在本机浏览器的 LocalStorage 中，并由浏览器直接发送到 api.anthropic.com。请勿在公共设备上保存。若要公开部署，建议在后端实现同样的 `InterpretationProvider` 接口代为调用。
            </p>
          </div>
        )}
      </section>

      <section className="panel mb-6 px-5 py-1">
        <h2 className="pt-4 text-sm tracking-[0.3em] text-gold">数据</h2>
        <Row title="导出数据" desc={`${state.history.length} 条占卜记录 · ${state.favorites.length} 张收藏（不含 API Key）`}>
          <button className="btn-ghost shrink-0 px-3! py-1.5! text-sm" onClick={exportData}><Download size={15} /> 导出</button>
        </Row>
        <Row title="导入数据" desc="从之前导出的备份文件恢复，会覆盖当前记录。">
          <button className="btn-ghost shrink-0 px-3! py-1.5! text-sm" onClick={() => fileRef.current?.click()}><Upload size={15} /> 导入</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ''; }} />
        </Row>
        <Row title="重置全部数据" desc="清除记录、收藏和所有设置。">
          <button
            className="btn-ghost shrink-0 px-3! py-1.5! text-sm text-[#e8a07a]!"
            onClick={() => {
              if (window.confirm('确定要清除全部数据吗？此操作不可撤销。')) {
                resetAll();
                toast('已重置');
              }
            }}
          >
            重置
          </button>
        </Row>
      </section>
      <p className="text-center text-xs text-ink-faint">ARCANA v1.0 · 78 张牌 · 4 种牌阵 · 本地解读引擎</p>
    </Page>
  );
}
