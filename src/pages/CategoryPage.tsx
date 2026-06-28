import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Play } from 'lucide-react';
import { Channel } from '../types';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';

export const CategoryPage = ({ isFavorites = false }: { isFavorites?: boolean }) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { setCurrentChannel, favorites, channels } = useApp();

  let filteredChannels: Channel[] = [];
  let title = '';

  if (isFavorites) {
    filteredChannels = channels.filter(c => favorites.includes(c.id));
    title = 'Your Favorites';
  } else {
    filteredChannels = channels.filter(c => c.category === categoryId);
    title = `${categoryId} Channels`;
  }

  const handlePlayChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    navigate('/live');
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 border-b border-white/5 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-sflive-muted">
          {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'} available Let's start watching.
        </p>
      </div>

      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {filteredChannels.map(channel => (
            <div 
              key={channel.id}
              onClick={() => handlePlayChannel(channel)}
              className="group cursor-pointer rounded-xl glass hover:bg-white/10 transition-all duration-300 overflow-hidden relative border border-white/5 hover:border-sflive-primary/50 aspect-square flex flex-col justify-between p-4"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-sflive-bg via-sflive-bg/40 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
              
              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-sflive-primary/90 text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-sflive-primary/30">
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </div>
              </div>

              <div className="z-20 w-16 h-16 bg-white/10 backdrop-blur rounded p-2 self-start shadow-md object-contain border border-white/10 mx-auto mt-4 overflow-hidden">
                <ImageWithFallback src={channel.logo} alt={channel.name} fallbackName={channel.name} className="w-full h-full object-contain" />
              </div>

              <div className="z-20 text-center mt-4">
                 <h3 className="font-bold text-md text-white px-2 truncate group-hover:text-sflive-primary transition-colors">{channel.name}</h3>
                 <p className="text-xs text-sflive-muted mt-1 uppercase">{channel.country}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center border-dashed">
          <p className="text-sflive-muted">No channels found in this section.</p>
          {isFavorites && (
            <button 
              onClick={() => navigate('/')}
              className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Explore Channels
            </button>
          )}
        </div>
      )}
    </div>
  );
};
