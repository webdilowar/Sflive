import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { HlsPlayer } from '../components/player/HlsPlayer';
import { Heart, Search, PlayCircle, Tv } from 'lucide-react';
import { cn } from '../lib/utils';
import { Channel } from '../types';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';

export const LiveTV = () => {
  const { 
    currentChannel, 
    setCurrentChannel, 
    favorites, 
    toggleFavorite, 
    isFavorite, 
    searchQuery, 
    setSearchQuery, 
    channels 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // If no channel is selected, select the first one by default
  useEffect(() => {
    if (!currentChannel && channels.length > 0) {
      setCurrentChannel(channels[0]);
    }
  }, [currentChannel, setCurrentChannel, channels]);

  // Sync category filter with selected channel's category when channel changes
  useEffect(() => {
    if (currentChannel && currentChannel.category) {
      setSelectedCategory(currentChannel.category);
    }
  }, [currentChannel]);

  // Dynamically compute unique categories from current active playlist channels
  const categories = useMemo(() => {
    const uniqCats = Array.from(new Set(channels.map(c => c.category).filter(Boolean)));
    return ['All', ...uniqCats];
  }, [channels]);

  // Combined filter logic: Category + Search query
  const filteredChannels = useMemo(() => {
    let result = channels;

    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(lowerQuery) || 
             c.category.toLowerCase().includes(lowerQuery) ||
             c.country.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [channels, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col xl:flex-row h-full max-h-full">
      {/* Player Main Area */}
      <div className="flex-1 flex flex-col p-4 xl:p-6 gap-6 min-h-[50vh] xl:min-h-0 overflow-y-auto">
        {currentChannel ? (
          <>
             <div className="w-full shadow-2xl shadow-sflive-primary/10 rounded-xl border border-white/5 bg-black">
                <HlsPlayer channel={currentChannel} />
             </div>
             
             {/* Current Channel Info */}
             <div className="glass p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-xl bg-white/5 p-2 flex items-center justify-center shrink-0 border border-white/10">
                     <ImageWithFallback 
                       src={currentChannel.logo} 
                       alt={currentChannel.name}
                       fallbackName={currentChannel.name}
                       className="max-w-full max-h-full object-contain drop-shadow-lg"
                     />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold tracking-tight text-white">{currentChannel.name}</h1>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-sflive-muted border border-white/5 uppercase">
                         {currentChannel.country}
                      </span>
                    </div>
                    <p className="text-sflive-primary font-medium text-sm mb-2">{currentChannel.category}</p>
                    <p className="text-sflive-muted text-sm max-w-2xl leading-relaxed">{currentChannel.description}</p>
                  </div>
                </div>
                
                <button
                   onClick={() => toggleFavorite(currentChannel.id)}
                   className={cn(
                     "shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 border",
                     isFavorite(currentChannel.id) 
                       ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                       : "glass text-white hover:bg-white/10"
                   )}
                >
                  <Heart className={cn("w-5 h-5", isFavorite(currentChannel.id) && "fill-current")} />
                  {isFavorite(currentChannel.id) ? 'Favorited' : 'Add to Favorites'}
                </button>
             </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sflive-muted">Select a channel to start watching</p>
          </div>
        )}
      </div>

      {/* Channel List Sidebar */}
      <div className="w-full xl:w-96 shrink-0 border-l border-white/5 bg-sflive-bg/90 backdrop-blur flex flex-col max-h-[500px] xl:max-h-none overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-sflive-bg space-y-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              <Tv className="w-5 h-5 text-sflive-primary" />
              Live Channels
            </h2>
            <span className="text-xs bg-sflive-primary/10 text-sflive-primary px-2 py-0.5 rounded-full font-semibold">
              {filteredChannels.length} TV
            </span>
          </div>

          {/* Local Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-sflive-muted" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors text-xs"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Horizontal Category List */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                  selectedCategory === cat
                    ? "bg-sflive-primary text-black shadow-md shadow-sflive-primary/25 font-bold"
                    : "bg-white/5 text-sflive-muted hover:bg-white/10 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
           {filteredChannels.length > 0 ? (
             filteredChannels.map(channel => (
               <button
                 key={channel.id}
                 onClick={() => setCurrentChannel(channel)}
                 className={cn(
                   "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left group border border-transparent",
                   currentChannel?.id === channel.id 
                     ? "bg-sflive-primary/10 border-sflive-primary/30" 
                     : "hover:bg-white/5 hover:border-white/10"
                 )}
               >
                 <div className="w-12 h-12 rounded-lg bg-white/5 p-1.5 flex items-center justify-center shrink-0">
                    <ImageWithFallback 
                      src={channel.logo} 
                      alt={channel.name}
                      fallbackName={channel.name}
                      className="max-w-full max-h-full object-contain"
                    />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className={cn(
                     "font-medium truncate transition-colors", 
                     currentChannel?.id === channel.id ? "text-sflive-primary" : "text-white group-hover:text-sflive-primary"
                   )}>
                     {channel.name}
                   </h3>
                   <div className="flex items-center gap-2 text-xs text-sflive-muted mt-1">
                     <span className="bg-white/10 px-1.5 py-0.5 rounded uppercase">{channel.country}</span>
                     <span>•</span>
                     <span>{channel.category}</span>
                   </div>
                 </div>
                 {currentChannel?.id === channel.id ? (
                   <div className="w-6 h-6 rounded-full bg-sflive-primary flex items-center justify-center shrink-0 shadow-lg shadow-sflive-primary/30">
                     <PlayCircle className="w-4 h-4 text-sflive-bg fill-current" />
                   </div>
                 ) : (
                   <Heart 
                     className={cn(
                       "w-5 h-5 transition-colors shrink-0", 
                       isFavorite(channel.id) ? "text-red-500 fill-red-500" : "text-sflive-muted opacity-0 group-hover:opacity-100"
                     )} 
                     onClick={(e) => {
                       e.stopPropagation();
                       toggleFavorite(channel.id);
                     }}
                   />
                 )}
               </button>
             ))
           ) : (
             <div className="p-8 text-center flex flex-col items-center">
               <Search className="w-8 h-8 text-sflive-muted mb-3 opacity-50" />
               <p className="text-sflive-muted text-sm">No channels found</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
