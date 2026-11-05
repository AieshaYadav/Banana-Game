import React, { useState, useEffect } from 'react';
import { profileApi } from '../services/api';
import { sounds } from '../utils/soundEffects';
import { useAuth } from '../context/AuthContext';
import { User, Trophy, Flame, Target, Sparkles, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const AVATAR_OPTIONS = ['🍌', '🐒', '👑', '🧙‍♂️', '🥷', '🕵️‍♂️', '🤖', '🐯', '🚀', '⭐'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.profile) {
        setProfileData(res.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSelectAvatar = async (avatar) => {
    sounds.playClick();
    setUpdatingAvatar(true);
    setFeedback('');

    try {
      const res = await profileApi.updateAvatar(avatar);
      if (res.success) {
        setProfileData(prev => ({ ...prev, avatar }));
        setFeedback('Avatar updated successfully!');
        refreshUser();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Avatar update failed:', err);
    } finally {
      setUpdatingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading your enterprise virtual profile...</p>
      </div>
    );
  }

  const stats = profileData?.stats || {};
  const recentMatches = profileData?.recentMatches || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      
      {/* Identity Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Active Avatar Display */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20">
              {profileData?.avatar || '🍌'}
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-arcade text-white">
                  {profileData?.username}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">{profileData?.email}</p>
              </div>

              <span className="self-center sm:self-auto px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Virtual Identity Verified
              </span>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-300">
              {profileData?.bio || 'Banana Game Enthusiast'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span>Member since: {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Active'}</span>
              <span>•</span>
              <span>Architecture: Decoupled Client-Server</span>
            </div>
          </div>
        </div>

        {/* Avatar Customization Tray */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">
            Choose Your Avatar:
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                onClick={() => handleSelectAvatar(av)}
                disabled={updatingAvatar}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                  profileData?.avatar === av
                    ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-400/40 ring-2 ring-white'
                    : 'bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
          {feedback && <p className="text-xs text-emerald-400 font-bold mt-2">{feedback}</p>}
        </div>

      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-xl font-bold font-arcade text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Performance Telemetry</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Score</p>
            <p className="text-xl font-extrabold font-arcade text-amber-400 mt-1">
              {stats.total_score || 0}
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Games Played</p>
            <p className="text-xl font-extrabold font-arcade text-sky-400 mt-1">
              {stats.games_played || 0}
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Win Rate</p>
            <p className="text-xl font-extrabold font-arcade text-emerald-400 mt-1">
              {stats.win_rate || 0}%
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Best Streak</p>
            <p className="text-xl font-extrabold font-arcade text-orange-400 mt-1">
              {stats.highest_streak || 0}x
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">High Score</p>
            <p className="text-xl font-extrabold font-arcade text-purple-400 mt-1">
              {stats.high_score || 0}
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Hints Used</p>
            <p className="text-xl font-extrabold font-arcade text-yellow-300 mt-1">
              {stats.hints_used_count || 0}
            </p>
          </div>

        </div>
      </div>

      {/* Match History Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl">
        <h3 className="text-lg font-bold font-arcade text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <span>Recent Match History (Audited Records)</span>
        </h3>

        {recentMatches.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No matches recorded yet. Jump into a game to populate your audit trail!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Your Answer</th>
                  <th className="pb-3">Solution</th>
                  <th className="pb-3">Hints Used</th>
                  <th className="pb-3">Time Taken</th>
                  <th className="pb-3 text-right">Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      {m.is_correct ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                          <XCircle className="w-4 h-4" /> Mistake
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-extrabold font-arcade text-amber-400">
                      +{m.points_awarded} pts
                    </td>
                    <td className="py-3 font-bold text-slate-200">{m.user_answer}</td>
                    <td className="py-3 font-bold text-slate-400">{m.correct_solution}</td>
                    <td className="py-3 text-slate-300">{m.hints_used} hints</td>
                    <td className="py-3 text-slate-400">{m.time_taken_seconds}s</td>
                    <td className="py-3 text-right text-slate-500 text-[11px]">
                      {new Date(m.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
