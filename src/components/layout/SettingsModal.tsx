import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Sliders, Globe, RefreshCw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const SettingsModal = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    activePlaylistUrl,
    loadPlaylist,
    isLoadingPlaylist,
    playlistError,
    channels
  } = useApp();

  const [playlistInput, setPlaylistInput] = useState(activePlaylistUrl);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!settingsOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistInput.trim()) return;

    setSuccessMessage(null);
    const success = await loadPlaylist(playlistInput.trim());
    if (success) {
      setSuccessMessage('IPTV Playlist loaded successfully! Channels list updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleSelectPreset = async (url: string) => {
    setPlaylistInput(url);
    setSuccessMessage(null);
    const success = await loadPlaylist(url);
    if (success) {
      setSuccessMessage('Preset IPTV Playlist loaded successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isLoadingPlaylist && setSettingsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg glass bg-sflive-bg/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sflive-primary/10 flex items-center justify-center border border-sflive-primary/20 text-sflive-primary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">IPTV Settings</h3>
                <p className="text-xs text-sflive-muted">Manage your live stream sources</p>
              </div>
            </div>
            <button
              onClick={() => !isLoadingPlaylist && setSettingsOpen(false)}
              disabled={isLoadingPlaylist}
              className="p-2 text-sflive-muted hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Description */}
            <div className="text-sm text-sflive-muted leading-relaxed">
              Load and parse M3U format playlists dynamically. Enter any valid M3U file link to sync live TV streams instantly.
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-sflive-primary tracking-wider uppercase block">
                Preset Playlists
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('https://go.skym3u.top/2k8o.m3u')}
                  disabled={isLoadingPlaylist}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    activePlaylistUrl === 'https://go.skym3u.top/2k8o.m3u'
                      ? 'bg-sflive-primary/10 border-sflive-primary/30 text-white'
                      : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className={`w-5 h-5 shrink-0 ${activePlaylistUrl === 'https://go.skym3u.top/2k8o.m3u' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-sm text-white">Sky IPTV Premium Selection</div>
                      <div className="text-xs text-sflive-muted mt-0.5 truncate">https://go.skym3u.top/2k8o.m3u</div>
                    </div>
                  </div>
                  {activePlaylistUrl === 'https://go.skym3u.top/2k8o.m3u' && (
                    <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="text-xs font-bold text-sflive-primary tracking-wider uppercase block">
                Custom Playlist URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://example.com/playlist.m3u"
                  value={playlistInput}
                  onChange={(e) => setPlaylistInput(e.target.value)}
                  disabled={isLoadingPlaylist}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl bg-sflive-card/50 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoadingPlaylist || !playlistInput.trim()}
                  className="bg-gradient-to-r from-sflive-primary to-sflive-secondary text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                >
                  {isLoadingPlaylist ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Load URL
                </button>
              </div>
            </form>

            {/* Status Feedback */}
            {isLoadingPlaylist && (
              <div className="p-4 rounded-xl bg-sflive-primary/5 border border-sflive-primary/10 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-sflive-primary animate-spin shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Fetching Playlist</p>
                  <p className="text-sflive-muted mt-0.5">Connecting to source, parsing live streams, downloading logos...</p>
                </div>
              </div>
            )}

            {playlistError && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Load Error</p>
                  <p className="text-sflive-muted mt-0.5 leading-relaxed">{playlistError}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Success</p>
                  <p className="text-sflive-muted mt-0.5">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Current Playlist Status */}
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-sflive-muted">Current Active Channels</p>
                <p className="text-lg font-bold text-white mt-1">{channels.length} Channels Synced</p>
              </div>
              <span className="text-xs bg-sflive-primary/10 text-sflive-primary px-3 py-1 rounded-full font-medium border border-sflive-primary/20">
                IPTV Active
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-white/2 border-t border-white/5 text-[11px] text-sflive-muted flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Proxy servers bypass cross-origin browser security to guarantee 100% load reliability.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
