import { Github, Heart, Shield, Cpu, ExternalLink } from 'lucide-react';

const AppleFooter = () => {
  return (
    <footer className="w-full bg-apple-surface-parchment dark:bg-apple-tile-1 border-t border-black/[0.06] dark:border-white/[0.08] transition-colors mt-20 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Museum Informational Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-xs">
          
          {/* Column 1: Core Technologies */}
          <div>
            <h4 className="font-semibold text-apple-ink dark:text-white mb-3 tracking-tight">
              Technologies
            </h4>
            <ul className="space-y-2 text-apple-ink/70 dark:text-white/70">
              <li>TensorFlow.js WebGL</li>
              <li>TypeSafe System One (Jev)</li>
              <li>MNIST Dataset (28×28)</li>
              <li>Vite & React 18</li>
              <li>Tailwind CSS & Canvas API</li>
            </ul>
          </div>

          {/* Column 2: System Architecture */}
          <div>
            <h4 className="font-semibold text-apple-ink dark:text-white mb-3 tracking-tight">
              Architecture
            </h4>
            <ul className="space-y-2 text-apple-ink/70 dark:text-white/70">
              <li>Dual-Tier Fast Path (&lt;10ms)</li>
              <li>Choice Intent Routing</li>
              <li>Noul Numeral Validity</li>
              <li>Score Quality Metric</li>
              <li>On-Device Fine-Tuning</li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h4 className="font-semibold text-apple-ink dark:text-white mb-3 tracking-tight">
              Interactive Modes
            </h4>
            <ul className="space-y-2 text-apple-ink/70 dark:text-white/70">
              <li>Real-Time Freehand Studio</li>
              <li>Digit Sprint Arcade Game</li>
              <li>Aspect-Ratio Normalization</li>
              <li>IndexedDB Weight Persistence</li>
              <li>Web Audio Sound Engine</li>
            </ul>
          </div>

          {/* Column 4: Links & Source */}
          <div>
            <h4 className="font-semibold text-apple-ink dark:text-white mb-3 tracking-tight">
              Repository & Author
            </h4>
            <ul className="space-y-2 text-apple-ink/70 dark:text-white/70">
              <li>
                <a 
                  href="https://github.com/Rahul08319/digit-draw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-apple-blue transition-colors flex items-center gap-1"
                >
                  GitHub Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/Rahul08319" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-apple-blue transition-colors flex items-center gap-1"
                >
                  @Rahul08319
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>MIT License</li>
              <li>On-Device Privacy First</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-black/[0.06] dark:border-white/[0.08] mb-6" />

        {/* Legal & Attribution Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-apple-ink/50 dark:text-white/50">
          <p>
            Copyright © {new Date().getFullYear()} DigitDraw. Built with Apple Design System & TypeSafe AI.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-3 h-3" />
              100% Client-Side Private
            </span>
            <span>•</span>
            <span>Zero Tracking</span>
            <span>•</span>
            <span>Offline Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppleFooter;
