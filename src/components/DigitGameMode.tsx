import { useState, useEffect, useRef, useCallback } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import { sounds } from '@/lib/soundEffects';
import { Play, RotateCcw, Trophy, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

interface DigitGameModeProps {
  onCanvasChange: (canvas: HTMLCanvasElement | null, strokeCount: number) => void;
  predictions: number[] | null;
  classes: string[];
  previewUrl?: string;
}

type GameState = 'idle' | 'playing' | 'round_success' | 'game_over';

const ROUND_TIME_SECONDS = 7;
const TOTAL_ROUNDS = 8;

const DigitGameMode = ({
  onCanvasChange,
  predictions,
  classes,
  previewUrl,
}: DigitGameModeProps) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [targetDigit, setTargetDigit] = useState<number>(7);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS);
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
    const firstDigit = getRandomDigit();
    setTargetDigit(firstDigit);
    setCurrentRound(1);
    setScore(0);
    setStreak(0);
    setTimeLeft(ROUND_TIME_SECONDS);
    roundMatchedRef.current = false;
    canvasKeyRef.current += 1;
    setGameState('playing');
  }, [getRandomDigit]);

  // Handle round completion (Success)
  const handleSuccess = useCallback(() => {
    if (roundMatchedRef.current) return;
    roundMatchedRef.current = true;

    const newStreak = streak + 1;
    setStreak(newStreak);
    sounds.playSuccess(newStreak);

    // Calculate score: base 100 + speed bonus + streak bonus
    const speedBonus = Math.round(timeLeft * 25);
    const streakBonus = (newStreak - 1) * 50;
    const addedScore = 100 + speedBonus + streakBonus;
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
        setGameState('game_over');
      } else {
        const nextTarget = getRandomDigit(targetDigit);
        setTargetDigit(nextTarget);
        setCurrentRound(r => r + 1);
        setTimeLeft(ROUND_TIME_SECONDS);
        roundMatchedRef.current = false;
        canvasKeyRef.current += 1;
        setGameState('playing');
      }
    }, 600);
  }, [currentRound, getRandomDigit, highScore, score, streak, targetDigit, timeLeft]);

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

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time up for round
          sounds.playTick();
          setStreak(0);
          if (currentRound >= TOTAL_ROUNDS) {
            sounds.playGameOver();
            setGameState('game_over');
            return 0;
          } else {
            const next = getRandomDigit(targetDigit);
            setTargetDigit(next);
            setCurrentRound(r => r + 1);
            canvasKeyRef.current += 1;
            return ROUND_TIME_SECONDS;
          }
        }
        if (prev <= 3) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRound, gameState, getRandomDigit, targetDigit]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Apple Arcade Header Strip */}
      <div className="w-full flex items-center justify-between px-6 py-3.5 mb-6 rounded-[20px] bg-apple-surface-parchment/80 dark:bg-apple-tile-1/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-card">
        {/* Score & Streak */}
        <div className="flex items-center gap-5">
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

        {/* High Score Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs text-apple-ink/70 dark:text-white/70">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono font-medium">{highScore}</span>
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
          <p className="text-[15px] leading-relaxed text-apple-ink/70 dark:text-white/70 mb-8 max-w-xs mx-auto">
            Test your drawing speed against real-time on-device CNN intelligence. Draw the requested digits before time expires!
          </p>

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
            You scored <strong className="text-apple-blue font-mono font-semibold">{score} points</strong> across {TOTAL_ROUNDS} rounds.
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
                  style={{ width: `${(timeLeft / ROUND_TIME_SECONDS) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Drawing Canvas */}
          <div className="flex flex-col items-center">
            <DrawingCanvas
              key={canvasKeyRef.current}
              onCanvasChange={onCanvasChange}
              onClear={() => {}}
              previewUrl={previewUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitGameMode;
