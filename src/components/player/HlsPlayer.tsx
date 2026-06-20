import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Channel } from '../../types';
import { ImageWithFallback } from '../ui/ImageWithFallback';

interface HlsPlayerProps {
  channel: Channel;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({ channel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  let hideControlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setError(null);
    setIsBuffering(true);

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          lowLatencyMode: true,
        });

        hls.loadSource(channel.url);
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
        video.src = channel.url;
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
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(hideControlsTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPlaying, isMuted]); // Note: In a real app we'd use Refs for state in event listeners or stable handlers, here we just re-bind.

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

      {/* Live Badge Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded bg-red-600/90 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      </div>

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
             <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6" />}
             </button>
             
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
