import React from 'react';
import { sounds } from '../utils/soundEffects';
import { HelpCircle, Sparkles, CheckCircle2, AlertTriangle, X, Lock } from 'lucide-react';

export default function HintModal({ isOpen, onClose, hints, hintLevel, onRequestHint, loadingHint, potentialPoints }) {
  if (!isOpen) return null;

  const hintSteps = [
    {
      level: 1,
      title: 'Step 1: Parity & Range',
      penalty: 15,
      description: 'Reveals whether the solution is Even or Odd, and whether it lies in High (5-9) or Low (0-4) half.'
    },
    {
      level: 2,
      title: 'Step 2: Candidate Elimination',
      penalty: 25,
      description: 'Eliminates 7 wrong choices! Limits candidates down to strictly 3 possible options.'
    },
    {
      level: 3,
      title: 'Step 3: Tight Precision Boundary',
      penalty: 35,
      description: 'Gives the closest neighboring bounds ($n-1$ and $n+1$) or an exact mathematical relation.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl shadow-amber-500/10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-arcade text-white">3-Step Tactical Hints</h3>
              <p className="text-xs text-slate-400">Unlock progressive clues (deducts potential round points)</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Round Points Potential */}
        <div className="my-4 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-300 font-medium">Round Points Available:</span>
          <span className="font-extrabold text-amber-300 font-arcade text-base">
            {potentialPoints} pts
          </span>
        </div>

        {/* The 3 Steps list */}
        <div className="space-y-3.5 my-4">
          {hintSteps.map((step) => {
            const isUnlocked = hintLevel >= step.level;
            const hintData = hints.find(h => h.level === step.level);

            return (
              <div
                key={step.level}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-400/40 text-slate-100 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-bold text-sm text-slate-200">{step.title}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isUnlocked ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    -{step.penalty} pts
                  </span>
                </div>

                {isUnlocked ? (
                  <div className="mt-2 text-xs sm:text-sm text-amber-200 font-medium bg-black/30 p-2.5 rounded-xl border border-amber-500/20">
                    {hintData?.text || 'Hint unlocked.'}
                    {hintData?.candidates && (
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs text-slate-400">Allowed candidates:</span>
                        {hintData.candidates.map(num => (
                          <span key={num} className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs">
                            {num}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Hints do not reveal the exact answer.</span>
          </p>

          {hintLevel < 3 ? (
            <button
              onClick={() => { sounds.playClick(); onRequestHint(); }}
              disabled={loadingHint}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingHint ? 'Unlocking...' : `Unlock Hint ${hintLevel + 1}`}</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              All 3 hints unlocked!
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
