import React from 'react';
import { Menu, Search, User, Bell, ListMusic, ChevronDown, Globe, FileText, Settings } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { 
    setSidebarOpen, 
    searchQuery, 
    setSearchQuery,
    playlists,
    activePlaylistId,
    selectPlaylist,
    setSettingsOpen,
    channels
  } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const activePlaylistName = activePlaylistId === 'default'
    ? 'Sky IPTV Premium'
    : activePlaylistId === 'bd_89'
      ? 'SFLIVE Default'
      : activePlaylistId === 'sports_265'
        ? 'Sky Sports Selection'
        : activePlaylistId === 'ben_102'
          ? 'IPTV-Org Bengali'
          : playlists.find(p => p.id === activePlaylistId)?.name || 'Custom Playlist';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (window.location.pathname !== '/live' && window.location.pathname !== '/favorites' && e.target.value.length > 0) {
       // Optional: Navigate to a global search or let local page handle it.
       // We'll keep it simple and just set the context state.
    }
  };

  return (
    <header className="h-20 glass sticky top-0 z-30 flex items-center justify-between px-6 border-b border-white/5 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-2 text-sflive-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-sflive-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-sflive-card/50 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors sm:text-sm"
            placeholder="Search channels, categories..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Playlist Switcher Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 cursor-pointer text-sm font-semibold shrink-0"
          >
            <ListMusic className="w-4 h-4 text-sflive-primary shrink-0" />
            <span className="max-w-[130px] truncate">{activePlaylistName}</span>
            <ChevronDown className="w-4 h-4 text-sflive-muted shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay to close dropdown on clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-sflive-card/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-[10px] font-bold text-sflive-primary uppercase tracking-wider">
                  Select Playlist
                </div>
                
                {/* Sky IPTV Premium Selection */}
                <button
                  onClick={() => {
                    selectPlaylist('default');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                    activePlaylistId === 'default'
                      ? 'bg-sflive-primary/20 text-white font-semibold'
                      : 'text-sflive-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className={`w-4 h-4 shrink-0 ${activePlaylistId === 'default' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="text-xs text-white font-medium">Sky IPTV Premium</div>
                      <div className="text-[10px] text-sflive-muted mt-0.5">Preset • 948 Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'default' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sflive-primary shrink-0"></span>
                  )}
                </button>

                 {/* SFLIVE Default (89 channels) */}
                <button
                  onClick={() => {
                    selectPlaylist('bd_89');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                    activePlaylistId === 'bd_89'
                      ? 'bg-sflive-primary/20 text-white font-semibold'
                      : 'text-sflive-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className={`w-4 h-4 shrink-0 ${activePlaylistId === 'bd_89' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="text-xs text-white font-medium">SFLIVE Default</div>
                      <div className="text-[10px] text-sflive-muted mt-0.5">Preset • 89 Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'bd_89' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sflive-primary shrink-0"></span>
                  )}
                </button>

                {/* Sky Sports Selection (265 channels) */}
                <button
                  onClick={() => {
                    selectPlaylist('sports_265');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                    activePlaylistId === 'sports_265'
                      ? 'bg-sflive-primary/20 text-white font-semibold'
                      : 'text-sflive-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className={`w-4 h-4 shrink-0 ${activePlaylistId === 'sports_265' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="text-xs text-white font-medium">Sky Sports Selection</div>
                      <div className="text-[10px] text-sflive-muted mt-0.5">Preset • 265 Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'sports_265' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sflive-primary shrink-0"></span>
                  )}
                </button>

                {/* IPTV-Org Bengali (102 channels) */}
                <button
                  onClick={() => {
                    selectPlaylist('ben_102');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                    activePlaylistId === 'ben_102'
                      ? 'bg-sflive-primary/20 text-white font-semibold'
                      : 'text-sflive-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className={`w-4 h-4 shrink-0 ${activePlaylistId === 'ben_102' ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                    <div className="truncate">
                      <div className="text-xs text-white font-medium">IPTV-Org Bengali</div>
                      <div className="text-[10px] text-sflive-muted mt-0.5">Dynamic • 102 Channels</div>
                    </div>
                  </div>
                  {activePlaylistId === 'ben_102' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sflive-primary shrink-0"></span>
                  )}
                </button>

                {/* Custom Playlists */}
                {playlists.length > 0 && (
                  <div className="h-px bg-white/5 my-1" />
                )}
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      selectPlaylist(pl.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                      activePlaylistId === pl.id
                        ? 'bg-sflive-primary/20 text-white font-semibold'
                        : 'text-sflive-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {pl.isUploadedFile ? (
                        <FileText className={`w-4 h-4 shrink-0 ${activePlaylistId === pl.id ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                      ) : (
                        <Globe className={`w-4 h-4 shrink-0 ${activePlaylistId === pl.id ? 'text-sflive-primary' : 'text-sflive-muted'}`} />
                      )}
                      <div className="truncate">
                        <div className="text-xs text-white font-medium">{pl.name}</div>
                        <div className="text-[10px] text-sflive-muted mt-0.5 truncate">{pl.channels.length} Channels</div>
                      </div>
                    </div>
                    {activePlaylistId === pl.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sflive-primary shrink-0"></span>
                    )}
                  </button>
                ))}

                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={() => {
                    setSettingsOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-sflive-muted hover:text-white hover:bg-white/5 transition-all duration-200 text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  Manage Playlists...
                </button>
              </div>
            </>
          )}
        </div>

        <button className="p-2.5 text-sflive-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-sflive-primary rounded-full"></span>
        </button>
        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>
        <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sflive-secondary to-sflive-primary flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-sflive-bg rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-sm font-medium hidden sm:block">User Profile</span>
        </button>
      </div>
    </header>
  );
};
