import { useState } from 'react';
import { Button } from '../components/ui/button';
import { 
  Home, 
  CreditCard, 
  Target, 
  TrendingUp, 
  Settings, 
  MessageSquare, 
  Brain,
  ChevronDown,
  ChevronRight,
  Star,
  Crown,
  LogOut,
  HelpCircle,
  Zap,
  Shield,
  Bell
} from 'lucide-react';

interface PremiumSidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

export function PremiumSidebar({ activeItem, setActiveItem }: PremiumSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['settings']);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      pro: false
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      pro: false,
      submenu: [
        { id: 'all-transactions', label: 'All Transactions' },
        { id: 'recurring', label: 'Recurring' },
        { id: 'categories', label: 'Categories' }
      ]
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      pro: false
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Brain,
      pro: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      submenu: [
        { id: 'profile', label: 'Profile' },
        { id: 'security', label: 'Security' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'billing', label: 'Billing' }
      ]
    }
  ];

  const bottomItems = [
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      pro: false
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: LogOut,
      pro: false
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Prime Pay</h1>
            <p className="text-xs text-gray-500">Finance App</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={activeItem === item.id ? 'default' : 'ghost'}
              className={`w-full justify-between ${
                activeItem === item.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                if (item.submenu) {
                  toggleMenu(item.id);
                } else {
                  setActiveItem(item.id);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.pro && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
              {item.submenu && (
                expandedMenus.includes(item.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              )}
            </Button>

            {item.submenu && expandedMenus.includes(item.id) && (
              <div className="ml-4 mt-2 space-y-1">
                {item.submenu.map((subItem) => (
                  <Button
                    key={subItem.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start ${
                      activeItem === subItem.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveItem(subItem.id)}
                  >
                    {subItem.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Pro Upgrade Banner */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-bold">Upgrade to Pro</span>
          </div>
          <p className="text-xs mb-3 opacity-90">
            Get AI insights, advanced analytics, and more
          </p>
          <Button size="sm" className="w-full bg-white text-purple-600 hover:bg-gray-100">
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Bottom Items */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {bottomItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start ${
              activeItem === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveItem(item.id)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}