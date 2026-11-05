import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import { Trophy, User, Gamepad2, Volume2, VolumeX, LogIn, LogOut, Flame } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, liveScore, streak }) {
  const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();
  const [muted, setMuted] = useState(sounds.muted);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sounds.playClick();
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-amber-500/20 px-4 lg:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => { sounds.playClick(); setActiveTab('game'); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
            <span className="text-2xl animate-bounce-soft select-none">🍌</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-arcade bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                BANANA MANIA
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Event-Driven Math Puzzle Platform</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('game'); }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'game'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('leaderboard'); }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => { sounds.playClick(); setActiveTab('profile'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          )}
        </div>

        {/* Right Section: Sound, Score, Virtual Identity */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors border border-slate-700/60"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* User Status / Virtual Identity */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Streak Badge */}
              {streak > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                  <span>{streak}x Streak</span>
                </div>
              )}

              {/* Total Score Pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold">
                <span>🍌</span>
                <span>{liveScore !== null ? liveScore : (user?.stats?.total_score || 0)} pts</span>
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => { sounds.playClick(); setActiveTab('profile'); }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400/40 flex items-center justify-center text-lg shadow-inner">
                    {user?.avatar || '🍌'}
                  </div>
                  <span className="text-sm font-semibold text-slate-200 hidden lg:inline-block max-w-[100px] truncate">
                    {user?.username}
                  </span>
                </button>

                <button
                  onClick={() => { sounds.playClick(); logout(); }}
                  title="Log Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { sounds.playClick(); openLogin(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); openRegister(); }}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                Register
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
