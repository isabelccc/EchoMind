'use client';

import { 
  Phone, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Clock,
  Star
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Active Calls',
    icon: Phone,
    href: '#',
    count: 3,
    active: true,
  },
  {
    name: 'Recent Sessions',
    icon: Clock,
    href: '#',
    count: 12,
  },
  {
    name: 'Team Chat',
    icon: MessageSquare,
    href: '#',
    count: 5,
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    href: '#',
  },
  {
    name: 'Team Members',
    icon: Users,
    href: '#',
  },
  {
    name: 'Settings',
    icon: Settings,
    href: '#',
  },
  {
    name: 'Help & Support',
    icon: HelpCircle,
    href: '#',
  },
];

const quickActions = [
  {
    name: 'Start New Call',
    icon: Phone,
    action: () => console.log('Start new call'),
  },
  {
    name: 'View Reports',
    icon: BarChart3,
    action: () => console.log('View reports'),
  },
  {
    name: 'Team Performance',
    icon: Star,
    action: () => console.log('Team performance'),
  },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <action.icon className="w-4 h-4" />
              <span>{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  item.active
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.count && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">API Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-success-600">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">WebSocket</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-success-600">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">AI Services</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-success-600">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 