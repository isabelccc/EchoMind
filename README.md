# EchoMind - AI-Driven Live Call Insights

Real-time conversion of live customer speech into actionable insights using LLMs and voice technology.

## 🎯 Project Overview

EchoMind transforms live customer conversations into real-time actionable insights, helping agents provide better service through AI-powered assistance.

## 🏗️ Architecture

### Core Components
- **Live Audio Capture**: WebRTC-based real-time audio streaming
- **ASR Pipeline**: Whisper API integration for speech-to-text
- **LLM Processing**: Multi-agent system for insight generation
- **Real-time UI**: React-based agent overlay with live insights
- **Analytics**: Call outcome tracking and performance metrics

### Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Real-time**: WebSockets + Redis
- **ASR**: OpenAI Whisper API
- **LLM**: OpenAI GPT-4 + Claude
- **Voice**: WebRTC + Twilio (optional)
- **Database**: PostgreSQL + Redis
- **Monitoring**: Prometheus + Grafana

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Redis
- PostgreSQL

### Installation

1. **Clone and setup backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Setup frontend:**
```bash
cd frontend
npm install
```

3. **Environment Configuration:**
```bash
cp .env.example .env
# Add your API keys and configuration
```

4. **Start services:**
```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```

## 📁 Project Structure

```
echomind/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Frontend utilities
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
├── docs/                   # Documentation
└── docker/                 # Docker configuration
```

## 🔧 Development

### Backend Development
- FastAPI with automatic API documentation
- WebSocket support for real-time communication
- Redis for caching and session management
- PostgreSQL for persistent data storage

### Frontend Development
- React 18 with TypeScript
- Tailwind CSS for styling
- WebRTC for audio capture
- Real-time updates via WebSocket

## 📊 Features

### Phase 1: Core Infrastructure ✅
- [x] Project structure setup
- [x] Basic API framework
- [x] WebSocket real-time communication
- [x] Audio capture foundation

### Phase 2: AI Pipeline 🚧
- [ ] Whisper API integration
- [ ] LLM processing pipeline
- [ ] Multi-agent system
- [ ] Context management

### Phase 3: User Interface 🚧
- [ ] Agent overlay UI
- [ ] Real-time insights display
- [ ] Call management interface
- [ ] Analytics dashboard

### Phase 4: Advanced Features 📋
- [ ] Voice feedback (TTS)
- [ ] Custom training data
- [ ] Performance optimization
- [ ] Compliance features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions and support, please open an issue in the repository. 