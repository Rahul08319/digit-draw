import { useState, useEffect } from 'react';
import { Brain, Moon, Sun, Volume2, VolumeX, Github, Gamepad2, Layers } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface AppleGlobalNavProps {
  activeTab: 'studio' | 'game' | 'architecture';
  onTabChange: (tab: 'studio' | 'game' | 'architecture') => void;
}

const AppleGlobalNav = ({ activeTab, onTabChange }: AppleGlobalNavProps) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    sounds.playTap();
    setIsDark(prev => !prev);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sounds.enabled = next;
    setSoundEnabled(next);
    if (next) sounds.playTap();
  };

  return (
    <header className="sticky top-0 z-50 w-full h-11 bg-white/80 dark:bg-black/80 frosted-glass border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        
        {/* Brand & Symbol */}
        <div 
          onClick={() => { sounds.playTap(); onTabChange('studio'); }}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-5 h-5 rounded-full bg-apple-blue flex items-center justify-center text-white shadow-xs">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-apple-ink dark:text-white">
            Digit<span className="text-apple-blue">Draw</span>
          </span>
        </div>

        {/* Navigation Tabs (Apple Segmented Bar) */}
        <nav className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { sounds.playTap(); onTabChange('studio'); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
              activeTab === 'studio'
                ? 'bg-black/5 dark:bg-white/10 text-apple-blue font-semibold'
                : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-ink dark:hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => { sounds.playTap(); onTabChange('game'); }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
              activeTab === 'game'
                ? 'bg-black/5 dark:bg-white/10 text-apple-blue font-semibold'
                : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-ink dark:hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Digit Sprint
          </button>
          <button
            type="button"
            onClick={() => { sounds.playTap(); onTabChange('architecture'); }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
              activeTab === 'architecture'
                ? 'bg-black/5 dark:bg-white/10 text-apple-blue font-semibold'
                : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-ink dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            TypeSafe AI
          </button>
        </nav>

        {/* Controls: Audio, Theme, GitHub */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="w-7 h-7 rounded-full flex items-center justify-center text-apple-ink/60 dark:text-white/60 hover:text-apple-ink dark:hover:text-white active:scale-95 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-7 h-7 rounded-full flex items-center justify-center text-apple-ink/60 dark:text-white/60 hover:text-apple-ink dark:hover:text-white active:scale-95 transition-all"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <a
            href="https://github.com/Rahul08319/digit-draw"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="w-7 h-7 rounded-full flex items-center justify-center text-apple-ink/70 dark:text-white/70 hover:text-apple-blue active:scale-95 transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default AppleGlobalNav;
