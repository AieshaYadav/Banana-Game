import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { gameApi } from '../services/api';
import { sounds } from '../utils/soundEffects';
import HintModal from './HintModal';
import { 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Flame, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Heart,
  ArrowRight,
  Lock
} from 'lucide-react';

export default function GameBoard({ onScoreUpdate, liveScore, setLiveScore, streak, setStreak }) {
  const { user, isAuthenticated, openLogin, openRegister, refreshUser } = useAuth();

  // Game state
  const [roundId, setRoundId] = useState(null);
  const [questionUrl, setQuestionUrl] = useState('');
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [loadingRound, setLoadingRound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(100);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Hints state
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [unlockedHints, setUnlockedHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);

  // Feedback & Animation states
  const [isShaking, setIsShaking] = useState(false);
  const [roundResult, setRoundResult] = useState(null); // { isCorrect, pointsAwarded, breakdown, message, correctSolution }
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Start new round from backend proxy (Preventing data leaks)
  const startNewRound = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingRound(true);
    setRoundResult(null);
    setSelectedDigit(null);
    setHintLevel(0);
    setUnlockedHints([]);
    setPotentialPoints(100);
    setTimeLeft(30);

    try {
      const data = await gameApi.startRound();
      if (data.success) {
        setRoundId(data.roundId);
        setQuestionUrl(data.questionUrl);
        setTimerActive(true);
      }
    } catch (err) {
      console.error('Failed to start round:', err);
    } finally {
      setLoadingRound(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && !roundId && !gameOver) {
      startNewRound();
    }
  }, [isAuthenticated, roundId, gameOver, startNewRound]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Handle timeout as mistake
  const handleTimeExpired = async () => {
    setTimerActive(false);
    sounds.playWrong();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 700);

    setStreak(0);
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) setGameOver(true);
      return Math.max(0, nextLives);
    });

    setRoundResult({
      isCorrect: false,
      pointsAwarded: 0,
      message: '⏰ Time expired! Be faster on the next equation!'
    });
  };

  // Keyboard accessibility & synthetic event handling (Event-Driven Theme)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!timerActive || submitting || !isAuthenticated) return;

      const key = e.key;
      if (key >= '0' && key <= '9') {
        sounds.playClick();
        setSelectedDigit(parseInt(key, 10));
      } else if (key === 'Enter' && selectedDigit !== null) {
        handleSubmitAnswer();
      } else if (key === 'h' || key === 'H') {
        setHintModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerActive, submitting, selectedDigit, isAuthenticated]);

  // Hint Request handler
  const handleRequestHint = async () => {
    if (!roundId || loadingHint || hintLevel >= 3) return;

    setLoadingHint(true);
    try {
      const data = await gameApi.requestHint(roundId);
      if (data.success && data.hint) {
        sounds.playHint();
        setHintLevel(data.currentHintLevel);
        setUnlockedHints((prev) => [...prev, data.hint]);
        setPotentialPoints(data.remainingPotential);
      }
    } catch (err) {
      console.error('Hint error:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  // Answer Submission handler
  const handleSubmitAnswer = async () => {
    if (selectedDigit === null || submitting || !roundId) return;

    setSubmitting(true);
    setTimerActive(false);

    try {
      const data = await gameApi.submitAnswer(roundId, selectedDigit, timeLeft);

      if (data.isCorrect) {
        // --- Correct Answer Flow ---
        sounds.playCorrect();
        
        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8']
        });

        const newScore = (liveScore !== null ? liveScore : (user?.stats?.total_score || 0)) + data.pointsAwarded;
        setLiveScore(newScore);
        setStreak(data.currentStreak);
        refreshUser();

        setRoundResult({
          isCorrect: true,
          pointsAwarded: data.pointsAwarded,
          breakdown: data.breakdown,
          message: data.message,
          correctSolution: data.correctSolution
        });
      } else {
        // --- Mistake Flow (Shake & Vibration Feedback) ---
        sounds.playWrong();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 700);

        setStreak(0);
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) setGameOver(true);
          return Math.max(0, next);
        });
        refreshUser();

        setRoundResult({
          isCorrect: false,
          pointsAwarded: 0,
          message: data.message,
          correctSolution: data.correctSolution
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset full game after Game Over
  const handleRestartGame = () => {
    setLives(3);
    setGameOver(false);
    setStreak(0);
    startNewRound();
  };

  // 1. Mandatory Login Prompt (Virtual Identity Requirement)
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-6 animate-bounce-soft">
            🍌
          </div>
          <h2 className="text-3xl font-extrabold font-arcade text-white mb-3">
            Authentication Required
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-8">
            To play the Banana Math Game, submit scores, unlock tactical hints, and compete on the live MySQL Leaderboard, you must log in to establish your <span className="text-amber-400 font-bold">Virtual Identity</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { sounds.playClick(); openLogin(); }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-base hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Log In to Play</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); openRegister(); }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Zero Data Leak Architecture
            </span>
            <span>•</span>
            <span>3-Step Progressive Hints</span>
            <span>•</span>
            <span>Haptic Shaking Feedback</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Game Over Modal
  if (gameOver) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/40 text-center shadow-2xl">
          <div className="text-5xl mb-4 animate-bounce-soft">💔</div>
          <h2 className="text-3xl font-extrabold font-arcade text-rose-400 mb-2">Out of Hearts!</h2>
          <p className="text-slate-300 text-sm mb-6">
            You made 3 mistakes or ran out of time! Great effort, banana explorer.
          </p>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 mb-6 flex justify-around">
            <div>
              <p className="text-xs text-slate-400">Total Score</p>
              <p className="text-xl font-bold font-arcade text-amber-300">
                {liveScore !== null ? liveScore : (user?.stats?.total_score || 0)} pts
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Best Streak</p>
              <p className="text-xl font-bold font-arcade text-orange-400">
                {user?.stats?.highest_streak || 0}x
              </p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playClick(); handleRestartGame(); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-base hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again (3 Fresh Lives)</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Game Stage
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      
      {/* Top HUD Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        
        {/* Lives / Hearts */}
        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Lives</p>
            <div className="flex gap-1 text-base">
              {[1, 2, 3].map((heart) => (
                <span key={heart} className={`transition-transform ${heart <= lives ? 'scale-100' : 'opacity-20 grayscale'}`}>
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={`glass-card p-3 rounded-2xl flex items-center gap-3 border transition-colors ${
          timeLeft <= 7 ? 'border-rose-500/60 bg-rose-950/30 animate-pulse' : 'border-slate-800'
        }`}>
          <div className={`p-2 rounded-xl ${timeLeft <= 7 ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Time Left</p>
            <p className={`text-lg font-extrabold font-arcade ${timeLeft <= 7 ? 'text-rose-400' : 'text-slate-100'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        {/* Streak Combo Multiplier */}
        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Streak Combo</p>
            <p className="text-lg font-extrabold font-arcade text-orange-400">
              {streak}x {streak >= 3 ? '🔥' : ''}
            </p>
          </div>
        </div>

        {/* Potential Round Points */}
        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Round Reward</p>
            <p className="text-lg font-extrabold font-arcade text-amber-300">
              {potentialPoints} pts
            </p>
          </div>
        </div>

      </div>

      {/* Main Puzzle Card Container (Applies shake-mistake on wrong answer!) */}
      <div className={`glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 transition-all ${
        isShaking ? 'shake-mistake border-rose-500/80 shadow-2xl shadow-rose-500/30 ring-2 ring-rose-500/50' : 'shadow-xl'
      }`}>
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍌</span>
            <span className="font-extrabold font-arcade text-base sm:text-lg text-slate-200">
              Solve the Visual Algebraic Equation
            </span>
          </div>

          {/* Hint Trigger Button */}
          <button
            onClick={() => { sounds.playClick(); setHintModalOpen(true); }}
            disabled={roundResult !== null}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>3-Step Hints ({hintLevel}/3)</span>
          </button>
        </div>

        {/* Puzzle Image Display */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[200px] sm:min-h-[260px] p-2">
          {loadingRound ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-semibold">Fetching Banana puzzle from Marc Conrad API...</p>
            </div>
          ) : questionUrl ? (
            <img
              src={questionUrl}
              alt="Banana Math Puzzle"
              className="max-h-[240px] sm:max-h-[290px] w-auto object-contain rounded-xl shadow-md transition-all select-none"
            />
          ) : (
            <p className="text-sm text-slate-500">No active puzzle loaded.</p>
          )}

          {/* Unlocked Hint Badge Overlay if any */}
          {hintLevel > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-950/90 border border-amber-400/40 text-[11px] font-bold text-amber-300 backdrop-blur-md">
              💡 Hint {hintLevel} Active
            </div>
          )}
        </div>

        {/* Round Outcome Banner */}
        {roundResult && (
          <div className={`mt-5 p-4 rounded-2xl border animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-3 ${
            roundResult.isCorrect 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-3 text-center sm:text-left">
              {roundResult.isCorrect ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="font-extrabold text-sm sm:text-base font-arcade">{roundResult.message}</p>
                {roundResult.isCorrect && roundResult.breakdown && (
                  <p className="text-xs text-emerald-300/80">
                    Base: {roundResult.breakdown.baseScore} | Time Bonus: +{roundResult.breakdown.timeBonus} | Penalty: -{roundResult.breakdown.hintPenalty} | Multiplier: {roundResult.breakdown.streakMultiplier}x
                  </p>
                )}
                {!roundResult.isCorrect && (
                  <p className="text-xs text-rose-300/90 font-medium">
                    The question mark evaluated to: <span className="font-bold underline text-white">{roundResult.correctSolution}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => { sounds.playClick(); startNewRound(); }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Next Round</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 0-9 Interactive Digit Keypad (Event-Driven Theme) */}
        {!roundResult && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">
                Select value for <span className="text-amber-400 font-bold font-arcade">?</span> (Click or press keyboard 0-9):
              </span>
              {selectedDigit !== null && (
                <span className="text-xs font-bold text-amber-300">
                  Selected: <span className="text-sm font-arcade bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg">{selectedDigit}</span>
                </span>
              )}
            </div>

            {/* Digit Buttons 0-9 */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                const isSelected = selectedDigit === digit;
                return (
                  <button
                    key={digit}
                    onClick={() => { sounds.playClick(); setSelectedDigit(digit); }}
                    className={`h-12 sm:h-14 rounded-2xl font-extrabold text-lg sm:text-xl font-arcade transition-all duration-150 flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-105 ring-2 ring-amber-300'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-95'
                    }`}
                  >
                    {digit}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { sounds.playClick(); handleSubmitAnswer(); }}
                disabled={selectedDigit === null || submitting}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-base hover:brightness-110 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>{submitting ? 'Verifying Answer...' : 'Submit Answer'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3-Step Hint Modal */}
      <HintModal
        isOpen={hintModalOpen}
        onClose={() => setHintModalOpen(false)}
        hints={unlockedHints}
        hintLevel={hintLevel}
        onRequestHint={handleRequestHint}
        loadingHint={loadingHint}
        potentialPoints={potentialPoints}
      />

    </div>
  );
}

