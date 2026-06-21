import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bus, AlertTriangle, ClipboardList, Shield, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useBusCheckStore } from '../../store';

const navItems = [
  { to: '/dashboard', label: '线路看板', icon: Bus, end: false },
  { to: '/exceptions', label: '异常处理', icon: AlertTriangle, end: false },
  { to: '/records', label: '记录查询', icon: ClipboardList, end: false },
];

export const Navbar: React.FC = () => {
  const { currentOperator } = useBusCheckStore();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">校车安全核验工作台</h1>
              <p className="text-[10px] text-slate-400">School Bus Safety Verification</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/30 shadow-inner'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-1.5 ring-1 ring-slate-700">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700">
                <User className="h-3.5 w-3.5 text-slate-200" />
              </div>
              <div className="text-xs">
                <p className="font-medium text-slate-100">{currentOperator.name}</p>
                <p className="text-[10px] text-slate-400">安全管理员</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex md:hidden items-center gap-1 pb-3 -mx-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

Navbar.displayName = 'Navbar';
