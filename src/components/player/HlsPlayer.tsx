import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume1, Volume2, VolumeX, Maximize, PictureInPicture, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Channel } from '../../types';
import { ImageWithFallback } from '../ui/ImageWithFallback';

interface HlsPlayerProps {
  channel: Channel;
}

const getPlayableUrl = (url: string): string => {
  if (!url) return url;

  // 1. Clean existing proxy wrappers if any to start with the pristine stream URL
  let cleanUrl = url;
  if (cleanUrl.startsWith('https://cors-proxy.cooks.fyi/')) {
    cleanUrl = cleanUrl.replace('https://cors-proxy.cooks.fyi/', '');
  }
  if (cleanUrl.startsWith('/api/stream?url=')) {
    cleanUrl = decodeURIComponent(cleanUrl.replace('/api/stream?url=', ''));
  }
  if (cleanUrl.startsWith('/api/stream/')) {
    cleanUrl = cleanUrl.replace('/api/stream/', '');
  }
  if (cleanUrl.startsWith('http://localhost:3000/api/stream?url=')) {
    cleanUrl = decodeURIComponent(cleanUrl.replace('http://localhost:3000/api/stream?url=', ''));
  }
  if (cleanUrl.startsWith('http://localhost:3000/api/stream/')) {
    cleanUrl = cleanUrl.replace('http://localhost:3000/api/stream/', '');
  }

  // Double-repair collapsed slashes in case they were already collapsed in stored playlists
  if (cleanUrl.startsWith('http:/') && !cleanUrl.startsWith('http://')) {
    cleanUrl = 'http://' + cleanUrl.substring('http:/'.length);
  } else if (cleanUrl.startsWith('https:/') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl.substring('https:/'.length);
  }

  // 2. If it is already a secure HTTPS url, play it directly!
  // Secure streams have no mixed-content blocks, and playing them directly avoids relative path resolution issues.
  if (cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // 3. If it is an insecure HTTP url, we MUST proxy it to prevent Mixed Content blocking.
  // We prepend our wildcard pathname proxy "/api/stream/http://..." which preserves relative pathing perfectly.
  // We fall back to a public CORS/HLS proxy if we are running in static client mode (e.g. Netlify / GitHub Pages)
  if (cleanUrl.startsWith('http://')) {
    const isLocalOrDevServer = 
      window.location.hostname === 'localhost' || 
      window.location.port === '3000' ||
      window.location.hostname.includes('.run.app') || 
      window.location.hostname.includes('ais-dev-') ||
      window.location.hostname.includes('ais-pre-');

    if (isLocalOrDevServer) {
      return `/api/stream/${cleanUrl}`;
    } else {
      return `https://cors-proxy.cooks.fyi/${cleanUrl}`;
    }
  }

  return cleanUrl;
};

export const HlsPlayer: React.FC<HlsPlayerProps> = ({ channel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('sflive-player-volume');
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('sflive-player-muted');
    return saved === 'true';
  });
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  let hideControlsTimeout: NodeJS.Timeout;

  // Sync state values directly to video element properties without rebuilding player stream
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
    localStorage.setItem('sflive-player-volume', volume.toString());
    localStorage.setItem('sflive-player-muted', isMuted.toString());
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setError(null);
    setIsBuffering(true);

    const initPlayer = () => {
      const playableUrl = getPlayableUrl(channel.url);
      
      if (Hls.isSupported()) {
        hls = new Hls({
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          lowLatencyMode: true,
        });

        hls.loadSource(playableUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
               playPromise.catch((e) => {
                 if (e.name !== 'AbortError') {
                   console.warn('Autoplay prevented', e);
                 }
                 // Ignore AbortError caused by rapid switching
                 if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
                   setIsPlaying(false);
                 }
               });
            }
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error encountered while loading the stream.');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error encountered. Trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                setError('A fatal player error occurred. The stream might be offline.');
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = playableUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsBuffering(false);
          if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
               playPromise.catch((e) => {
                 if (e.name !== 'AbortError') {
                   console.warn('Autoplay prevented', e);
                 }
                 if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
                   setIsPlaying(false);
                 }
               });
            }
          }
        });
        
        video.addEventListener('error', () => {
          setError('Failed to load media. The stream might be offline.');
        });
      }
    };

    initPlayer();

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setError(null);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      if (hls) hls.destroy();
    };
  }, [channel.url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.5);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && playerContainerRef.current) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const togglePip = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('Failed to enter/exit PIP', err);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.05));
          setIsMuted(false);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.05));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(hideControlsTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPlaying, isMuted, volume]); // Note: In a real app we'd use Refs for state in event listeners or stable handlers, here we just re-bind.

  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="w-12 h-12 text-sflive-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center z-20">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Playback Error</h3>
          <p className="text-sflive-muted text-sm">{error}</p>
        </div>
      )}



      {/* Modern Controls Interface */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex flex-col justify-end",
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
             </button>
             <div className="flex items-center gap-1.5">
               <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer" title="Mute/Unmute">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-6 h-6 text-red-500" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
               </button>
               
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.05"
                 value={isMuted ? 0 : volume}
                 onChange={handleVolumeChange}
                 className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sflive-primary"
                 title="Volume Slider"
                 aria-label="Volume Slider"
               />
             </div>
             
             {/* Channel Info embedded in player controls */}
             <div className="ml-2 border-l border-white/20 pl-4 flex items-center gap-3">
               {channel.logo && (
                 <div className="h-8 w-12 rounded overflow-hidden flex-shrink-0 bg-white/10 p-0.5">
                   <ImageWithFallback src={channel.logo} alt={channel.name} fallbackName={channel.name} className="w-full h-full object-contain" />
                 </div>
               )}
               <div>
                  <h4 className="text-sm font-semibold text-white leading-tight">{channel.name}</h4>
                  <p className="text-xs text-sflive-primary font-medium">{channel.category}</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={togglePip} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white" title="Picture in Picture">
               <PictureInPicture className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white" title="Fullscreen">
               <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
