import React from 'react';
import { Menu, Search, User, Bell } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { setSidebarOpen, searchQuery, setSearchQuery } = useApp();
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (window.location.pathname !== '/live' && window.location.pathname !== '/favorites' && e.target.value.length > 0) {
       // Optional: Navigate to a global search or let local page handle it.
       // We'll keep it simple and just set the context state.
    }
  };

  return (
    <header className="h-20 glass sticky top-0 z-30 flex items-center justify-between px-6 border-b border-white/5 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-2 text-sflive-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-sflive-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-sflive-card/50 text-white placeholder-sflive-muted focus:outline-none focus:ring-1 focus:ring-sflive-primary focus:border-sflive-primary transition-colors sm:text-sm"
            placeholder="Search channels, categories..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 text-sflive-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-sflive-primary rounded-full"></span>
        </button>
        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>
        <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sflive-secondary to-sflive-primary flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-sflive-bg rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="text-sm font-medium hidden sm:block">User Profile</span>
        </button>
      </div>
    </header>
  );
};
