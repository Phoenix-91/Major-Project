from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import PyPDF2
import io

load_dotenv()

app = FastAPI(title="AI Agent Automation Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from agents.planner import PlannerAgent
from agents.executor import AgentSystem
from agents.interview_agent import get_interview_agent, clear_interview_session
from schemas.base import CommandRequest
from memory.conversation_memory import get_memory
from services.pattern_analyzer import router as pattern_router

# Initialize Agents
planner = PlannerAgent()
executor = AgentSystem()

# Include pattern analyzer routes
app.include_router(pattern_router, tags=["analytics"])

class CommandRequest(BaseModel):
    command: str
    user_id: str
    context: Optional[Dict[str, Any]] = None

class EmailDraftRequest(BaseModel):
    recipient: str
    subject: str
    context: str
    tone: str = "professional"
    user_id: str

class InterviewStartRequest(BaseModel):
    session_id: str
    resume_text: str
    job_role: str
    difficulty: str = "medium"
    interview_type: str = "general"  # hr, technical, behavioral, situational

class InterviewResponseRequest(BaseModel):
    session_id: str
    response: str
    resume_text: str = ""
    job_role: str = ""


@app.get("/")
def read_root():
    return {
        "status": "AI Interview Simulator Service Running",
        "version": "2.0.0",
        "features": [
            "Interview Simulation",
            "Resume Parsing",
            "Performance Analysis"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    try:
        return {
            "status": "healthy",
            "service": "AI Interview Simulator",
            "version": "2.0.0",
            "components": {
                "interview_agent": "operational",
                "resume_parser": "operational"
            },
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }

@app.post("/interview/start")
def start_interview(request: InterviewStartRequest):
    """Start a new interview session"""
    try:
        agent = get_interview_agent(request.session_id)
        first_question = agent.start_interview(
            request.resume_text,
            request.job_role,
            request.difficulty,
            request.interview_type
        )
        
        return {
            "status": "success",
            "session_id": request.session_id,
            **first_question
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/respond")
def respond_to_question(request: InterviewResponseRequest):
    """Submit response to interview question"""
    try:
        agent = get_interview_agent(request.session_id)
        result = agent.submit_response(
            request.response,
            request.resume_text,
            request.job_role
        )
        
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/complete")
def complete_interview(request: dict):
    """Complete interview and get analytics"""
    try:
        session_id = request.get("session_id")
        resume_text = request.get("resume_text", "")
        job_role = request.get("job_role", "")
        
        agent = get_interview_agent(session_id)
        analytics = agent.complete_interview(resume_text, job_role)
        
        # Clear session
        clear_interview_session(session_id)
        
        return {
            "status": "success",
            "analytics": analytics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interview/session/{session_id}")
def get_session_state(session_id: str):
    """Get current session state and metrics"""
    try:
        agent = get_interview_agent(session_id)
        state = agent.get_session_state()
        
        return {
            "status": "success",
            **state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """Parse PDF resume and extract text"""
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        return {
            "status": "success",
            "text": text,
            "pages": len(pdf_reader.pages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/{user_id}")
def get_user_memory(user_id: str):
    """Get user's conversation memory"""
    try:
        memory = get_memory(user_id)
        return {
            "recent_history": memory.get_recent_history(),
            "summary": memory.get_summary(),
            "context": memory.get_user_context()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
