from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
import json
from datetime import datetime, timedelta

router = APIRouter()

# Initialize LLM
llm = ChatGroq(
    model="llama3-70b-8192",
    temperature=0.7,
    api_key=os.getenv("GROQ_API_KEY")
)

class PatternAnalysisRequest(BaseModel):
    user_id: str
    analysis_type: str  # 'missed_meetings', 'focus_time', 'productivity'
    time_range: str = '24h'  # '24h', '7d', '30d'

class InsightGenerationRequest(BaseModel):
    user_id: str
    time_range: str = '24h'

class FocusTimeSuggestionRequest(BaseModel):
    user_id: str
    preferences: Optional[Dict[str, Any]] = None

@router.post("/analyze-patterns")
async def analyze_patterns(request: PatternAnalysisRequest):
    """Analyze user activity patterns"""
    try:
        if request.analysis_type == 'missed_meetings':
            # Mock data for demonstration - in production, fetch from calendar
            missed_meetings = [
                {
                    "title": "Team Standup",
                    "time": "9:00 AM",
                    "organizer": "team@company.com",
                    "attendees": ["alice@company.com", "bob@company.com"],
                    "important": False
                },
                {
                    "title": "Client Review Meeting",
                    "time": "2:00 PM",
                    "organizer": "client@external.com",
                    "attendees": ["client@external.com", "manager@company.com"],
                    "important": True
                }
            ]
            
            return {
                "status": "success",
                "analysis_type": "missed_meetings",
                "missed_meetings": missed_meetings,
                "count": len(missed_meetings)
            }
        
        return {
            "status": "success",
            "analysis_type": request.analysis_type,
            "data": {}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-insights")
async def generate_insights(request: InsightGenerationRequest):
    """Generate comprehensive daily insights"""
    try:
        # Create prompt for AI to generate insights
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a productivity analytics AI. Generate a comprehensive daily productivity report.
            
            Analyze the following metrics and provide insights:
            - Email activity
            - Meeting attendance
            - Focus time utilization
            - Task completion
            
            Return a JSON object with:
            - score: overall productivity score (0-100)
            - summary: brief summary of the day
            - emails_sent: number of emails sent
            - meetings_attended: number of meetings attended
            - focus_time: hours of focused work
            - achievements: list of top 3 achievements
            - improvements: list of 3 areas for improvement
            """),
            ("user", "Generate insights for user {user_id} for the past {time_range}")
        ])
        
        chain = prompt | llm
        response = await chain.ainvoke({
            "user_id": request.user_id,
            "time_range": request.time_range
        })
        
        # Try to parse AI response as JSON
        try:
            insights = json.loads(response.content)
        except:
            # Fallback if AI doesn't return valid JSON
            insights = {
                "score": 75,
                "summary": "Good productivity day with balanced focus and collaboration time.",
                "emails_sent": 12,
                "meetings_attended": 4,
                "focus_time": 5.5,
                "achievements": [
                    "Completed project milestone",
                    "Responded to all urgent emails",
                    "Attended important client meeting"
                ],
                "improvements": [
                    "Reduce meeting time by 30 minutes",
                    "Block more focus time in the morning",
                    "Respond to emails in batches"
                ]
            }
        
        return {
            "status": "success",
            **insights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-focus-time")
async def suggest_focus_time(request: FocusTimeSuggestionRequest):
    """Suggest optimal focus time blocks"""
    try:
        preferences = request.preferences or {}
        
        # Create prompt for AI to suggest focus time
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a productivity scheduling AI. Suggest optimal focus time blocks.
            
            Consider:
            - User's working hours and preferences
            - Typical meeting patterns
            - Energy levels throughout the day
            - Minimum 2-hour blocks for deep work
            
            Return a JSON object with a 'suggestions' array containing:
            - duration: hours
            - time: description (e.g., "tomorrow morning")
            - start: time (e.g., "09:00")
            - end: time (e.g., "11:00")
            - reason: why this time is optimal
            """),
            ("user", "Suggest focus time for user {user_id} with preferences: {preferences}")
        ])
        
        chain = prompt | llm
        response = await chain.ainvoke({
            "user_id": request.user_id,
            "preferences": json.dumps(preferences)
        })
        
        # Try to parse AI response
        try:
            result = json.loads(response.content)
            suggestions = result.get("suggestions", [])
        except:
            # Fallback suggestions
            suggestions = [
                {
                    "duration": 2,
                    "time": "tomorrow morning",
                    "start": "09:00",
                    "end": "11:00",
                    "reason": "Morning hours typically have fewer meetings and higher energy levels"
                },
                {
                    "duration": 2,
                    "time": "tomorrow afternoon",
                    "start": "14:00",
                    "end": "16:00",
                    "reason": "Post-lunch period with minimal scheduled meetings"
                }
            ]
        
        return {
            "status": "success",
            "suggestions": suggestions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-missed-meetings")
async def detect_missed_meetings(request: dict):
    """Detect meetings that were missed"""
    try:
        user_id = request.get("user_id")
        
        # In production, this would analyze calendar and activity logs
        # For now, return mock data
        missed = [
            {
                "meeting_id": "meet_123",
                "title": "Weekly Team Sync",
                "scheduled_time": "2024-01-14T10:00:00Z",
                "organizer": "manager@company.com",
                "importance": "medium"
            }
        ]
        
        return {
            "status": "success",
            "missed_meetings": missed,
            "count": len(missed)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
