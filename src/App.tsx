import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { LiveTV } from './pages/LiveTV';
import { CategoryPage } from './pages/CategoryPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<LiveTV />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/favorites" element={<CategoryPage isFavorites={true} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
