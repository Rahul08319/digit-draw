import { useState, useEffect, useRef, useCallback } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import { sounds } from '@/lib/soundEffects';
import { Play, RotateCcw, Trophy, Flame, Sparkles, CheckCircle2, Volume2, VolumeX, Zap } from 'lucide-react';

interface DigitGameModeProps {
  onCanvasChange: (canvas: HTMLCanvasElement | null, strokeCount: number) => void;
  predictions: number[] | null;
  classes: string[];
  previewUrl?: string;
}

type GameState = 'idle' | 'playing' | 'round_success' | 'game_over';
type Difficulty = 'casual' | 'standard' | 'speedrun';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; time: number; scoreMultiplier: number; description: string }> = {
  casual: { label: 'Casual', time: 10, scoreMultiplier: 0.8, description: '10s per round — relaxed practice' },
  standard: { label: 'Standard', time: 7, scoreMultiplier: 1.0, description: '7s per round — the classic sprint' },
  speedrun: { label: 'Speedrun', time: 4, scoreMultiplier: 1.5, description: '4s per round — lightning reflexes' },
};

const TOTAL_ROUNDS = 8;

const DigitGameMode = ({
  onCanvasChange,
  predictions,
  previewUrl,
}: DigitGameModeProps) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [targetDigit, setTargetDigit] = useState<number>(7);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(DIFFICULTY_CONFIG.standard.time);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => sounds.enabled);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('digit_sprint_highscore') || '0');
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundMatchedRef = useRef<boolean>(false);
  const canvasKeyRef = useRef<number>(0);

  // Trigger gentle Apple haptic vibration on mobile
  const triggerHaptic = useCallback((ms: number = 20) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {
      // Haptics policy suppression
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const next = !isAudioEnabled;
    sounds.enabled = next;
    setIsAudioEnabled(next);
    if (next) sounds.playTap();
  }, [isAudioEnabled]);

  // Generate a random digit distinct from current
  const getRandomDigit = useCallback((exclude?: number): number => {
    let next: number;
    do {
      next = Math.floor(Math.random() * 10);
    } while (exclude !== undefined && next === exclude);
    return next;
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    sounds.playTap();
    triggerHaptic(30);
    const firstDigit = getRandomDigit();
    const roundTime = DIFFICULTY_CONFIG[difficulty].time;
    setTargetDigit(firstDigit);
    setCurrentRound(1);
    setScore(0);
    setStreak(0);
    setTimeLeft(roundTime);
    roundMatchedRef.current = false;
    canvasKeyRef.current += 1;
    setGameState('playing');
  }, [difficulty, getRandomDigit, triggerHaptic]);

  // Handle round completion (Success)
  const handleSuccess = useCallback(() => {
    if (roundMatchedRef.current) return;
    roundMatchedRef.current = true;

    const newStreak = streak + 1;
    setStreak(newStreak);
    sounds.playSuccess(newStreak);
    triggerHaptic(newStreak > 2 ? 40 : 25);

    // Calculate score: (base 100 + speed bonus + streak bonus) * difficulty multiplier
    const mult = DIFFICULTY_CONFIG[difficulty].scoreMultiplier;
    const speedBonus = Math.round(timeLeft * 25);
    const streakBonus = (newStreak - 1) * 50;
    const addedScore = Math.round((100 + speedBonus + streakBonus) * mult);
    const newScore = score + addedScore;
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem('digit_sprint_highscore', String(newScore));
      } catch {
        // localStorage suppression
      }
    }

    setGameState('round_success');

    // Next round after brief Apple celebration spring
    setTimeout(() => {
      if (currentRound >= TOTAL_ROUNDS) {
        sounds.playGameOver();
        triggerHaptic(60);
        setGameState('game_over');
      } else {
        const nextTarget = getRandomDigit(targetDigit);
        const roundTime = DIFFICULTY_CONFIG[difficulty].time;
        setTargetDigit(nextTarget);
        setCurrentRound(r => r + 1);
        setTimeLeft(roundTime);
        roundMatchedRef.current = false;
        canvasKeyRef.current += 1;
        setGameState('playing');
      }
    }, 600);
  }, [currentRound, difficulty, getRandomDigit, highScore, score, streak, targetDigit, timeLeft, triggerHaptic]);

  // Check live predictions against target digit
  useEffect(() => {
    if (gameState !== 'playing' || !predictions || roundMatchedRef.current) return;

    const targetIndex = targetDigit;
    const targetConfidence = predictions[targetIndex] || 0;

    // Check if target has > 70% confidence or is dominant top prediction with > 55%
    const maxConfidence = Math.max(...predictions);
    const topIndex = predictions.indexOf(maxConfidence);

    if (topIndex === targetIndex && maxConfidence >= 0.65) {
      handleSuccess();
    } else if (targetConfidence >= 0.75) {
      handleSuccess();
    }
  }, [gameState, predictions, targetDigit, handleSuccess]);

  // Round Timer
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const roundDuration = DIFFICULTY_CONFIG[difficulty].time;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time up for round
          sounds.playTick();
          triggerHaptic(15);
          setStreak(0);
          if (currentRound >= TOTAL_ROUNDS) {
            sounds.playGameOver();
            triggerHaptic(50);
            setGameState('game_over');
            return 0;
          } else {
            const next = getRandomDigit(targetDigit);
            setTargetDigit(next);
            setCurrentRound(r => r + 1);
            canvasKeyRef.current += 1;
            return roundDuration;
          }
        }
        if (prev <= 3) {
          sounds.playTick();
          triggerHaptic(10);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRound, difficulty, gameState, getRandomDigit, targetDigit, triggerHaptic]);

  // Live top prediction info for real-time perception feedback
  const topGuess = predictions ? (() => {
    const max = Math.max(...predictions);
    const idx = predictions.indexOf(max);
    return { digit: idx, confidence: max };
  })() : null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Apple Arcade Header Strip */}
      <div className="w-full flex items-center justify-between px-6 py-3.5 mb-6 rounded-[20px] bg-apple-surface-parchment/80 dark:bg-apple-tile-1/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-card">
        {/* Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-apple-ink/50 dark:text-white/50 uppercase tracking-wider">Score</span>
            <span className="text-xl font-bold font-mono text-apple-ink dark:text-white">{score}</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold animate-scale-in">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak}x Streak</span>
            </div>
          )}
        </div>

        {/* Round Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-apple-ink/60 dark:text-white/60">
            Round {currentRound} of {TOTAL_ROUNDS}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-apple-blue rounded-full transition-all duration-300"
              style={{ width: `${(currentRound / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls: Sound Toggle & Highscore */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAudio}
            title={isAudioEnabled ? "Mute audio" : "Enable audio"}
            aria-label={isAudioEnabled ? "Mute audio" : "Enable audio"}
            className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 text-apple-ink/60 dark:text-white/60 hover:text-apple-ink dark:hover:text-white transition-all active:scale-95"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500/70" />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs text-apple-ink/70 dark:text-white/70">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono font-medium">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      {gameState === 'idle' ? (
        <div className="w-full max-w-md p-10 text-center rounded-[24px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-apple-ink dark:text-white mb-2">
            Digit Sprint Challenge
          </h2>
          <p className="text-[15px] leading-relaxed text-apple-ink/70 dark:text-white/70 mb-6 max-w-xs mx-auto">
            Test your drawing speed against real-time on-device CNN intelligence. Draw the requested digits before time expires!
          </p>

          {/* Difficulty Selector */}
          <div className="mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50 block mb-2.5">
              Select Pace
            </span>
            <div className="inline-flex p-1 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5">
              {(['casual', 'standard', 'speedrun'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setDifficulty(d);
                    setTimeLeft(DIFFICULTY_CONFIG[d].time);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    difficulty === d
                      ? 'bg-apple-canvas dark:bg-apple-tile-1 text-apple-blue dark:text-white shadow-xs'
                      : 'text-apple-ink/60 dark:text-white/60 hover:text-apple-ink'
                  }`}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-apple-ink/50 dark:text-white/50 mt-2">
              {DIFFICULTY_CONFIG[difficulty].description}
            </p>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-apple-blue text-white font-medium text-[16px] shadow-sm hover:bg-apple-blue-hover transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Challenge
          </button>
        </div>
      ) : gameState === 'game_over' ? (
        <div className="w-full max-w-md p-10 text-center rounded-[24px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-apple-ink dark:text-white mb-1">
            Challenge Complete!
          </h2>
          <p className="text-sm text-apple-ink/60 dark:text-white/60 mb-6">
            You scored <strong className="text-apple-blue font-mono font-semibold">{score} points</strong> on {DIFFICULTY_CONFIG[difficulty].label} mode.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 text-center">
            <div className="p-4 rounded-xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5">
              <span className="text-[11px] text-apple-ink/50 dark:text-white/50 block mb-1">Final Score</span>
              <span className="text-xl font-bold font-mono text-apple-ink dark:text-white">{score}</span>
            </div>
            <div className="p-4 rounded-xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5">
              <span className="text-[11px] text-apple-ink/50 dark:text-white/50 block mb-1">Best Highscore</span>
              <span className="text-xl font-bold font-mono text-amber-500">{highScore}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-apple-blue text-white font-medium text-[16px] shadow-sm hover:bg-apple-blue-hover transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Target Prompt Card */}
          <div className="flex flex-col items-center justify-center p-8 rounded-[24px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card w-full max-w-[280px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50 mb-2">
              Draw Digit
            </span>

            {/* Target Display with Apple Spring Transition */}
            <div className={`relative flex items-center justify-center w-28 h-28 my-3 rounded-2xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/10 transition-transform duration-300 ${
              gameState === 'round_success' ? 'scale-110 bg-emerald-500/10 border-emerald-500/30' : ''
            }`}>
              {gameState === 'round_success' ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-scale-in" />
              ) : (
                <span className="text-7xl font-bold font-mono text-apple-ink dark:text-white tracking-tighter">
                  {targetDigit}
                </span>
              )}
            </div>

            {/* Timer countdown pill */}
            <div className="w-full mt-4">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-apple-ink/60 dark:text-white/60">
                <span>Time Remaining</span>
                <span className={timeLeft <= 2 ? 'text-red-500 font-bold' : ''}>{timeLeft}s</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 linear ${
                    timeLeft <= 2 ? 'bg-red-500' : 'bg-apple-blue'
                  }`}
                  style={{ width: `${(timeLeft / DIFFICULTY_CONFIG[difficulty].time) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Drawing Canvas & Live AI Readout */}
          <div className="flex flex-col items-center">
            <DrawingCanvas
              key={canvasKeyRef.current}
              onCanvasChange={onCanvasChange}
              onClear={() => {}}
              previewUrl={previewUrl}
            />

            {/* Live AI Perception Feedback */}
            <div className="mt-3.5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-apple-surface-parchment/90 dark:bg-apple-tile-1/90 backdrop-blur-md border border-black/5 dark:border-white/10 text-xs shadow-xs transition-all">
              <span className={`w-2 h-2 rounded-full ${
                topGuess && topGuess.digit === targetDigit && topGuess.confidence >= 0.5
                  ? 'bg-emerald-500 animate-ping'
                  : 'bg-apple-blue animate-pulse'
              }`} />
              <span className="text-apple-ink/60 dark:text-white/60 font-medium">Neural State:</span>
              {topGuess && topGuess.confidence > 0.3 ? (
                <span className={`font-mono font-semibold ${
                  topGuess.digit === targetDigit ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-apple-ink dark:text-white'
                }`}>
                  Seeing {topGuess.digit} ({Math.round(topGuess.confidence * 100)}%)
                </span>
              ) : (
                <span className="text-apple-ink/40 dark:text-white/40 italic flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Waiting for stroke...
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitGameMode;
