import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel, Playlist } from '../types';
import { channels as defaultChannels } from '../data/channels';
import { premiumChannels } from '../data/premium_channels';

interface AppContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;
  favorites: string[];
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activePlaylistUrl: string;
  loadPlaylist: (url: string) => Promise<boolean>;
  isLoadingPlaylist: boolean;
  playlistError: string | null;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  
  // Multiple playlist support
  playlists: Playlist[];
  activePlaylistId: string;
  addPlaylistByUrl: (name: string, url: string) => Promise<boolean>;
  addPlaylistByFile: (name: string, fileContent: string) => Promise<boolean>;
  deletePlaylist: (id: string) => void;
  selectPlaylist: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface M3UInfo {
  name?: string;
  logo?: string;
  groupTitle?: string;
  tvgId?: string;
}

const parseM3U = (m3uText: string): Channel[] => {
  const lines = m3uText.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentInfo: M3UInfo | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const idMatch = line.match(/tvg-id="([^"]+)"/i);
      
      const commaIndex = line.lastIndexOf(",");
      let name = "Unknown Channel";
      if (commaIndex !== -1) {
        name = line.substring(commaIndex + 1).trim();
      }

      currentInfo = {
        name,
        logo: logoMatch ? logoMatch[1] : "",
        groupTitle: groupMatch ? groupMatch[1] : "General",
        tvgId: idMatch ? idMatch[1] : undefined,
      };
    } else if (line.startsWith("#")) {
      // Ignore other M3U directives
    } else {
      if (currentInfo) {
        const cleanName = currentInfo.name || "Channel";
        let idBase = currentInfo.tvgId || cleanName.replace(/[^a-zA-Z0-9]/g, "");
        if (!idBase) {
          idBase = "channel";
        }
        
        let country = "US";
        const lowerName = cleanName.toLowerCase();
        if (idBase.toLowerCase().includes(".bd") || lowerName.includes("bangla") || lowerName.includes("btv") || lowerName.includes("tsports") || lowerName.includes("gazi") || lowerName.includes("somoy") || lowerName.includes("jamuna") || lowerName.includes("ekattor")) {
          country = "BD";
        } else if (idBase.toLowerCase().includes(".pk") || lowerName.includes("pakistan") || lowerName.includes("ptv")) {
          country = "PK";
        } else if (idBase.toLowerCase().includes(".in") || lowerName.includes("star sports") || lowerName.includes("sony sports") || lowerName.includes("dd sports") || lowerName.includes("jalsha") || lowerName.includes("star jalsha")) {
          country = "IN";
        } else if (idBase.toLowerCase().includes(".br") || lowerName.includes("sportv") || lowerName.includes("premiere")) {
          country = "BR";
        } else if (idBase.toLowerCase().includes(".ar") || lowerName.includes("tyc sports")) {
          country = "AR";
        } else if (idBase.toLowerCase().includes(".ca") || lowerName.includes("deshi tv")) {
          country = "CA";
        } else if (lowerName.includes("espn") || lowerName.includes("bein") || lowerName.includes("fox") || lowerName.includes("fubo") || lowerName.includes("nbc") || lowerName.includes("pluto")) {
          country = "US";
        }

        // Map categories dynamically to match SFLIVE's sections
        let category = currentInfo.groupTitle || "General";
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes("sports") || lowerCat.includes("sport") || lowerName.includes("sports") || lowerName.includes("sport") || lowerName.includes("sports1") || lowerName.includes("sports2")) {
          category = "Sports";
        } else if (lowerCat.includes("news") || lowerName.includes("news")) {
          category = "News";
        } else if (lowerCat.includes("movie") || lowerCat.includes("cinema") || lowerName.includes("movie") || lowerName.includes("movies") || lowerName.includes("jalsha movies")) {
          category = "Movies";
        } else if (lowerCat.includes("kids") || lowerCat.includes("cartoon") || lowerName.includes("disney") || lowerName.includes("duronto")) {
          category = "Kids";
        } else if (lowerCat.includes("music") || lowerName.includes("music") || lowerName.includes("8xm") || lowerName.includes("global tv")) {
          category = "Music";
        } else if (country === "BD" && (lowerName.includes("bangla") || lowerName.includes("atn") || lowerName.includes("channel") || lowerName.includes("deepto") || lowerName.includes("ntv") || lowerName.includes("rtv") || lowerName.includes("gazi") || lowerName.includes("boishakhi"))) {
          category = "Bangla";
        } else if (country === "IN" && (lowerName.includes("star") || lowerName.includes("jalsha") || lowerName.includes("hindi") || lowerName.includes("sony"))) {
          category = "Hindi";
        } else if (category === "General" || lowerCat.includes("entertainment") || lowerCat.includes("general")) {
          category = country === "BD" ? "Bangla" : "English";
        }

        channels.push({
          id: `${idBase.replace(/[^a-zA-Z0-9_.-]/g, "")}_${channels.length}`,
          name: cleanName,
          logo: currentInfo.logo || "",
          url: line,
          category,
          country,
          isLive: true,
          description: `Live streaming from playlist: ${cleanName}`,
        });
        currentInfo = null;
      }
    }
  }
  return channels;
};

const ensureSecureUrl = (url: string, useServerApi: boolean): string => {
  if (!url) return url;
  if (!useServerApi) {
    if (url.startsWith('https://cors-proxy.cooks.fyi/')) {
      return url.replace('https://cors-proxy.cooks.fyi/', '');
    }
    return url;
  }
  if (url.startsWith('/api/stream') || url.startsWith('http://localhost:3000/api/stream')) {
    return url;
  }
  let targetUrl = url;
  if (url.startsWith('https://cors-proxy.cooks.fyi/')) {
    targetUrl = url.replace('https://cors-proxy.cooks.fyi/', '');
  }
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return `/api/stream?url=${encodeURIComponent(targetUrl)}`;
  }
  return targetUrl;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('sflive-playlists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activePlaylistId, setActivePlaylistId] = useState(() => {
    return localStorage.getItem('sflive-active-playlist-id') || 'default';
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    const activeId = localStorage.getItem('sflive-active-playlist-id') || 'default';
    if (activeId === 'default') {
      return premiumChannels;
    }
    if (activeId === 'bd_89') {
      return defaultChannels;
    }
    const saved = localStorage.getItem('sflive-playlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Playlist[];
        const found = parsed.find(p => p.id === activeId);
        if (found && found.channels) {
          return found.channels;
        }
      } catch {}
    }
    return premiumChannels;
  });

  const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
    const activeId = localStorage.getItem('sflive-active-playlist-id') || 'default';
    let initialChannels = premiumChannels;
    if (activeId === 'bd_89') {
      initialChannels = defaultChannels;
    } else if (activeId !== 'default') {
      const saved = localStorage.getItem('sflive-playlists');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Playlist[];
          const found = parsed.find(p => p.id === activeId);
          if (found && found.channels) {
            initialChannels = found.channels;
          }
        } catch {}
      }
    }
    return initialChannels.length > 0 ? initialChannels[0] : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePlaylistUrl, setActivePlaylistUrl] = useState(() => {
    const activeId = localStorage.getItem('sflive-active-playlist-id') || 'default';
    if (activeId === 'default') {
      return 'https://go.skym3u.top/2k8o.m3u';
    }
    if (activeId === 'bd_89') {
      return 'internal://bd-89';
    }
    const saved = localStorage.getItem('sflive-playlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Playlist[];
        const found = parsed.find(p => p.id === activeId);
        if (found && found.url) {
          return found.url;
        }
      } catch {}
    }
    return '';
  });

  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [useServerApi, setUseServerApi] = useState(true);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('sflive-favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sflive-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (channelId: string) => {
    setFavorites((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const isFavorite = (channelId: string) => favorites.includes(channelId);

  const addPlaylistByUrl = async (name: string, url: string): Promise<boolean> => {
    setIsLoadingPlaylist(true);
    setPlaylistError(null);
    let parsedChannels: Channel[] = [];

    // 1. Try server-side proxy API first if enabled
    if (useServerApi) {
      try {
        const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('SERVER_NOT_AVAILABLE');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
          throw new Error('SERVER_NOT_AVAILABLE');
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
          parsedChannels = data.channels.map((c: Channel) => ({
            ...c,
            url: ensureSecureUrl(c.url, true)
          }));
        } else {
          throw new Error(data.error || 'No valid channels found in this playlist');
        }
      } catch (err: any) {
        console.warn('Backend server API failed, falling back to client-side:', err.message);
        setUseServerApi(false);
      }
    }

    // 2. Client-side M3U loading and parsing fallback
    if (parsedChannels.length === 0) {
      try {
        console.log('Fetching playlist directly via client browser...', url);
        let text = '';
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Direct fetch failed: ${response.statusText}`);
          }
          text = await response.text();
        } catch (directErr: any) {
          console.warn('Direct fetch blocked by CORS. Attempting public CORS proxy...', directErr);
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl);
          if (!response.ok) {
            throw new Error(`CORS proxy fetch failed: ${response.statusText}`);
          }
          text = await response.text();
        }

        if (!text || !text.includes('#EXTM3U')) {
          throw new Error('Invalid playlist format. The playlist must start with #EXTM3U');
        }

        const parsed = parseM3U(text);
        if (parsed.length === 0) {
          throw new Error('No channels could be parsed from this playlist.');
        }

        parsedChannels = parsed.map((c: Channel) => ({
          ...c,
          url: ensureSecureUrl(c.url, false)
        }));
      } catch (err: any) {
        console.error('Client-side playlist load/parse error:', err);
        setPlaylistError(err.message || 'Failed to load playlist');
        setIsLoadingPlaylist(false);
        return false;
      }
    }

    if (parsedChannels.length > 0) {
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`,
        name: name.trim() || 'Custom Playlist',
        url,
        channels: parsedChannels
      };

      const updatedPlaylists = [...playlists, newPlaylist];
      setPlaylists(updatedPlaylists);
      localStorage.setItem('sflive-playlists', JSON.stringify(updatedPlaylists));

      setChannels(newPlaylist.channels);
      setActivePlaylistId(newPlaylist.id);
      localStorage.setItem('sflive-active-playlist-id', newPlaylist.id);
      setActivePlaylistUrl(url);
      localStorage.setItem('sflive-playlist-url', url);

      if (newPlaylist.channels.length > 0) {
        setCurrentChannel(newPlaylist.channels[0]);
      }
      setIsLoadingPlaylist(false);
      return true;
    }

    setIsLoadingPlaylist(false);
    return false;
  };

  const addPlaylistByFile = async (name: string, fileContent: string): Promise<boolean> => {
    setIsLoadingPlaylist(true);
    setPlaylistError(null);

    try {
      if (!fileContent || !fileContent.includes('#EXTM3U')) {
        throw new Error('Invalid playlist format. The file must be a valid M3U file starting with #EXTM3U');
      }

      const parsed = parseM3U(fileContent);
      if (parsed.length === 0) {
        throw new Error('No channels could be parsed from this file.');
      }

      const parsedChannels = parsed.map((c: Channel) => ({
        ...c,
        url: ensureSecureUrl(c.url, false)
      }));

      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`,
        name: name.trim() || 'Local Upload Playlist',
        channels: parsedChannels,
        isUploadedFile: true
      };

      const updatedPlaylists = [...playlists, newPlaylist];
      setPlaylists(updatedPlaylists);
      localStorage.setItem('sflive-playlists', JSON.stringify(updatedPlaylists));

      setChannels(newPlaylist.channels);
      setActivePlaylistId(newPlaylist.id);
      localStorage.setItem('sflive-active-playlist-id', newPlaylist.id);
      setActivePlaylistUrl('');
      localStorage.removeItem('sflive-playlist-url');

      if (newPlaylist.channels.length > 0) {
        setCurrentChannel(newPlaylist.channels[0]);
      }
      setIsLoadingPlaylist(false);
      return true;
    } catch (err: any) {
      console.error('File parsing error:', err);
      setPlaylistError(err.message || 'Failed to parse M3U file');
      setIsLoadingPlaylist(false);
      return false;
    }
  };

  const deletePlaylist = (id: string) => {
    if (id === 'default' || id === 'bd_89') return;

    const updatedPlaylists = playlists.filter(p => p.id !== id);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('sflive-playlists', JSON.stringify(updatedPlaylists));

    if (activePlaylistId === id) {
      setChannels(premiumChannels);
      setActivePlaylistId('default');
      localStorage.setItem('sflive-active-playlist-id', 'default');
      setActivePlaylistUrl('https://go.skym3u.top/2k8o.m3u');
      localStorage.setItem('sflive-playlist-url', 'https://go.skym3u.top/2k8o.m3u');
      if (premiumChannels.length > 0) {
        setCurrentChannel(premiumChannels[0]);
      }
    }
  };

  const selectPlaylist = (id: string) => {
    if (id === 'default') {
      setChannels(premiumChannels);
      setActivePlaylistId('default');
      localStorage.setItem('sflive-active-playlist-id', 'default');
      setActivePlaylistUrl('https://go.skym3u.top/2k8o.m3u');
      localStorage.setItem('sflive-playlist-url', 'https://go.skym3u.top/2k8o.m3u');
      if (premiumChannels.length > 0) {
        setCurrentChannel(premiumChannels[0]);
      }
      return;
    }

    if (id === 'bd_89') {
      setChannels(defaultChannels);
      setActivePlaylistId('bd_89');
      localStorage.setItem('sflive-active-playlist-id', 'bd_89');
      setActivePlaylistUrl('internal://bd-89');
      localStorage.setItem('sflive-playlist-url', 'internal://bd-89');
      if (defaultChannels.length > 0) {
        setCurrentChannel(defaultChannels[0]);
      }
      return;
    }

    const playlist = playlists.find(p => p.id === id);
    if (playlist) {
      setChannels(playlist.channels);
      setActivePlaylistId(playlist.id);
      localStorage.setItem('sflive-active-playlist-id', playlist.id);
      setActivePlaylistUrl(playlist.url || '');
      if (playlist.url) {
        localStorage.setItem('sflive-playlist-url', playlist.url);
      } else {
        localStorage.removeItem('sflive-playlist-url');
      }
      if (playlist.channels.length > 0) {
        setCurrentChannel(playlist.channels[0]);
      }
    }
  };

  const loadPlaylist = async (url: string): Promise<boolean> => {
    if (url === 'https://go.skym3u.top/2k8o.m3u') {
      selectPlaylist('default');
      return true;
    }
    if (url === 'internal://bd-89') {
      selectPlaylist('bd_89');
      return true;
    }
    const found = playlists.find(p => p.url === url);
    if (found) {
      selectPlaylist(found.id);
      return true;
    }
    const name = url.split('/').pop()?.replace('.m3u', '') || 'Loaded Playlist';
    return addPlaylistByUrl(name, url);
  };

  return (
    <AppContext.Provider
      value={{
        channels,
        currentChannel,
        setCurrentChannel,
        favorites,
        toggleFavorite,
        isFavorite,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
        activePlaylistUrl,
        loadPlaylist,
        isLoadingPlaylist,
        playlistError,
        settingsOpen,
        setSettingsOpen,
        playlists,
        activePlaylistId,
        addPlaylistByUrl,
        addPlaylistByFile,
        deletePlaylist,
        selectPlaylist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
