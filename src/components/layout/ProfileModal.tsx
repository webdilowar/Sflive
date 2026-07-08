import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, LogOut, Save, ShieldCheck, Calendar, Award, CheckCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { AVATARS } from './AuthModal';

export const ProfileModal = () => {
  const { 
    user, 
    profileModalOpen, 
    setProfileModalOpen, 
    updateProfile, 
    logout,
    favorites,
    playlists
  } = useApp();

  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('avatar_1');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditAvatar(user.avatar || 'avatar_1');
    }
  }, [user, profileModalOpen]);

  if (!profileModalOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateProfile(editName, editAvatar);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleLogoutClick = () => {
    logout();
    setProfileModalOpen(false);
  };

  const activeAvatarObj = AVATARS.find(a => a.id === editAvatar) || AVATARS[0];

  return (
    <AnimatePresence>
      <div id="profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setProfileModalOpen(false)}
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
          {/* Header section with closing option */}
          <div className="relative p-6 bg-gradient-to-r from-sflive-bg via-sflive-bg/95 to-sflive-bg border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-sflive-primary" />
              <h2 className="text-lg font-bold text-white">Elite Profile Manager</h2>
            </div>
            
            <button
              onClick={() => setProfileModalOpen(false)}
              className="text-sflive-muted hover:text-white hover:bg-white/5 p-1.5 rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Close Profile Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Section */}
          <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
            {/* User card with premium info */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-sflive-primary/10 via-sflive-secondary/10 to-transparent border border-sflive-primary/20 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sflive-primary/5 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Giant Avatar Circle */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${activeAvatarObj.gradient} flex items-center justify-center text-3xl shadow-lg border border-white/10 shrink-0`}>
                <span>{activeAvatarObj.icon}</span>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-[9px] font-black bg-sflive-primary/20 text-sflive-primary uppercase px-2 py-0.5 rounded-full border border-sflive-primary/30 tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Gold VIP Member
                </span>
                <h3 className="text-base font-bold text-white mt-1">{user.name}</h3>
                <p className="text-xs text-sflive-muted">{user.email}</p>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-sflive-primary uppercase tracking-wider block">
                  Update Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-white/10 rounded-xl bg-white/2 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm"
                />
              </div>

              {/* Avatar Swapper */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-sflive-primary uppercase tracking-wider block">
                  Change Profile Avatar Crest
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditAvatar(av.id)}
                      className={`aspect-square rounded-xl bg-gradient-to-tr ${av.gradient} flex items-center justify-center text-xl shadow-inner cursor-pointer relative hover:scale-105 transition-all duration-200 border-2 ${
                        editAvatar === av.id
                          ? 'border-white scale-105 shadow-md ring-1 ring-sflive-primary'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={av.label}
                    >
                      <span>{av.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats list */}
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-[10px] text-sflive-muted uppercase font-bold tracking-wider">Favorite Sports Channels</p>
                <p className="text-lg font-extrabold text-white mt-1">{favorites.length} Starred</p>
              </div>
              <div>
                <p className="text-[10px] text-sflive-muted uppercase font-bold tracking-wider">Playlists Configured</p>
                <p className="text-lg font-extrabold text-white mt-1">{playlists.length + 3} Synced</p>
              </div>
            </div>

            {/* Premium details block */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-sflive-muted uppercase tracking-wider block">
                VIP Access Details
              </span>
              <div className="space-y-1.5 text-xs text-sflive-muted leading-normal">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Joined Arena: <strong className="text-white">{user.memberSince}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Low-Latency CDN Playback: <strong className="text-white">Active (Ultra Speed)</strong></span>
                </div>
              </div>
            </div>

            {/* Save success banner */}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </motion.div>
            )}

            {/* Actions button footer row */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out / Logout
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sflive-primary to-sflive-secondary text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-sflive-primary/10"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
