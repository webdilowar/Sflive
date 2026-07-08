import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const AVATARS = [
  { id: 'avatar_1', gradient: 'from-orange-500 to-amber-500', icon: '⚽', label: 'Striker' },
  { id: 'avatar_2', gradient: 'from-blue-500 to-indigo-600', icon: '🏆', label: 'Champion' },
  { id: 'avatar_3', gradient: 'from-emerald-400 to-teal-600', icon: '⚡', label: 'Streamer' },
  { id: 'avatar_4', gradient: 'from-yellow-400 to-pink-500', icon: '👑', label: 'VIP' },
  { id: 'avatar_5', gradient: 'from-cyan-400 to-blue-600', icon: '🌟', label: 'Superstar' },
  { id: 'avatar_6', gradient: 'from-rose-500 to-violet-600', icon: '🔥', label: 'Fanatic' },
];

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, login, signup } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_1');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (activeTab === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        const res = await signup(name, trimmedEmail, trimmedPassword, selectedAvatar);
        if (res.success) {
          setAuthModalOpen(false);
          resetForm();
        } else {
          setError(res.error || 'Failed to sign up.');
        }
      } else {
        const res = await login(trimmedEmail, trimmedPassword);
        if (res.success) {
          setAuthModalOpen(false);
          resetForm();
        } else {
          setError(res.error || 'Failed to sign in.');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setSelectedAvatar('avatar_1');
    setError(null);
  };

  return (
    <AnimatePresence>
      <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-md rounded-2xl bg-sflive-card/95 border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Header Banner - FIFA World Cup Styled */}
          <div className="relative p-6 bg-gradient-to-r from-sflive-primary via-indigo-600 to-sflive-secondary overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent)] pointer-events-none"></div>
            
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Close Authentication Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-white/20 text-white uppercase px-2.5 py-1 rounded-full border border-white/15 mb-2 tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" /> SFLIVE VIP Arena
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'signup' ? 'Create Free SFLIVE Account' : 'Welcome Back Elite Streamer'}
            </h2>
            <p className="text-xs text-white/85 mt-1">
              Unlock crystal clear high-definition soccer, low-latency live streams, and customized sports hubs.
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 space-y-5 flex-1">
            {/* Tabs Selector */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => {
                  setActiveTab('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-gradient-to-r from-sflive-primary to-indigo-600 text-white shadow-md'
                    : 'text-sflive-muted hover:text-white'
                }`}
              >
                Join / Sign Up
              </button>
              <button
                onClick={() => {
                  setActiveTab('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-gradient-to-r from-sflive-primary to-indigo-600 text-white shadow-md'
                    : 'text-sflive-muted hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Only on Signup) */}
              {activeTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sflive-primary uppercase tracking-wider block">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="w-4 h-4 text-sflive-muted" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Lionel Messi"
                      className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/2 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-sflive-primary uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-sflive-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. champion@sflive.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/2 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-sflive-primary uppercase tracking-wider block">
                  Secure Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-sflive-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/2 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Avatar Selector (Only on Signup) */}
              {activeTab === 'signup' && (
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-sflive-primary uppercase tracking-wider block">
                    Choose Your Streamer Crest
                  </label>
                  <div className="grid grid-cols-6 gap-2.5">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`aspect-square rounded-xl bg-gradient-to-tr ${av.gradient} flex items-center justify-center text-xl shadow-inner cursor-pointer relative hover:scale-110 active:scale-95 transition-all duration-200 border-2 ${
                          selectedAvatar === av.id
                            ? 'border-white scale-110 shadow-lg ring-2 ring-sflive-primary/50'
                            : 'border-transparent'
                        }`}
                        title={av.label}
                      >
                        <span>{av.icon}</span>
                        {selectedAvatar === av.id && (
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-sflive-primary border border-white flex items-center justify-center text-[6px]">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-sflive-primary to-sflive-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-6 shadow-lg shadow-sflive-primary/20"
              >
                <span>
                  {activeTab === 'signup' ? 'Create My Account' : 'Sign In to Arena'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-[10px] text-sflive-muted mt-2">
              By continuing, you agree to SFLIVE's VIP Streaming terms of service. All 2026 World Cup access features are 100% unlocked for premium accounts.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
