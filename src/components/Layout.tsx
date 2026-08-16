import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Users, 
  Package, 
  BarChart3, 
  LogOut,
  Store
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../App';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  storeNameEn?: string;
  storeNameUr?: string;
}

export default function Layout({ children, storeNameEn, storeNameUr }: LayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', urName: 'ڈیش بورڈ', path: '/', icon: LayoutDashboard },
    { name: 'Quick Entry', urName: 'فوری اندراج', path: '/entry', icon: MessageSquarePlus },
    { name: 'Udhaar Khata', urName: 'ادھار کھاتہ', path: '/udhaar', icon: Users },
    { name: 'Stock Register', urName: 'سٹاک رجسٹر', path: '/stock', icon: Package },
    { name: 'Reports', urName: 'رپورٹس', path: '/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex w-72 bg-kiryana-green text-white flex-col sticky top-0 h-screen shadow-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <Store className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold tracking-tight">{storeNameEn || 'Kiryana Accountant'}</h1>
          </div>
          <p className="text-sm font-urdu opacity-80 text-right leading-relaxed" dir="rtl">
            {storeNameUr || 'کریانہ اکاؤنٹنٹ'}
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all group",
                isActive 
                  ? "bg-white text-kiryana-green shadow-lg" 
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-[10px] font-urdu text-right" dir="rtl">{item.urName}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-kiryana-green text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6" />
            <span className="font-bold truncate">{storeNameEn || 'Kiryana Accountant'}</span>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
