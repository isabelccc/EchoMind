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
  Zap
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
          setInsights(prev => [newInsight, ...prev.slice(0, 9)]); // Keep last 10 insights
        }
      } catch (error) {
        console.error('Failed to parse insights message:', error);
      }
    }
  }, [lastMessage]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-success-600 bg-success-50';
      case 'negative':
        return 'text-error-600 bg-error-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent?.toLowerCase()) {
      case 'question':
        return 'text-primary-600 bg-primary-50';
      case 'complaint':
        return 'text-error-600 bg-error-50';
      case 'request':
        return 'text-warning-600 bg-warning-50';
      case 'feedback':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderSentimentInsight = (data: any) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">Sentiment</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(data.sentiment)}`}>
          {data.sentiment || 'Unknown'}
        </span>
      </div>
      
      {data.confidence && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence</span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(data.confidence * 100)}%
          </span>
        </div>
      )}
      
      {data.emotions && data.emotions.length > 0 && (
        <div>
          <span className="text-sm text-gray-600">Emotions</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.emotions.map((emotion: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderIntentInsight = (data: any) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">Primary Intent</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(data.primary_intent)}`}>
          {data.primary_intent || 'Unknown'}
        </span>
      </div>
      
      {data.urgency && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Urgency</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            data.urgency === 'high' ? 'text-error-600 bg-error-50' :
            data.urgency === 'medium' ? 'text-warning-600 bg-warning-50' :
            'text-success-600 bg-success-50'
          }`}>
            {data.urgency}
          </span>
        </div>
      )}
      
      {data.requires_action && (
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-warning-500" />
          <span className="text-sm text-warning-600">Action Required</span>
        </div>
      )}
    </div>
  );

  const renderSuggestedResponse = (data: any) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-gray-900">Suggested Response</span>
      </div>
      
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
        <p className="text-sm text-gray-900">{data.suggested_response}</p>
      </div>
      
      {data.tone && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Recommended Tone</span>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
            {data.tone}
          </span>
        </div>
      )}
      
      {data.key_points && data.key_points.length > 0 && (
        <div>
          <span className="text-sm text-gray-600">Key Points</span>
          <ul className="mt-1 space-y-1">
            {data.key_points.map((point: string, index: number) => (
              <li key={index} className="text-sm text-gray-900 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderObjectionHandling = (data: any) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-warning-500" />
        <span className="text-sm font-medium text-gray-900">Objection Handling</span>
      </div>
      
      {data.objections_detected && data.objections_detected.length > 0 ? (
        <div className="space-y-3">
          {data.objections_detected.map((objection: string, index: number) => (
            <div key={index} className="bg-warning-50 border border-warning-200 rounded-lg p-3">
              <p className="text-sm font-medium text-warning-800 mb-2">{objection}</p>
              {data.handling_strategies && data.handling_strategies[index] && (
                <p className="text-sm text-warning-700">{data.handling_strategies[index]}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No objections detected</p>
      )}
    </div>
  );

  const renderFAQSuggestions = (data: any) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-gray-900">FAQ Suggestions</span>
      </div>
      
      {data.relevant_topics && data.relevant_topics.length > 0 ? (
        <div className="space-y-2">
          {data.relevant_topics.map((topic: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-900">{topic}</span>
              {data.confidence_scores && (
                <span className="text-xs text-gray-500">
                  {Math.round(data.confidence_scores[index] * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No FAQ suggestions available</p>
      )}
    </div>
  );

  const renderEmotionCalibration = (data: any) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-gray-900">Emotion Calibration</span>
      </div>
      
      <div className="space-y-2">
        {data.customer_emotion && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Customer Emotion</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {data.customer_emotion}
            </span>
          </div>
        )}
        
        {data.agent_tone_adjustment && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tone Adjustment</span>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
              {data.agent_tone_adjustment}
            </span>
          </div>
        )}
        
        {data.energy_level && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Energy Level</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              data.energy_level === 'high' ? 'bg-success-100 text-success-700' :
              data.energy_level === 'medium' ? 'bg-warning-100 text-warning-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {data.energy_level}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderInsight = (insight: Insight) => {
    const { data } = insight;
    
    return (
      <div key={insight.timestamp} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-900">AI Insights</span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(insight.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="space-y-4">
          {data.sentiment && renderSentimentInsight(data.sentiment)}
          {data.intent && renderIntentInsight(data.intent)}
          {data.suggested_response && renderSuggestedResponse(data.suggested_response)}
          {data.objection_handling && renderObjectionHandling(data.objection_handling)}
          {data.faq_suggestion && renderFAQSuggestions(data.faq_suggestion)}
          {data.emotion_calibration && renderEmotionCalibration(data.emotion_calibration)}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-gray-600">Real-time</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Insights
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'sentiment'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sentiment
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'actions'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Actions
        </button>
      </div>

      {/* Insights Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {insights.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No insights available yet</p>
            <p className="text-sm">Start a call to see AI-generated insights</p>
          </div>
        ) : (
          insights.map(renderInsight)
        )}
      </div>
    </div>
  );
} 