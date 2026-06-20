import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-sflive-bg text-sflive-text overflow-hidden selection:bg-sflive-primary/30">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-sflive-bg to-sflive-bg">
          {children}
        </main>
      </div>
    </div>
  );
};
