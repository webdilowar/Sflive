import React from 'react';
import { useNavigate } from 'react-router-dom';
import { channels } from '../data/channels';
import { Play, TrendingUp, Star, Tv } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Channel } from '../types';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';

export const Home = () => {
  const navigate = useNavigate();
  const { setCurrentChannel } = useApp();

  const handlePlayChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    navigate('/live');
  };

  // Organize channels for display
  const featuredChannels = channels.slice(0, 4);
  const popularChannels = channels.slice(4, 10);
  
  const categories = [
    { title: 'Bangla Channels', data: channels.filter(c => c.category === 'Bangla') },
    { title: 'Hindi Channels', data: channels.filter(c => c.category === 'Hindi') },
    { title: 'Sports Highlights', data: channels.filter(c => c.category === 'Sports') },
    { title: '24/7 News', data: channels.filter(c => c.category === 'News') },
    { title: 'Movies & Entertainment', data: channels.filter(c => c.category === 'Movies') },
    { title: 'Kids', data: channels.filter(c => c.category === 'Kids') },
    { title: 'Music', data: channels.filter(c => c.category === 'Music') }
  ];

  const ChannelCard = ({ channel, landscape = false }: { channel: Channel, landscape?: boolean }) => (
    <div 
      onClick={() => handlePlayChannel(channel)}
      className={`group cursor-pointer rounded-xl glass hover:bg-white/10 transition-all duration-300 overflow-hidden relative border border-white/5 hover:border-sflive-primary/50 shrink-0 ${
        landscape ? "w-[280px] sm:w-[320px] aspect-video" : "w-[160px] sm:w-[200px] aspect-[3/4]"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-sflive-bg via-sflive-bg/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity"></div>
      
      {/* Play Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-14 h-14 rounded-full bg-sflive-primary/90 text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-sflive-primary/30">
          <Play className="w-6 h-6 ml-1 fill-current" />
        </div>
      </div>

      <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
         <div className="w-12 h-12 flex-shrink-0 bg-white/10 backdrop-blur rounded p-1 mb-3 self-start shadow-md object-contain border border-white/10 overflow-hidden">
           <ImageWithFallback src={channel.logo} alt={channel.name} fallbackName={channel.name} className="w-full h-full object-contain" />
         </div>
         <h3 className="font-bold text-lg text-white leading-tight mb-1 group-hover:text-sflive-primary transition-colors">{channel.name}</h3>
         <p className="text-xs text-sflive-muted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            LIVE • {channel.category}
         </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 pb-24 lg:p-10 space-y-12">
      
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden glass border border-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-sflive-bg via-sflive-bg/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop" 
          alt="Featured TV" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-20 p-8 lg:p-14 max-w-2xl flex flex-col justify-center h-full">
          <span className="text-xs font-bold tracking-widest text-sflive-primary uppercase mb-3 flex items-center gap-2">
             <Star className="w-4 h-4" /> Featured Pick
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white">Experience Live Sports Like Never Before</h1>
          <p className="text-lg text-sflive-muted mb-8 leading-relaxed">Watch Red Bull TV, Fubo Sports, and top-tier global sports instantly on SFLIVE without any buffer.</p>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => handlePlayChannel(channels.find(c => c.id === 'red-bull-tv') || channels[0])}
               className="bg-gradient-to-r from-sflive-primary to-sflive-secondary text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-transform duration-200 shadow-lg shadow-sflive-primary/30"
             >
               <Play className="w-5 h-5 fill-current" />
               Watch Now
             </button>
             <button 
               onClick={() => navigate('/category/Sports')}
               className="glass px-8 py-3.5 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
             >
               More Sports
             </button>
          </div>
        </div>
      </section>

      {/* Popular Channels */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-sflive-secondary" /> 
            Popular Now
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar mask-edges">
          {popularChannels.map(channel => (
            <div key={channel.id} className="snap-start">
               <ChannelCard channel={channel} landscape />
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Categories */}
      {categories.map((cat, idx) => cat.data.length > 0 && (
        <section key={idx}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Tv className="w-5 h-5 text-sflive-muted" /> 
              {cat.title}
            </h2>
            <button 
              onClick={() => navigate(`/category/${cat.data[0].category}`)}
              className="text-sm font-medium text-sflive-primary hover:text-white transition-colors"
            >
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar mask-edges">
            {cat.data.map(channel => (
              <div key={channel.id} className="snap-start">
                 <ChannelCard channel={channel} />
              </div>
            ))}
          </div>
        </section>
      ))}
      
    </div>
  );
};
