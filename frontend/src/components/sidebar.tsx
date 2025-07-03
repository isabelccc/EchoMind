'use client';

import { useState } from 'react';
import { 
  Phone, 
  BarChart3, 
  Settings, 
  Users, 
  FileText, 
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Home,
  Activity,
  MessageSquare,
  Database
} from 'lucide-react';

export function Sidebar() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Analytics'
    },
    {
      id: 'calls',
      label: 'Call Sessions',
      icon: Phone,
      description: 'Active & History',
      badge: '3 Active'
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Zap,
      description: 'Real-time Analysis',
      badge: 'Live'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Reports & Metrics'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Customer Database'
    },
    {
      id: 'transcripts',
      label: 'Transcripts',
      icon: FileText,
      description: 'Call Recordings'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'Call Planning'
    }
  ];

  const quickStats = [
    {
      label: 'Today\'s Calls',
      value: '12',
      change: '+15%',
      icon: Phone,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Avg. Duration',
      value: '8m 32s',
      change: '+2%',
      icon: Clock,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Satisfaction',
      value: '4.8',
      change: '+0.3',
      icon: Star,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];

  const recentActivity = [
    {
      type: 'call',
      title: 'Call with Customer #12345',
      time: '2 minutes ago',
      status: 'active'
    },
    {
      type: 'insight',
      title: 'New sentiment analysis',
      time: '5 minutes ago',
      status: 'completed'
    },
    {
      type: 'alert',
      title: 'PII detected in call',
      time: '8 minutes ago',
      status: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'insight': return Zap;
      case 'alert': return Shield;
      default: return Activity;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">EchoMind</h2>
            <p className="text-xs text-gray-500">Call Analytics</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.badge === 'Live' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-blue-600 rotate-90' : 'text-gray-400'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700">View All</button>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getStatusColor(activity.status)}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">System Online</span>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 