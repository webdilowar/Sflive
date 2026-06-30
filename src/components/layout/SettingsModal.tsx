import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Sliders, Globe, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, Plus, Upload, Trash2, FileText } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { channels as defaultChannels } from '../../data/channels';
import { premiumChannels } from '../../data/premium_channels';

export const SettingsModal = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    isLoadingPlaylist,
    playlistError,
    channels,
    playlists,
    activePlaylistId,
    activePlaylistUrl,
    addPlaylistByUrl,
    addPlaylistByFile,
    deletePlaylist,
    selectPlaylist
  } = useApp();

  const [playlistName, setPlaylistName] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addMethod, setAddMethod] = useState<'url' | 'file'>('url');
  const [dragActive, setDragActive] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  if (!settingsOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    if (!playlistName) {
      // Auto-populate name with file name (minus extension)
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setPlaylistName(cleanName);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playlistName.trim();
    if (!trimmedName) {
      return;
    }

    setSuccessMessage(null);

    if (addMethod === 'url') {
      const trimmedUrl = playlistUrl.trim();
      if (!trimmedUrl) return;
      const success = await addPlaylistByUrl(trimmedName, trimmedUrl);
      if (success) {
        setSuccessMessage(`Playlist "${trimmedName}" loaded successfully!`);
        setPlaylistName('');
        setPlaylistUrl('');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } else {
      if (!fileContent) return;
      const success = await addPlaylistByFile(trimmedName, fileContent);
      if (success) {
        setSuccessMessage(`Playlist "${trimmedName}" parsed and added successfully!`);
        setPlaylistName('');
        setFileContent('');
        setFileName('');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    }
  };

  const handleSelectPreset = () => {
    selectPlaylist('default');
    setSuccessMessage('Switched to Sky IPTV Premium Selection!');
    setTimeout(() => setSuccessMessage(null), 4000);
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
              Load and parse M3U format playlists dynamically. Enter any valid M3U link or upload an M3U file directly from your device.
            </div>

            {/* Playlists List */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-sflive-primary tracking-wider uppercase block">
                Your Playlists
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {/* Sky IPTV Premium Playlist */}
                <button
                  type="button"
                  onClick={() => selectPlaylist('default')}
                  disabled={isLoadingPlaylist}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    activePlaylistId === 'default'
                      ? 'bg-sflive-primary/15 border-sflive-primary/40 text-white font-semibold'
                      : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className={`w-5 h-5 shrink-0 ${activePlaylistId === 'default' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-sm text-white">Sky IPTV Premium Selection</div>
                      <div className="text-xs text-sflive-muted mt-0.5">Preset • {premiumChannels.length} Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'default' && (
                    <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </button>

                {/* SFLIVE Default Playlist */}
                <button
                  type="button"
                  onClick={() => selectPlaylist('bd_89')}
                  disabled={isLoadingPlaylist}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    activePlaylistId === 'bd_89'
                      ? 'bg-sflive-primary/15 border-sflive-primary/40 text-white font-semibold'
                      : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className={`w-5 h-5 shrink-0 ${activePlaylistId === 'bd_89' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-sm text-white">SFLIVE Default</div>
                      <div className="text-xs text-sflive-muted mt-0.5">Preset • {defaultChannels.length} Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'bd_89' && (
                    <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </button>

                {/* Premium Sports Selection */}
                <button
                  type="button"
                  onClick={() => selectPlaylist('sports_265')}
                  disabled={isLoadingPlaylist}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    activePlaylistId === 'sports_265'
                      ? 'bg-sflive-primary/15 border-sflive-primary/40 text-white font-semibold'
                      : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className={`w-5 h-5 shrink-0 ${activePlaylistId === 'sports_265' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-sm text-white">Sky Sports Selection</div>
                      <div className="text-xs text-sflive-muted mt-0.5">Preset • 265 Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'sports_265' && (
                    <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </button>

                {/* IPTV-Org Bengali */}
                <button
                  type="button"
                  onClick={() => selectPlaylist('ben_102')}
                  disabled={isLoadingPlaylist}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    activePlaylistId === 'ben_102'
                      ? 'bg-sflive-primary/15 border-sflive-primary/40 text-white font-semibold'
                      : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className={`w-5 h-5 shrink-0 ${activePlaylistId === 'ben_102' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-sm text-white">IPTV-Org Bengali</div>
                      <div className="text-xs text-sflive-muted mt-0.5">Dynamic • 102 Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'ben_102' && (
                    <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </button>

                {/* Custom Playlists */}
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => selectPlaylist(pl.id)}
                    className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer relative group ${
                      activePlaylistId === pl.id
                        ? 'bg-sflive-primary/15 border-sflive-primary/40 text-white'
                        : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 mr-12">
                      {pl.isUploadedFile ? (
                        <FileText className={`w-5 h-5 shrink-0 ${activePlaylistId === pl.id ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                      ) : (
                        <Globe className={`w-5 h-5 shrink-0 ${activePlaylistId === pl.id ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                      )}
                      <div className="truncate text-left">
                        <div className="font-semibold text-sm text-white">{pl.name}</div>
                        <div className="text-xs text-sflive-muted mt-0.5 truncate">
                          {pl.isUploadedFile ? 'Local File' : pl.url} • {pl.channels.length} Channels
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 absolute right-3 top-1/2 -translate-y-1/2">
                      {activePlaylistId === pl.id && (
                        <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl.id);
                        }}
                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Playlist Form */}
            <form onSubmit={handleAddPlaylist} className="space-y-4 border-t border-white/5 pt-4">
              <label className="text-xs font-bold text-sflive-primary tracking-wider uppercase block">
                Add New Playlist
              </label>

              {/* Playlist Name Input */}
              <div className="space-y-1">
                <span className="text-xs text-sflive-muted block">Playlist Title / Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Sports IPTV, BD Local Streams"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  disabled={isLoadingPlaylist}
                  className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-sflive-card/50 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm disabled:opacity-50"
                />
              </div>

              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-2 bg-white/2 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setAddMethod('url')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    addMethod === 'url' ? 'bg-sflive-primary text-white shadow-md' : 'text-sflive-muted hover:text-white'
                  }`}
                >
                  Playlist URL
                </button>
                <button
                  type="button"
                  onClick={() => setAddMethod('file')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    addMethod === 'file' ? 'bg-sflive-primary text-white shadow-md' : 'text-sflive-muted hover:text-white'
                  }`}
                >
                  Upload M3U File
                </button>
              </div>

              {/* Method Content */}
              {addMethod === 'url' ? (
                <div className="space-y-1">
                  <span className="text-xs text-sflive-muted block">IPTV M3U URL *</span>
                  <input
                    type="url"
                    required={addMethod === 'url'}
                    placeholder="https://example.com/playlist.m3u"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    disabled={isLoadingPlaylist}
                    className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-sflive-card/50 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-sm disabled:opacity-50"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs text-sflive-muted block">M3U File *</span>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                      dragActive
                        ? 'border-sflive-primary bg-sflive-primary/10'
                        : fileName
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-white/10 bg-white/2 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".m3u,.m3u8"
                      onChange={handleFileChange}
                      className="hidden"
                      id="m3u-file-input"
                    />
                    <label htmlFor="m3u-file-input" className="cursor-pointer block space-y-2">
                      <Upload className={`w-8 h-8 mx-auto ${fileName ? 'text-emerald-400' : 'text-sflive-muted'}`} />
                      <div className="text-xs text-white font-medium">
                        {fileName ? (
                          <span className="text-emerald-400">{fileName}</span>
                        ) : (
                          <span>Drag & drop M3U file, or <span className="text-sflive-primary underline">browse</span></span>
                        )}
                      </div>
                      <p className="text-[10px] text-sflive-muted">Supports .m3u and .m3u8 formats</p>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoadingPlaylist || !playlistName.trim() || (addMethod === 'url' ? !playlistUrl.trim() : !fileContent)}
                className="w-full bg-gradient-to-r from-sflive-primary to-sflive-secondary text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoadingPlaylist ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {addMethod === 'url' ? 'Add Playlist from URL' : 'Add Playlist from File'}
              </button>
            </form>

            {/* Preset Playlists - Backwards Compatibility */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-sflive-primary tracking-wider uppercase block">
                Preset Quick Load
              </label>
              <button
                type="button"
                onClick={handleSelectPreset}
                disabled={isLoadingPlaylist}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  activePlaylistId === 'default'
                    ? 'bg-sflive-primary/10 border-sflive-primary/30 text-white font-semibold'
                    : 'bg-white/2 border-white/5 text-sflive-muted hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Globe className={`w-5 h-5 shrink-0 ${activePlaylistId === 'default' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                  <div className="truncate">
                    <div className="font-semibold text-sm text-white">Sky IPTV Premium Selection</div>
                    <div className="text-xs text-sflive-muted mt-0.5 truncate">https://go.skym3u.top/2k8o.m3u</div>
                  </div>
                </div>
                {activePlaylistId === 'default' && (
                  <span className="text-[10px] bg-sflive-primary/20 text-sflive-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Status Feedback */}
            {isLoadingPlaylist && (
              <div className="p-4 rounded-xl bg-sflive-primary/5 border border-sflive-primary/10 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-sflive-primary animate-spin shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Processing Playlist</p>
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
            <span>Adding multiple playlists lets you switch instantly between different channel lists and custom uploads.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
