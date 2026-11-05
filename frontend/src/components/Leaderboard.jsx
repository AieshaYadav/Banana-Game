import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '../services/api';
import { sounds } from '../utils/soundEffects';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Flame, Target, RefreshCw, Crown, Award } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'accuracy'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'scores' 
        ? await leaderboardApi.getTopScores()
        : await leaderboardApi.getTopAccuracy();
      
      if (res.success && res.leaderboard) {
        setData(res.leaderboard);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const filteredData = data.filter(item =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = data.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-7 h-7 text-amber-400" />
            <h2 className="text-3xl font-extrabold font-arcade text-white">Global Leaderboard</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time MySQL rankings generated dynamically from verified match records.
          </p>
        </div>

        {/* Tab Switcher & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('scores'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'scores'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Scores
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('accuracy'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'accuracy'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Accuracy %
            </button>
          </div>

          <button
            onClick={() => { sounds.playClick(); fetchLeaderboard(); }}
            title="Refresh Leaderboard"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 3 Podium Visuals */}
      {topThree.length >= 1 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 pt-6">
          
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="glass-panel p-4 rounded-3xl border border-slate-700/60 flex flex-col items-center text-center order-1 mt-6 shadow-lg">
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
                  {topThree[1].avatar}
                </div>
                <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold text-xs flex items-center justify-center border-2 border-slate-900">
                  2
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-200 truncate w-full">{topThree[1].username}</p>
              <p className="text-sm sm:text-base font-extrabold font-arcade text-slate-300 mt-1">
                {activeTab === 'scores' ? `${topThree[1].total_score} pts` : `${topThree[1].win_rate}%`}
              </p>
              <span className="text-[10px] text-slate-400">{topThree[1].games_played} games</span>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {topThree[0] && (
            <div className="glass-panel p-4 rounded-3xl border-2 border-amber-400/80 flex flex-col items-center text-center order-2 shadow-2xl shadow-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent">
              <Crown className="w-6 h-6 text-amber-400 mb-1 animate-bounce-soft" />
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shadow-amber-400/30">
                  {topThree[0].avatar}
                </div>
                <span className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center border-2 border-slate-900">
                  1
                </span>
              </div>
              <p className="font-extrabold text-sm sm:text-base text-amber-300 truncate w-full">{topThree[0].username}</p>
              <p className="text-base sm:text-xl font-extrabold font-arcade text-amber-400 mt-1">
                {activeTab === 'scores' ? `${topThree[0].total_score} pts` : `${topThree[0].win_rate}%`}
              </p>
              <span className="text-[10px] text-amber-300/80">{topThree[0].games_played} games</span>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="glass-panel p-4 rounded-3xl border border-amber-700/50 flex flex-col items-center text-center order-3 mt-8 shadow-lg">
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
                  {topThree[2].avatar}
                </div>
                <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center border-2 border-slate-900">
                  3
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-200 truncate w-full">{topThree[2].username}</p>
              <p className="text-sm sm:text-base font-extrabold font-arcade text-amber-600 mt-1">
                {activeTab === 'scores' ? `${topThree[2].total_score} pts` : `${topThree[2].win_rate}%`}
              </p>
              <span className="text-[10px] text-slate-400">{topThree[2].games_played} games</span>
            </div>
          )}

        </div>
      )}

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">Rank</th>
                <th className="py-3.5 px-4 sm:px-6">Player</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Total Score</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Accuracy</th>
                <th className="py-3.5 px-4 sm:px-6 text-right hidden sm:table-cell">High Streak</th>
                <th className="py-3.5 px-4 sm:px-6 text-right hidden sm:table-cell">Matches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Querying MySQL records...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No matching records found. Play a round to establish your rank!
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const isCurrentUser = user && user.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-amber-500/15 font-semibold text-amber-200 border-l-4 border-amber-400'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          {item.rank === 1 && <span className="text-base">🥇</span>}
                          {item.rank === 2 && <span className="text-base">🥈</span>}
                          {item.rank === 3 && <span className="text-base">🥉</span>}
                          {item.rank > 3 && (
                            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                              #{item.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Player Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.avatar}</span>
                          <div>
                            <span className="font-bold text-slate-200 block">
                              {item.username}
                              {isCurrentUser && (
                                <span className="ml-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Score */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-extrabold font-arcade text-amber-400">
                        {item.total_score} pts
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-emerald-400">
                        {item.win_rate}%
                      </td>

                      {/* High Streak */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-orange-400 hidden sm:table-cell">
                        {item.highest_streak || 0}x
                      </td>

                      {/* Games Played */}
                      <td className="py-3.5 px-4 sm:px-6 text-right text-slate-400 hidden sm:table-cell">
                        {item.games_played}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

