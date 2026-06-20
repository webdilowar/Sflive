import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Tv, 
  Trophy, 
  Newspaper, 
  Film, 
  Gamepad2, 
  Music, 
  Heart, 
  Settings,
  Languages,
  Globe,
  X // for mobile close
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../store/AppContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Tv, label: 'Live TV', path: '/live' },
  { icon: Trophy, label: 'Sports', path: '/category/Sports' },
  { icon: Newspaper, label: 'News', path: '/category/News' },
  { icon: Globe, label: 'Bangla', path: '/category/Bangla' },
  { icon: Languages, label: 'Hindi', path: '/category/Hindi' },
  { icon: Film, label: 'Movies', path: '/category/Movies' },
  { icon: Gamepad2, label: 'Kids', path: '/category/Kids' },
  { icon: Music, label: 'Music', path: '/category/Music' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
];

export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 glass shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none border-r border-white/5",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Area */}
        <div className="h-20 flex items-center px-6 justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sflive-primary to-sflive-secondary flex items-center justify-center font-bold text-white text-xl">S</div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">SFLIVE</span>
          </div>
          <button 
            className="lg:hidden p-2 text-sflive-muted hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-gradient-to-r from-sflive-primary/10 to-sflive-secondary/10 text-sflive-primary" 
                    : "text-sflive-muted hover:bg-white/5 hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("w-5 h-5", isActive ? "text-sflive-primary" : "text-sflive-muted group-hover:text-white")} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-sflive-muted hover:bg-white/5 hover:text-white text-sm font-medium">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};
