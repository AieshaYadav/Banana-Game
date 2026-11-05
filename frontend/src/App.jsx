import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('game'); // 'game' | 'leaderboard' | 'profile'
  const [liveScore, setLiveScore] = useState(null);
  const [streak, setStreak] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveScore={liveScore}
        streak={streak}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4">
        {activeTab === 'game' && (
          <GameBoard
            liveScore={liveScore}
            setLiveScore={setLiveScore}
            streak={streak}
            setStreak={setStreak}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}

        {activeTab === 'profile' && (
          <Profile />
        )}
      </main>

      {/* Global Virtual Identity Modal */}
      <AuthModal />

      {/* Enterprise Assignment Footer */}
      <footer className="w-full glass-panel border-t border-slate-800/80 py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex items-center gap-2">
            <span className="text-base">🍌</span>
            <span className="font-bold text-slate-200">CIS046-3 Software For Enterprise</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Banana Game Artifact Implementation</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold">
              Theme 1: Version Control
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px] font-semibold">
              Theme 2: Event-Driven Programming
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
              Theme 3: Interoperability
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
              Theme 4: Virtual Identity
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Secure Backend Proxy • Anti-Cheat Architecture
          </p>

        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
