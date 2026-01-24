
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, User as UserIcon, LogOut, WifiOff, Shield } from 'lucide-react';
import { User, GlobalSettings } from '../types';
import { db } from '../services/data';

interface HeaderProps {
  cartCount: number;
  currentUser: User | null;
  onCartClick: () => void;
  onLogoClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  currentUser,
  onCartClick, 
  onLogoClick, 
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  onAdminClick,
}) => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const isOnline = db.getCloudStatus();
  const showAdminButton = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

  useEffect(() => {
    db.getSettings().then(setSettings);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-2 cursor-pointer group"
        >
          {settings?.logo ? (
            <img 
              src={settings.logo} 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
          ) : (
            <div className="bg-brand-500 p-1.5 rounded-lg text-white transform group-hover:scale-110 transition-transform duration-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Zap size={24} strokeWidth={2.5} fill="currentColor" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none">
              Volpony<span className="text-brand-500">Delivery</span>
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
               {isOnline ? (
                 <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-100">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span> Online
                 </span>
               ) : (
                 <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full border border-gray-200">
                    <WifiOff size={8} /> Local
                 </span>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 mr-2">
              {showAdminButton && (
                <button 
                  onClick={onAdminClick}
                  className="flex items-center gap-2 text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold border border-brand-100"
                >
                  <Shield size={18} />
                  <span className="hidden md:inline">Painel</span>
                </button>
              )}
              <button 
                onClick={onProfileClick}
                className="flex items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors"
              >
                 <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center border border-brand-200">
                    <UserIcon size={16} />
                 </div>
                 <span className="text-sm font-medium hidden sm:inline-block">
                   {currentUser.name.split(' ')[0]}
                 </span>
              </button>
              <button 
                onClick={onLogoutClick}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium mr-2"
            >
              <UserIcon size={18} />
              Entrar
            </button>
          )}
          <div className="h-6 w-px bg-gray-200"></div>
          <button 
            onClick={onCartClick}
            className="relative p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-500 rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
