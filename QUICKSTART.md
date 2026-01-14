# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] MongoDB Atlas account created
- [ ] Clerk account created
- [ ] Groq API key obtained

## Step 1: Environment Setup

### Server (.env)
```env
PORT=5000
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AI_SERVICE_URL=http://localhost:8000
```

### AI Agent (.env)
```env
GROQ_API_KEY=gsk_...
LLM_MODEL=llama3-70b-8192
LLM_TEMPERATURE=0
```

### Client (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Step 2: Install Dependencies

### Terminal 1: Server
```bash
cd server
npm install
```

### Terminal 2: AI Service
```bash
cd ai-agent
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Terminal 3: Client
```bash
cd client
npm install
```

## Step 3: Run the Application

### Start all three services in separate terminals:

**Terminal 1: Backend Server**
```bash
cd server
npm start
```
✅ Server running on http://localhost:5000

**Terminal 2: AI Service**
```bash
cd ai-agent
# Make sure venv is activated
python main.py
```
✅ AI service running on http://localhost:8000

**Terminal 3: Frontend**
```bash
cd client
npm run dev
```
✅ Frontend running on http://localhost:5173

## Step 4: Test the Application

1. **Open Browser**: Navigate to http://localhost:5173
2. **Sign Up**: Create account using Clerk
3. **Dashboard**: Try commands like:
   - "Draft an email to john@example.com about the project"
   - "Schedule a meeting tomorrow at 2pm"
4. **Interview**: Go to /interview and upload a resume

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Whitelist your IP address

### Clerk Authentication Error
- Verify Clerk keys match your application
- Check Clerk dashboard for application status

### AI Service Error
- Verify Groq API key is valid
- Check Python dependencies are installed
- Ensure port 8000 is not in use

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## Next Steps

- ✅ Explore dashboard features
- ✅ Try voice input (click microphone icon)
- ✅ Test interview simulator
- ✅ Check activity logs
- ✅ Review proactive suggestions

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.
