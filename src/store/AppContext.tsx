import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel } from '../types';
import { channels as defaultChannels } from '../data/channels';

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
  const [channels, setChannels] = useState<Channel[]>(defaultChannels);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePlaylistUrl, setActivePlaylistUrl] = useState(() => {
    return localStorage.getItem('sflive-playlist-url') || 'https://go.skym3u.top/2k8o.m3u';
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

  const loadPlaylist = async (url: string): Promise<boolean> => {
    setIsLoadingPlaylist(true);
    setPlaylistError(null);

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
          const secureChannels = data.channels.map((c: Channel) => ({
            ...c,
            url: ensureSecureUrl(c.url, true)
          }));
          setChannels(secureChannels);
          setActivePlaylistUrl(url);
          localStorage.setItem('sflive-playlist-url', url);
          
          if (secureChannels.length > 0) {
            setCurrentChannel(secureChannels[0]);
          }
          setIsLoadingPlaylist(false);
          return true;
        } else {
          throw new Error(data.error || 'No valid channels found in this playlist');
        }
      } catch (err: any) {
        console.warn('Backend server API failed or not available, falling back to client-side:', err.message);
        setUseServerApi(false);
        // Continue to the client-side parsing block below
      }
    }

    // 2. Client-side M3U loading and parsing fallback
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
        // Fallback to allorigins.win public proxy to bypass CORS
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

      const clientChannels = parsed.map((c: Channel) => ({
        ...c,
        url: ensureSecureUrl(c.url, false) // keep original URLs directly (no server proxy)
      }));

      setChannels(clientChannels);
      setActivePlaylistUrl(url);
      localStorage.setItem('sflive-playlist-url', url);

      if (clientChannels.length > 0) {
        setCurrentChannel(clientChannels[0]);
      }
      setIsLoadingPlaylist(false);
      return true;
    } catch (err: any) {
      console.error('Client-side playlist load/parse error:', err);
      setPlaylistError(err.message || 'Failed to load playlist in static client mode');
      setIsLoadingPlaylist(false);
      return false;
    }
  };

  // Auto-load playlist on startup
  useEffect(() => {
    loadPlaylist(activePlaylistUrl);
  }, []);

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
