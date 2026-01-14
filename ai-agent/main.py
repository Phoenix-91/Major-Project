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

class InterviewResponseRequest(BaseModel):
    session_id: str
    response: str
    resume_text: str = ""
    job_role: str = ""


@app.get("/")
def read_root():
    return {
        "status": "AI Agent Service Running",
        "version": "2.0.0",
        "features": [
            "Command Processing",
            "Email Automation",
            "Calendar Management",
            "Interview Simulation",
            "Proactive Recommendations"
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test planner
        test_plan = planner.create_plan("test", {})
        
        return {
            "status": "healthy",
            "service": "AI Agent",
            "version": "2.0.0",
            "components": {
                "planner": "operational",
                "executor": "operational",
                "memory": "operational"
            },
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }


@app.post("/templates/create")
def create_template(request: dict):
    """Create a new email template"""
    # This would typically save to DB via Node service, 
    # but for AI agent we might want to generate a template logic
    pass

@app.post("/proactive/recommendations")
def get_proactive_recommendations(request: dict):
    """Generate proactive recommendations based on user patterns"""
    try:
        user_id = request.get("user_id")
        context = request.get("context", {})
        
        memory = get_memory(user_id)
        user_context = memory.get_user_context()
        
        # Analyze patterns and generate recommendations
        recommendations = []
        
        # 1. Email Follow-up Logic
        # logic: if context has 'sent_emails' check for no-reply > 3 days
        sent_emails = context.get('sent_emails', [])
        for email in sent_emails:
            if email.get('status') == 'sent' and email.get('days_since') > 3:
                recommendations.append({
                    "type": "follow_up",
                    "priority": "high",
                    "title": f"Follow up: {email.get('subject')}",
                    "description": f"No reply received for 3 days on '{email.get('subject')}'",
                    "command": f"Draft follow-up email to {email.get('recipient')} regarding {email.get('subject')}",
                    "reasoning": "Standard follow-up protocol (3+ days no reply)"
                })

        # 2. Check for unanswered emails
        if context.get("pending_emails", 0) > 5:
            recommendations.append({
                "type": "catch_up",
                "priority": "high",
                "title": "Multiple pending emails",
                "description": f"You have {context.get('pending_emails')} emails waiting for response",
                "command": "Draft responses to pending emails",
                "reasoning": "High email backlog detected"
            })
        
        # 3. Suggest focus time
        if context.get("meetings_today", 0) > 3:
            recommendations.append({
                "type": "focus_time",
                "priority": "medium",
                "title": "Schedule focus time",
                "description": "You have many meetings today. Consider blocking focus time.",
                "command": "Block 2 hours for focused work tomorrow",
                "reasoning": "Heavy meeting schedule detected"
            })
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "user_context": user_context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-command")
def process_command(request: CommandRequest):
    """Main endpoint for processing natural language commands"""
    try:
        print(f"📝 Processing command: {request.command}")
        print(f"👤 User ID: {request.user_id}")
        
        # Get user memory for context
        memory = get_memory(request.user_id)
        
        # Add context from memory
        enhanced_context = request.context or {}
        enhanced_context['conversation_history'] = memory.get_recent_messages(limit=5)
        enhanced_context['user_preferences'] = memory.get_user_context()
        
        # 1. Create Plan
        plan = planner.create_plan(request.command, enhanced_context)
        print(f"📋 Plan created with {len(plan.steps)} steps")
        
        # 2. Check if confirmation needed
        requires_confirmation = planner.requires_confirmation(plan)
        overall_risk = planner.assess_overall_risk(plan)
        
        print(f"⚠️  Risk Level: {overall_risk}, Requires Confirmation: {requires_confirmation}")
        
        if requires_confirmation:
            # Save to memory that we're awaiting confirmation
            memory.add_message("user", request.command)
            memory.add_message("assistant", "Awaiting confirmation for high-risk action")
            
            # Return plan for user confirmation
            return {
                "status": "awaiting_confirmation",
                "plan": plan.dict(),
                "requires_confirmation": True,
                "risk_level": overall_risk,
                "message": "This action requires your confirmation before proceeding."
            }
        
        # 3. Execute
        print(f"⚡ Executing command...")
        execution_result = executor.execute(request.command, request.user_id)
        
        # Save to memory
        memory.add_message("user", request.command)
        memory.add_message("assistant", execution_result.get("output", ""))
        
        print(f"✅ Execution complete: {execution_result.get('success', False)}")
        
        return {
            "status": "success",
            "plan": plan.dict(),
            "result": {
                "message": execution_result.get("output", ""),
                "data": execution_result.get("data", {})
            },
            "execution_time": execution_result.get("execution_time", 0),
            "success": execution_result.get("success", True)
        }
    except Exception as e:
        print(f"❌ Error processing command: {e}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Command processing failed",
                "message": str(e),
                "type": type(e).__name__
            }
        )

@app.post("/draft-email")
def draft_email(request: EmailDraftRequest):
    """Draft an email using AI"""
    try:
        from tools.email_tool import draft_email as draft_email_tool
        
        result = draft_email_tool.invoke({
            "recipient": request.recipient,
            "subject": request.subject,
            "context": request.context,
            "tone": request.tone
        })
        
        import json
        email_data = json.loads(result)
        
        return {
            "status": "success",
            **email_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-email")
def send_email_endpoint(request: dict):
    """Send an email"""
    try:
        from tools.email_tool import send_email as send_email_tool
        
        result = send_email_tool.invoke({
            "recipient": request.get("recipient"),
            "subject": request.get("subject"),
            "body": request.get("body")
        })
        
        import json
        return json.loads(result)
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/interview/start")
def start_interview(request: InterviewStartRequest):
    """Start a new interview session"""
    try:
        agent = get_interview_agent(request.session_id)
        first_question = agent.start_interview(
            request.resume_text,
            request.job_role,
            request.difficulty
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
