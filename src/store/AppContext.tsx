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

const ensureSecureUrl = (url: string): string => {
  if (!url) return url;
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

const secureDefaultChannels = defaultChannels.map(c => ({
  ...c,
  url: ensureSecureUrl(c.url)
}));

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>(secureDefaultChannels);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePlaylistUrl, setActivePlaylistUrl] = useState(() => {
    return localStorage.getItem('sflive-playlist-url') || 'https://go.skym3u.top/2k8o.m3u';
  });
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);

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
    try {
      const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
        const secureChannels = data.channels.map((c: Channel) => ({
          ...c,
          url: ensureSecureUrl(c.url)
        }));
        setChannels(secureChannels);
        setActivePlaylistUrl(url);
        localStorage.setItem('sflive-playlist-url', url);
        // Automatically select the first channel if none or invalid is selected
        if (secureChannels.length > 0) {
          setCurrentChannel(secureChannels[0]);
        }
        setIsLoadingPlaylist(false);
        return true;
      } else {
        throw new Error(data.error || 'No valid channels found in this playlist');
      }
    } catch (err: any) {
      console.error('Error loading playlist:', err);
      setPlaylistError(err.message || 'Failed to load playlist');
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
