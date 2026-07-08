import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Star, Tv, ChevronLeft, ChevronRight, Trophy, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../store/AppContext';
import { Channel } from '../types';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';

// Import custom generated FIFA 2026 hero images
const fifaStadiumImg = new URL('../assets/images/fifa_stadium_2026_1783517058030.jpg', import.meta.url).href;
const footballerActionImg = new URL('../assets/images/footballer_action_2026_1783517082654.jpg', import.meta.url).href;
const worldCupGloryImg = new URL('../assets/images/world_cup_glory_2026_1783517101519.jpg', import.meta.url).href;

export const Home = () => {
  const navigate = useNavigate();
  const { setCurrentChannel, channels } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // FIFA 2026 Hero Slides setup
  const slides = [
    {
      id: 1,
      image: fifaStadiumImg,
      badge: { text: 'FIFA WORLD CUP 2026 • UNITED', icon: Trophy, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
      title: 'Experience FIFA 2026 Live',
      description: 'The countdown is on! Stream all 104 matches live from USA, Canada, and Mexico on SFLIVE. Catch every historic moment in crystal-clear ultra low-latency.',
      actionText1: 'Watch Live Sports',
      actionType1: 'navigate',
      actionValue1: '/category/Sports',
      actionText2: 'Browse Schedules',
      actionType2: 'navigate',
      actionValue2: '/live'
    },
    {
      id: 2,
      image: footballerActionImg,
      badge: { text: 'SUPERSTARS IN FOCUS', icon: Star, color: 'text-sflive-primary bg-sflive-primary/10 border-sflive-primary/20' },
      title: 'Follow Your Favorite Players',
      description: 'Watch the worlds elite talents including Kylian Mbappé, Erling Haaland, and Lionel Messi battle on soccer’s biggest stage. Stay closer to the actions.',
      actionText1: 'Watch Highlights',
      actionType1: 'play',
      actionValue1: 'sports', // fallback to sports
      actionText2: 'Explore Categories',
      actionType2: 'navigate',
      actionValue2: '/live'
    },
    {
      id: 3,
      image: worldCupGloryImg,
      badge: { text: 'ROAD TO THE FINALS', icon: Calendar, color: 'text-sflive-secondary bg-sflive-secondary/10 border-sflive-secondary/20' },
      title: 'NYNJ MetLife Stadium Grand Finale',
      description: 'Witness the journey from group stage drama to crowning the world champions. Feel every stadium roar, penalty shootout, and incredible match-winner.',
      actionText1: 'Watch Live Now',
      actionType1: 'play',
      actionValue1: 'default',
      actionText2: 'Sports Selection',
      actionType2: 'navigate',
      actionValue2: '/category/Sports'
    }
  ];

  // Auto transition slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideAction = (type: string, value: string) => {
    if (type === 'navigate') {
      navigate(value);
    } else if (type === 'play') {
      const sportsChannel = channels.find(c => c.category === 'Sports') || channels[0];
      if (sportsChannel) {
        handlePlayChannel(sportsChannel);
      }
    }
  };

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
      
      {/* Hero Slider Section */}
      <section className="relative rounded-2xl overflow-hidden glass border border-white/5 h-[420px] sm:h-[480px] group/hero">
        {slides.map((slide, index) => {
          const BadgeIcon = slide.badge.icon;
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive 
                  ? 'opacity-100 pointer-events-auto z-10' 
                  : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* Image background with modern dark gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-sflive-bg via-sflive-bg/75 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-sflive-bg via-transparent to-transparent z-10 opacity-60"></div>
              
              <motion.img 
                animate={isActive ? { scale: 1.15, opacity: 0.5 } : { scale: 1.0, opacity: 0 }}
                transition={{ duration: isActive ? 6 : 0.8, ease: "easeOut" }}
                src={slide.image} 
                alt={slide.title} 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
              />
              
              {/* Slide Content with premium stagged slide/fade entrance */}
              <motion.div 
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: isActive ? 0.2 : 0, ease: "easeOut" }}
                className="relative z-20 p-8 lg:p-14 max-w-2xl flex flex-col justify-center h-full"
              >
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border mb-4 self-start ${slide.badge.color}`}>
                  <BadgeIcon className="w-3.5 h-3.5" />
                  {slide.badge.text}
                </span>
                
                <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
                  {slide.title}
                </h1>
                
                <p className="text-sm sm:text-base text-sflive-muted mb-8 leading-relaxed max-w-xl">
                  {slide.description}
                </p>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <button 
                    onClick={() => handleSlideAction(slide.actionType1, slide.actionValue1)}
                    className="bg-gradient-to-r from-sflive-primary to-sflive-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2.5 hover:scale-105 transition-transform duration-200 cursor-pointer shadow-lg shadow-sflive-primary/20"
                  >
                    <Play className="w-4.5 h-4.5 fill-current" />
                    {slide.actionText1}
                  </button>
                  <button 
                    onClick={() => handleSlideAction(slide.actionType2, slide.actionValue2)}
                    className="glass px-6 py-3 rounded-xl font-medium text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                  >
                    {slide.actionText2}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Manual Arrow Controls (Left/Right) */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 opacity-0 group-hover/hero:opacity-100 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 opacity-0 group-hover/hero:opacity-100 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bullet Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide 
                  ? 'w-6 bg-sflive-primary' 
                  : 'w-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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
