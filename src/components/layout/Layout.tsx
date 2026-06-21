import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-500">
            校车安全核验工作台 · 保障学生上下车安全
          </p>
        </div>
      </footer>
    </div>
  );
};

Layout.displayName = 'Layout';
