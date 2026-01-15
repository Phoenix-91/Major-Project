# NEXUS.AI - AI Agent Automation Platform

<div align="center">

![NEXUS.AI](https://img.shields.io/badge/NEXUS.AI-v2.0-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A production-grade, web-based AI Agent Automation Platform with advanced interview simulation, multi-LLM support, and premium glassmorphism UI**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, premium dark theme with glassmorphic elements
- **Animated Background**: Dynamic particle network and gradient animations
- **Smooth Transitions**: Framer Motion animations throughout
- **Responsive Layout**: Optimized for all screen sizes
- **Theme Support**: Dark mode with light mode fallback

### 🤖 Core AI Automation
- **Natural Language Processing**: Control your workflow using text or voice commands
- **Email Automation**: AI-powered email drafting, sending, and summarization
- **Calendar Management**: Smart scheduling with conflict detection
- **Proactive AI**: Intelligent recommendations based on your patterns
- **Explainable AI**: Understand why the AI makes each decision

### 🎤 Advanced Interview Simulator
- **3-Phase Interview Flow**:
  - **Setup Phase**: Resume upload (PDF), job role selection, experience level, job description
  - **Main Interview**: Dual camera view (AI + User), 10-minute timer, real-time chat
  - **AI Analysis**: Comprehensive performance breakdown with scores and graphs

- **Dynamic AI Analysis**:
  - Overall performance score (0-100%)
  - 5 detailed metrics with circular progress charts:
    - Communication Skills
    - Technical Knowledge
    - Confidence Level
    - Problem Solving
    - Clarity of Expression
  - Strengths & weaknesses based on actual performance
  - Question-by-question feedback
  - Personalized improvement recommendations

- **Real-Time Features**:
  - Live webcam integration
  - AI avatar with animated gradient
  - 10-minute countdown timer
  - Voice input support
  - Instant message responses

### 🧠 Multi-LLM Provider Support
- **Groq** (Primary): Fast, free, cloud-based LLM
- **Ollama** (Fallback): Local, private, free LLM
- **OpenAI** (Backup): Reliable, paid option
- **Automatic Fallback**: Seamlessly switches between providers on failure
- **No Delays**: Always uses fastest available provider

### 🔐 Enterprise Features
- **Clerk Authentication**: Secure OAuth-based authentication
- **Audit Logging**: Complete activity trail for all AI actions
- **Safety Guardrails**: Confirmation required for high-risk operations
- **Memory System**: Context-aware conversations with short and long-term memory
- **Retry Logic**: Automatic recovery from failures
- **Error Handling**: Graceful degradation and user-friendly error messages

---

## 🏗️ Architecture

```
ai-agent-automation/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AnimatedBackground.jsx
│   │   │   ├── GlassCard.jsx
│   │   │   ├── InterviewTimer.jsx
│   │   │   ├── DualCameraView.jsx
│   │   │   ├── ScoreChart.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ...
│   │   ├── pages/              # Main application pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── InterviewPage.jsx
│   │   ├── services/           # API integration
│   │   ├── hooks/              # Custom React hooks
│   │   └── layouts/            # Layout components
│
├── server/                      # Node.js + Express Backend
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Interview.js
│   │   ├── ActivityLog.js
│   │   └── Insight.js
│   ├── routes/                 # API endpoints
│   │   ├── users.js
│   │   ├── interviews.js
│   │   ├── activity.js
│   │   ├── insights.js
│   │   └── ...
│   ├── middleware/             # Auth, upload, error handling
│   └── services/               # Business logic
│
└── ai-agent/                    # Python AI Service
    ├── agents/                 # AI Agents
    │   ├── planner.py
    │   ├── executor.py
    │   └── interview_agent.py
    ├── tools/                  # Tool implementations
    │   ├── email_tool.py
    │   ├── calendar_tool.py
    │   └── interview_tool.py
    ├── services/               # Core services
    │   ├── llm_provider.py    # Multi-LLM support
    │   └── pattern_analyzer.py
    ├── memory/                 # Memory management
    └── schemas/                # Pydantic models
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite for blazing-fast development
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible component primitives
- **Clerk** for authentication
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons
- **React Router** for navigation

### Backend
- **Node.js 18+** with Express
- **MongoDB** with Mongoose ODM
- **Clerk SDK** for auth verification
- **Winston** for structured logging
- **Multer** for file uploads
- **Axios** for HTTP requests

### AI Service
- **FastAPI** for high-performance async API
- **LangChain** for agent orchestration
- **Groq** (Llama 3.3 70B) for primary LLM
- **Ollama** (Llama 3.2 3B) for local fallback
- **OpenAI** (GPT-3.5) for backup
- **PyPDF2** for resume parsing
- **Pydantic** for data validation

---

## 📦 Installation

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.9+** with pip
- **MongoDB Atlas** account (free tier works)
- **Clerk** account (free tier works)
- **Groq API** key (free at console.groq.com)
- **(Optional)** Ollama installed locally

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai-agent-automation
```

### 2. Setup Backend Server
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### 3. Setup AI Service
```bash
cd ../ai-agent
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
OPENAI_API_KEY=sk-placeholder-if-needed
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Setup Frontend
```bash
cd ../client
npm install
```

Create `.env` file:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

### 5. (Optional) Setup Ollama
For local LLM fallback:

```bash
# Download from https://ollama.ai
# Or install via package manager:
winget install Ollama.Ollama  # Windows
brew install ollama            # Mac

# Pull a model
ollama pull llama3.2:3b
```

---

## 🚀 Running the Application

You need to run **3 services** simultaneously:

### Terminal 1: Backend Server
```bash
cd server
npm start
```
✅ Server runs on **http://localhost:5000**

### Terminal 2: AI Service
```bash
cd ai-agent
# Activate venv first
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

python main.py
```
✅ AI service runs on **http://localhost:8000**

### Terminal 3: Frontend
```bash
cd client
npm run dev
```
✅ Frontend runs on **http://localhost:5173**

---

## 📖 Usage Guide

### 🏠 Landing Page
- Modern glassmorphic design
- Theme-aware animated background
- Feature showcase
- Call-to-action buttons

### 📊 Dashboard
1. **Sign up/Login** using Clerk authentication
2. View **AI Insights** panel with proactive suggestions
3. Access **Quick Actions**:
   - Start Interview
   - Draft Email
   - Schedule Meeting
   - View Analytics
4. Use **Command Input** for natural language commands:
   - "Draft an email to john@example.com about the project update"
   - "Schedule a meeting with Sarah tomorrow at 2pm"
   - "Summarize my recent emails"
5. View **Activity Log** for all AI actions

### 🎤 Interview Simulator

#### Phase 1: Setup
1. Navigate to **Interview Sim**
2. **Upload Resume** (PDF, drag & drop supported)
3. **Select Job Role** (or enter custom role)
4. **Choose Experience Level** (Entry/Mid/Senior)
5. **(Optional)** Add **Job Description**
6. Click **"Start Interview"**

#### Phase 2: Main Interview
- **Left Panel (60%)**:
  - AI Interviewer avatar (top)
  - Your live webcam (bottom)
  - Recording indicator
- **Right Panel (40%)**:
  - Real-time chat interface
  - AI questions appear automatically
  - Type or use voice input for responses
- **Top Bar**:
  - 10-minute countdown timer
  - End Interview button

#### Phase 3: AI Analysis
- **Overall Score**: Large gradient display
- **Detailed Metrics**: 5 circular progress charts
- **Strengths**: What you did well
- **Weaknesses**: Areas to improve
- **Question Analysis**: Score and feedback for each answer
- **Recommendations**: Personalized improvement tips
- **Actions**: Try Again or Download Report

---

## 🔌 API Documentation

### Base URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **AI Service**: http://localhost:8000

### Authentication
All API requests require Clerk authentication token in headers:
```javascript
Authorization: Bearer <clerk_session_token>
```

### Agent Commands
```http
POST /api/agents/command
Content-Type: application/json

{
  "command": "Draft an email to john@example.com",
  "user_id": "user_123",
  "context": {}
}
```

### Interview Endpoints

#### Start Interview
```http
POST /api/interviews/start
Content-Type: multipart/form-data

resume: <PDF file>
jobRole: "Software Engineer"
experienceLevel: "Mid-Level"
jobDescription: "..."
```

#### Submit Answer
```http
POST /api/interviews/:id/respond
Content-Type: application/json

{
  "answer": "I have 5 years of experience...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### End Interview & Get Analysis
```http
POST /api/interviews/:id/end
```

Response:
```json
{
  "overallScore": 85,
  "scores": {
    "communication": 90,
    "technical": 80,
    "confidence": 85,
    "problemSolving": 82,
    "clarity": 88
  },
  "strengths": [...],
  "weaknesses": [...],
  "questionAnalysis": [...],
  "recommendations": [...]
}
```

### Activity & Insights
```http
GET /api/activity              # Get activity logs
GET /api/insights              # Get AI insights
GET /api/insights/daily        # Get daily report
POST /api/insights/:id/feedback # Submit feedback
```

---

## 🎯 Key Features Explained

### 🧠 Multi-LLM Provider
The system automatically selects the best available LLM:

1. **Groq** (Primary): Fastest, free, cloud-based
2. **Ollama** (Fallback): Local, private, no API key needed
3. **OpenAI** (Backup): Most reliable, paid

If one fails, it automatically tries the next. No delays, no errors!

### 📊 Dynamic Interview Analysis
Unlike static mock data, the analysis is **calculated in real-time** based on:
- Number of questions answered
- Average response length
- Interview duration
- Engagement level
- Response quality

### 🎨 Glassmorphism UI
- Frosted glass effect with backdrop blur
- Semi-transparent backgrounds
- Subtle borders and shadows
- Gradient accents
- Smooth animations

### 🔐 Security Features
- **Clerk Authentication**: Industry-standard OAuth
- **JWT Verification**: All API requests verified
- **Risk Assessment**: AI evaluates each action
- **User Confirmation**: High-risk actions require approval
- **Audit Trail**: Complete logging

---

## 🧪 Development

### Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Route pages
├── services/       # API clients
├── hooks/          # Custom React hooks
├── layouts/        # Layout wrappers
└── lib/            # Utilities
```

### Adding a New Feature
1. Create component in `components/`
2. Add route in `App.jsx`
3. Create API endpoint in `server/routes/`
4. Add AI logic in `ai-agent/agents/`
5. Update README

### Code Style
- **Frontend**: ESLint + Prettier
- **Backend**: ESLint
- **AI Service**: Black + isort

---

## 🤝 Contributing

This is an academic project. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 👥 Authors

- **Paramveer** - *Major Project 2025-2026*
- Computer Science & Engineering

---

## 🙏 Acknowledgments

- **LangChain** for agent framework
- **Groq** for fast LLM inference
- **Ollama** for local LLM support
- **Clerk** for authentication
- **MongoDB Atlas** for database hosting
- **shadcn/ui** for component primitives
- **Tailwind CSS** for styling system

---

## 📞 Support

For issues or questions:
- 📧 Email: [your-email]
- 🐛 Issues: [GitHub Issues](repository-url/issues)
- 📖 Docs: [Wiki](repository-url/wiki)

---

## 🗺️ Roadmap

- [ ] Speech-to-text for voice responses
- [ ] Text-to-speech for AI questions
- [ ] PDF report generation
- [ ] Interview recording playback
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

---

<div align="center">

**Built with ❤️ for the future of AI automation**

⭐ Star this repo if you find it helpful!

</div>
