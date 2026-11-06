import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { StarField } from './components/background/StarField';
import { BottomNav, TopNav } from './components/layout/Nav';
import { matchPath, useLocation } from './lib/router';
import { ToastProvider } from './lib/toast';
import { Daily } from './pages/Daily';
import { History } from './pages/History';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { ReadingPage } from './pages/ReadingPage';
import { Result } from './pages/Result';
import { Select } from './pages/Select';
import { Settings } from './pages/Settings';
import { AppProvider, useApp, useMotionEnabled } from './store/AppStore';
import { useEffect } from 'react';

function Routes() {
  const { path, query } = useLocation();
  const { state } = useApp();
  const motionOn = useMotionEnabled();
  const immersive = path.startsWith('/reading');

  // 切换页面时回到顶部
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  let page;
  const result = matchPath('/result/:id', path);
  if (path === '/') page = <Home />;
  else if (path === '/select') page = <Select query={query} />;
  else if (path === '/reading') page = <ReadingPage query={query} />;
  else if (result) page = <Result id={result.id} />;
  else if (path === '/history') page = <History />;
  else if (path === '/library') page = <Library query={query} />;
  else if (path === '/daily') page = <Daily />;
  else if (path === '/settings') page = <Settings />;
  else page = <Home />;

  return (
    <MotionConfig reducedMotion={motionOn ? 'never' : 'always'}>
      {/* 背景：星云渐变 + Canvas 星空 */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 10%, var(--nebula-a), transparent 60%), radial-gradient(ellipse 70% 60% at 85% 80%, var(--nebula-b), transparent 60%), linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 70%)',
        }}
      />
      {state.settings.particles && <StarField animated={motionOn} density={immersive ? 0.7 : 1} />}

      {!immersive && <TopNav path={path} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={path + (path === '/reading' ? query.get('r') ?? '' : '')}
          // 只使用 opacity：transform / filter 会让 main 成为 fixed 子元素的包含块，破坏全屏抽牌场景
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-10"
        >
          {page}
        </motion.main>
      </AnimatePresence>
      {!immersive && <BottomNav path={path} />}
    </MotionConfig>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </AppProvider>
  );
}
