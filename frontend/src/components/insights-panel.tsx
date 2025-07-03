'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  User,
  Zap,
  Sparkles,
  Activity,
  Shield,
  Target,
  BarChart3,
  Eye,
  Heart,
  Star
} from 'lucide-react';

interface InsightsPanelProps {
  lastMessage: string | null;
  sessionId: string | null;
}

interface Insight {
  type: string;
  data: any;
  timestamp: number;
}

export function InsightsPanel({ lastMessage, sessionId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.type === 'insights' && data.insights) {
          const newInsight: Insight = {
            type: 'comprehensive',
            data: data.insights,
            timestamp: Date.now(),
          };
          setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error('Failed to parse insights message:', error);
      }
    }
  }, [lastMessage]);

  const tabs = [
    { id: 'all', label: 'All Insights', icon: Brain },
    { id: 'sentiment', label: 'Sentiment', icon: Heart },
    { id: 'intent', label: 'Intent', icon: Target },
    { id: 'pii', label: 'PII', icon: Shield },
    { id: 'topics', label: 'Topics', icon: BarChart3 },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent?.toLowerCase()) {
      case 'question':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'complaint':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'request':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'feedback':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderSentimentInsight = (data: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-gray-900">Sentiment Analysis</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(data.sentiment)}`}>
          {data.sentiment || 'Unknown'}
        </span>
      </div>
      
      {data.confidence && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Confidence</span>
            <span className="text-lg font-bold text-blue-600">
              {Math.round(data.confidence * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(data.confidence * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {data.emotions && data.emotions.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-700">Detected Emotions</span>
          <div className="flex flex-wrap gap-2">
            {data.emotions.map((emotion: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full border border-purple-200">
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderIntentInsight = (data: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-900">Customer Intent</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntentColor(data.primary_intent)}`}>
          {data.primary_intent || 'Unknown'}
        </span>
      </div>
      
      {data.urgency && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Urgency Level</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              data.urgency === 'high' ? 'text-red-600 bg-red-100' :
              data.urgency === 'medium' ? 'text-orange-600 bg-orange-100' :
              'text-green-600 bg-green-100'
            }`}>
              {data.urgency}
            </span>
          </div>
        </div>
      )}
      
      {data.requires_action && (
        <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-700">Immediate Action Required</span>
        </div>
      )}
    </div>
  );

  const renderPIIInsight = (data: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="font-semibold text-gray-900">PII Detection</span>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          {data.pii_count || 0} Found
        </span>
      </div>
      
      {data.pii_types && data.pii_types.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-700">Detected PII Types</span>
          <div className="grid grid-cols-2 gap-2">
            {data.pii_types.map((type: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTopicInsight = (data: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-gray-900">Conversation Topics</span>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
          {data.topics?.length || 0} Topics
        </span>
      </div>
      
      {data.topics && data.topics.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-700">Key Topics</span>
          <div className="space-y-2">
            {data.topics.map((topic: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-900">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInsight = (insight: Insight) => {
    const { data } = insight;
    
    return (
      <div className="card shadow-soft animate-fade-in">
        <div className="card-content space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">AI Insights</span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(insight.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {data.sentiment && renderSentimentInsight(data)}
          {data.primary_intent && renderIntentInsight(data)}
          {data.pii_types && renderPIIInsight(data)}
          {data.topics && renderTopicInsight(data)}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Live Analysis</span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start a call to see real-time AI analysis and insights
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>AI is ready to analyze</span>
            </div>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div key={index} className="animate-slide-up">
              {renderInsight(insight)}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 