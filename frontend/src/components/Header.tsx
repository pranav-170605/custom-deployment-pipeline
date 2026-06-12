// components/Header.tsx
'use client';

import React from 'react';
import { Bell } from 'lucide-react';


type HeaderProps = {
  title?: string;
  showNotification?: boolean;
  showPremium?: boolean;
  profileInitial?: string;
  onNotificationClick?: () => void;
  onPremiumClick?: () => void;
  onProfileClick?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  title = '',
  showNotification = true,
  showPremium = true,
  profileInitial = 'A',
  onNotificationClick = () => {},
  onPremiumClick = () => {},
  onProfileClick = () => {},
}) => {
  return (
    <header className="flex items-center justify-between py-3 px-4 bg-white border-b border-gray-300">
      <div className="flex items-center">
        {title && <h1 className="text-lg text-zinc-800 font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center">
        {showNotification && (
          
        <button className="mr-4" onClick={onNotificationClick}>
          <Bell className="h-5 w-5 text-gray-900" />
        </button>
        )}
        {showPremium && (
          <button 
            className="bg-teal-600 text-white text-xs px-3 py-1 rounded-md"
            onClick={onPremiumClick}
          >
            Go Premium
          </button>
        )}
        <button 
          className="ml-3 bg-gray-300 text-gray-800 h-8 w-8 rounded-full flex items-center justify-center text-sm"
          onClick={onProfileClick}
        >
          {profileInitial}
        </button>
      </div>
    </header>
  );
};

export default Header;