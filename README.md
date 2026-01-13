# AI Agent Automation Platform

A production-grade, web-based AI Agent Automation Platform with natural language command processing, email automation, calendar management, and an AI-powered interview simulator.

## 🚀 Features

### Core Automation
- **Natural Language Processing**: Control your workflow using text or voice commands
- **Email Automation**: AI-powered email drafting, sending, and summarization
- **Calendar Management**: Smart scheduling with conflict detection
- **Proactive AI**: Intelligent recommendations based on your patterns
- **Explainable AI**: Understand why the AI makes each decision

### Interview Simulator
- **Resume-Based Questions**: AI generates questions tailored to your resume
- **Adaptive Difficulty**: Questions adjust based on your responses
- **Real-Time Evaluation**: Instant feedback on your answers
- **Comprehensive Analytics**: Detailed performance breakdown with skill analysis
- **Personalized Recommendations**: Targeted resources for improvement

### Enterprise Features
- **Audit Logging**: Complete activity trail for all AI actions
- **Safety Guardrails**: Confirmation required for high-risk operations
- **Memory System**: Context-aware conversations with short and long-term memory
- **Retry Logic**: Automatic recovery from failures

## 🏗️ Architecture

```
ai-agent-automation/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API integration
│   │   └── hooks/         # Custom React hooks
│
├── server/                # Node.js + Express Backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, upload, error handling
│   └── services/          # Business logic
│
└── ai-agent/              # Python AI Service
    ├── agents/            # Planner, Executor, Interview agents
    ├── tools/             # Email, Calendar, Interview tools
    ├── memory/            # Conversation memory management
    └── schemas/           # Pydantic models
```

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Clerk SDK** for auth verification
- **Winston** for logging
- **Multer** for file uploads

### AI Service
- **FastAPI** for high-performance API
- **LangChain** for agent orchestration
- **Groq** (Llama 3 70B) for LLM
- **PyPDF2** for resume parsing
- **ChromaDB** for vector storage (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB Atlas account
- Clerk account
- Groq API key

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai-agent-automation
```

### 2. Setup Backend Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
AI_SERVICE_URL=http://localhost:8000
```

### 3. Setup AI Service
```bash
cd ../ai-agent
python -m venv venv
# Windows
venv\\Scripts\\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Groq API key
```

Required environment variables:
```env
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=llama3-70b-8192
```

### 4. Setup Frontend
```bash
cd ../client
npm install
cp .env.example .env
# Edit .env with your Clerk publishable key
```

Required environment variables:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 🚀 Running the Application

You need to run all three services:

### Terminal 1: Backend Server
```bash
cd server
npm start
```
Server runs on http://localhost:5000

### Terminal 2: AI Service
```bash
cd ai-agent
# Activate venv first
python main.py
```
AI service runs on http://localhost:8000

### Terminal 3: Frontend
```bash
cd client
npm run dev
```
Frontend runs on http://localhost:5173

## 📖 Usage Guide

### Dashboard
1. Sign up/Login using Clerk authentication
2. Navigate to the Dashboard
3. Use the chat interface to give commands:
   - "Draft an email to john@example.com about the project update"
   - "Schedule a meeting with Sarah tomorrow at 2pm"
   - "Summarize my recent emails"

### Interview Simulator
1. Navigate to `/interview`
2. Upload your resume (PDF)
3. Select job role and difficulty
4. Click "Start Interview"
5. Answer questions via text or voice
6. Receive comprehensive analytics at the end

### Activity Logs
- View all AI actions in the activity panel
- See execution time, confidence scores, and reasoning
- Filter by action type or status

## 🔐 Security

- **Clerk Authentication**: Secure user authentication with OAuth support
- **JWT Verification**: All API requests verified with Clerk SDK
- **Risk Assessment**: AI evaluates risk level of each action
- **User Confirmation**: High-risk actions require explicit approval
- **Audit Trail**: Complete logging of all AI decisions

## 🧪 API Endpoints

### Agent Commands
- `POST /api/agents/command` - Process natural language command
- `GET /api/activity` - Get activity logs
- `GET /api/recommendations` - Get proactive suggestions

### Email
- `POST /api/emails/draft` - Draft email with AI
- `POST /api/emails/:id/send` - Send drafted email
- `GET /api/emails` - List all emails

### Calendar
- `POST /api/calendar/schedule` - Schedule meeting
- `POST /api/calendar/:id/cancel` - Cancel meeting
- `GET /api/calendar` - List events

### Interviews
- `POST /api/interviews/start` - Start interview session
- `POST /api/interviews/:id/respond` - Submit answer
- `POST /api/interviews/:id/end` - Complete and get analytics
- `GET /api/interviews` - List past interviews

## 🎯 Key Features Explained

### Explainable AI
Every AI decision includes:
- **Reasoning**: Why this action was chosen
- **Confidence Score**: How certain the AI is (0.0-1.0)
- **Risk Level**: Low, medium, or high
- **Execution Plan**: Step-by-step breakdown

### Memory System
- **Short-term**: Recent conversation context
- **Long-term**: Summarized history
- **User Context**: Learned preferences and patterns

### Interview Analytics
- Overall score (0-100)
- Skill breakdown (technical, communication, problem-solving)
- Areas for improvement
- Recommended resources
- Resume alignment analysis
- Readiness score for target role

## 🤝 Contributing

This is an academic project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 👥 Authors

- **Paramveer** - Major Project 2025-2026

## 🙏 Acknowledgments

- LangChain for agent framework
- Groq for fast LLM inference
- Clerk for authentication
- MongoDB Atlas for database hosting

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: [your-email]

---

**Built with ❤️ for the future of AI automation**
