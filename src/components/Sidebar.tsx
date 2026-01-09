import { useState } from 'react';
import { MenuItem } from '../types';

interface SidebarProps {
  activeItem: string;
  onItemSelect: (item: string) => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚏' },
  { id: 'transaction', label: 'Transaction', icon: '☰' },
  { id: 'autopay', label: 'Auto Pay', icon: '⏰' },
  { id: 'goals', label: 'Goals', icon: '⭐' },
  { id: 'insights', label: 'Insights', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙', hasSubmenu: true },
  { id: 'message', label: 'Message', icon: '✉', hasNotification: true, notificationCount: 2 },
  { id: 'investment', label: 'Investment', icon: '$', hasSubmenu: true },
];

const bottomItems: MenuItem[] = [
  { id: 'support', label: 'Support', icon: '💬' },
  { id: 'logout', label: 'Log out', icon: '→', isLogout: true },
];

export function Sidebar({ activeItem, onItemSelect }: SidebarProps) {
  const [isProExpanded, setIsProExpanded] = useState(false);

  return (
    <div className="w-64 bg-white h-screen flex flex-col border-r border-gray-200" style={{ fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-black text-base tracking-tight">Prime Pay</div>
            <div className="text-gray-500 text-xs font-medium">Finance App</div>
          </div>
          <span className="text-gray-400 text-xs">▼</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={`w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 ${
              activeItem === item.id ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-r-3 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`text-lg ${activeItem === item.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <span className={`text-sm font-semibold tracking-tight ${
                activeItem === item.id ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {item.hasNotification && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.notificationCount}
                </span>
              )}
              {item.hasSubmenu && (
                <span className="text-gray-400 text-xs">▼</span>
              )}
            </div>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Bottom Items */}
      <div className="py-4">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className="w-full px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-all duration-200"
          >
            <span className={`text-lg ${item.isLogout ? 'text-red-500' : 'text-gray-500'}`}>
              {item.icon}
            </span>
            <span className={`text-sm font-semibold tracking-tight ${
              item.isLogout ? 'text-red-500' : 'text-gray-700'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* PRO Upgrade Section */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-200 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold">P</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-black text-sm tracking-tight">PRO</div>
            <div className="text-gray-600 text-xs mt-1 leading-relaxed">
              Reminders, exits projects, advanced searching and more
            </div>
            <button 
              onClick={() => setIsProExpanded(!isProExpanded)}
              className="text-orange-600 text-xs font-semibold mt-2 hover:text-orange-700 transition-colors"
            >
              {isProExpanded ? 'Learn less ▲' : 'Learn more ▼'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}