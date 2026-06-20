import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel } from '../types';
import { channels } from '../data/channels';

interface AppContextType {
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel) => void;
  favorites: string[];
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <AppContext.Provider
      value={{
        currentChannel,
        setCurrentChannel,
        favorites,
        toggleFavorite,
        isFavorite,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
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
