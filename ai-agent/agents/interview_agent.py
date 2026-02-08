from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from tools.interview_tool import generate_interview_questions, evaluate_interview_response, generate_interview_analytics
from tools.conversational_interview_tool import (
    generate_followup_question, 
    evaluate_response_realtime,
    adjust_difficulty,
    generate_conversation_summary
)
from services.resume_parser import parse_resume_structure, format_resume_context
import os
import json
from datetime import datetime

class InterviewAgent:
    """Specialized agent for conducting conversational AI interviews"""
    
    def __init__(self):
        self.llm = ChatGroq(
            model="llama3-70b-8192",
            temperature=0.7,
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.current_question_index = 0
        self.questions = []
        self.responses = []
        
        # Resume data
        self.resume_text = ""
        self.parsed_resume = {}  # Structured resume data
        self.resume_context = ""  # Formatted context string
        
        # Conversational state
        self.conversation_history = []
        self.interview_type = "general"  # hr, technical, behavioral, situational
        self.current_difficulty = "medium"
        self.evaluation_metrics = {
            "confidence": [],
            "clarity": [],
            "relevance": []
        }
        self.session_state = "active"  # active, paused, completed
    
    def start_interview(
        self, 
        resume_text: str, 
        job_role: str, 
        difficulty: str = "medium",
        interview_type: str = "general"
    ):
        """Initialize conversational interview with resume-based questions"""
        self.interview_type = interview_type
        self.current_difficulty = difficulty
        self.resume_text = resume_text
        
        # Parse resume into structured data
        print("Parsing resume...")
        self.parsed_resume = parse_resume_structure(resume_text)
        self.resume_context = format_resume_context(self.parsed_resume)
        print(f"Resume parsed. Found {len(self.parsed_resume.get('skills', []))} skills, {len(self.parsed_resume.get('projects', []))} projects")
        
        # Generate initial questions based on resume content
        questions_json = generate_interview_questions.invoke({
            "resume_text": resume_text,
            "job_role": job_role,
            "difficulty": difficulty,
            "num_questions": 5,
            "resume_context": self.resume_context
        })
        
        try:
            self.questions = json.loads(questions_json)
        except:
            # Fallback questions based on interview type
            self.questions = self._get_fallback_questions(interview_type, job_role, difficulty)
        
        self.current_question_index = 0
        self.responses = []
        self.conversation_history = []
        self.evaluation_metrics = {"confidence": [], "clarity": [], "relevance": []}
        
        return self.get_next_question()
    
    def _get_fallback_questions(self, interview_type: str, job_role: str, difficulty: str):
        """Generate fallback questions based on interview type"""
        fallback_map = {
            "hr": [
                {"question": "Tell me about yourself and what motivates you.", "category": "hr", "difficulty": difficulty},
                {"question": f"Why are you interested in the {job_role} role?", "category": "hr", "difficulty": difficulty},
                {"question": "How do you handle conflicts in a team?", "category": "hr", "difficulty": difficulty},
                {"question": "What are your career goals for the next 5 years?", "category": "hr", "difficulty": difficulty},
                {"question": "Describe your ideal work environment.", "category": "hr", "difficulty": difficulty}
            ],
            "technical": [
                {"question": "Explain your approach to solving complex technical problems.", "category": "technical", "difficulty": difficulty},
                {"question": f"What technical skills make you a good fit for {job_role}?", "category": "technical", "difficulty": difficulty},
                {"question": "Describe a challenging technical project you've worked on.", "category": "technical", "difficulty": difficulty},
                {"question": "How do you stay updated with new technologies?", "category": "technical", "difficulty": difficulty},
                {"question": "Walk me through your debugging process.", "category": "technical", "difficulty": difficulty}
            ],
            "behavioral": [
                {"question": "Tell me about a time you faced a difficult challenge at work.", "category": "behavioral", "difficulty": difficulty},
                {"question": "Describe a situation where you had to work under pressure.", "category": "behavioral", "difficulty": difficulty},
                {"question": "Give an example of when you showed leadership.", "category": "behavioral", "difficulty": difficulty},
                {"question": "Tell me about a time you failed and what you learned.", "category": "behavioral", "difficulty": difficulty},
                {"question": "Describe how you handle constructive criticism.", "category": "behavioral", "difficulty": difficulty}
            ],
            "situational": [
                {"question": "How would you handle a disagreement with your manager?", "category": "situational", "difficulty": difficulty},
                {"question": "What would you do if you missed an important deadline?", "category": "situational", "difficulty": difficulty},
                {"question": "How would you prioritize multiple urgent tasks?", "category": "situational", "difficulty": difficulty},
                {"question": "What would you do if you discovered a critical bug in production?", "category": "situational", "difficulty": difficulty},
                {"question": "How would you handle a difficult team member?", "category": "situational", "difficulty": difficulty}
            ]
        }
        
        return fallback_map.get(interview_type, fallback_map["hr"])
    
    def get_next_question(self):
        """Get the next interview question"""
        if self.current_question_index >= len(self.questions):
            return None
        
        question = self.questions[self.current_question_index]
        question_text = question.get("question", question) if isinstance(question, dict) else question
        
        return {
            "question": question_text,
            "index": self.current_question_index + 1,
            "total": len(self.questions),
            "category": question.get("category", self.interview_type) if isinstance(question, dict) else self.interview_type,
            "difficulty": self.current_difficulty,
            "interview_type": self.interview_type
        }
    
    def submit_response(self, response: str, resume_text: str = "", job_role: str = ""):
        """Submit response with real-time evaluation and conversational follow-up"""
        if self.current_question_index >= len(self.questions):
            return {"error": "No active question"}
        
        current_q = self.questions[self.current_question_index]
        question_text = current_q.get("question", current_q) if isinstance(current_q, dict) else current_q
        
        # Evaluate the response with resume context
        evaluation_json = evaluate_response_realtime.invoke({
            "question": question_text,
            "response": response,
            "interview_type": self.interview_type,
            "job_role": job_role,
            "resume_context": self.resume_context
        })
        
        try:
            evaluation = json.loads(evaluation_json)
            
            # Store metrics
            self.evaluation_metrics["confidence"].append(evaluation.get("confidence", 70))
            self.evaluation_metrics["clarity"].append(evaluation.get("clarity", 70))
            self.evaluation_metrics["relevance"].append(evaluation.get("relevance", 70))
        except:
            evaluation = {
                "confidence": 70,
                "clarity": 70,
                "relevance": 70,
                "overall_score": 70,
                "feedback": "Good response with relevant details.",
                "strength": "Clear communication",
                "improvement": "Could add more specific examples"
            }
            self.evaluation_metrics["confidence"].append(70)
            self.evaluation_metrics["clarity"].append(70)
            self.evaluation_metrics["relevance"].append(70)
        
        # Add to conversation history
        self.conversation_history.append({
            "question": question_text,
            "response": response,
            "evaluation": evaluation,
            "timestamp": datetime.now().isoformat()
        })
        
        # Store response
        self.responses.append({
            "question": question_text,
            "response": response,
            "evaluation": evaluation
        })
        
        # Move to next question
        self.current_question_index += 1
        
        # Check if we should adjust difficulty
        if len(self.responses) >= 2:
            self._maybe_adjust_difficulty()
        
        # Generate next question (could be follow-up or next in list)
        next_question = self._generate_next_question(response)
        
        return {
            "evaluation": evaluation,
            "next_question": next_question,
            "metrics": {
                "avg_confidence": sum(self.evaluation_metrics["confidence"]) / len(self.evaluation_metrics["confidence"]),
                "avg_clarity": sum(self.evaluation_metrics["clarity"]) / len(self.evaluation_metrics["clarity"]),
                "avg_relevance": sum(self.evaluation_metrics["relevance"]) / len(self.evaluation_metrics["relevance"])
            }
        }
    
    def _generate_next_question(self, last_response: str):
        """Generate next question - could be follow-up or next in list"""
        self._maybe_generate_followup(last_response)
        return self.get_next_question()
    
    def _maybe_generate_followup(self, last_response: str):
        """30% chance to generate a contextual follow-up question based on resume"""
        import random
        
        if self.current_question_index < len(self.questions):
            # Sometimes generate a follow-up based on the response
            if random.random() < 0.3 and len(self.conversation_history) > 0:
                # Get last 3 conversation exchanges for context
                history_text = "\n".join([
                    f"Q: {item['question']}\nA: {item['response']}"
                    for item in self.conversation_history[-3:]
                ])
                
                try:
                    followup_json = generate_followup_question.invoke({
                        "conversation_history": history_text,
                        "last_response": last_response,
                        "interview_type": self.interview_type,
                        "current_difficulty": self.current_difficulty,
                        "resume_context": self.resume_context
                    })
                    
                    followup = json.loads(followup_json)
                    
                    # Add follow-up to questions list
                    self.questions.insert(self.current_question_index, {
                        "question": followup.get("question"),
                        "category": self.interview_type,
                        "difficulty": self.current_difficulty,
                        "is_followup": True
                    })
                except:
                    pass  # Fall back to regular next question
            
            return self.get_next_question()
        
        return None
    
    def _maybe_adjust_difficulty(self):
        """Check if difficulty should be adjusted based on performance"""
        try:
            adjustment_json = adjust_difficulty.invoke({
                "conversation_history": json.dumps(self.responses),
                "current_difficulty": self.current_difficulty
            })
            
            adjustment = json.loads(adjustment_json)
            
            if adjustment.get("should_change", False):
                self.current_difficulty = adjustment.get("recommended_difficulty", self.current_difficulty)
        except:
            pass  # Keep current difficulty if adjustment fails
    
    def complete_interview(self, resume_text: str, job_role: str):
        """Generate final analytics for completed interview"""
        self.session_state = "completed"
        
        # Generate conversation summary
        try:
            summary_json = generate_conversation_summary.invoke({
                "conversation_history": json.dumps(self.conversation_history),
                "interview_type": self.interview_type
            })
            conversation_summary = json.loads(summary_json)
        except:
            conversation_summary = {}
        
        # Prepare questions and responses
        qa_data = json.dumps(self.responses, indent=2)
        
        # Generate comprehensive analytics
        analytics_json = generate_interview_analytics.invoke({
            "questions_and_responses": qa_data,
            "resume_text": resume_text,
            "job_role": job_role
        })
        
        try:
            analytics = json.loads(analytics_json)
        except:
            # Fallback analytics
            avg_confidence = sum(self.evaluation_metrics["confidence"]) / len(self.evaluation_metrics["confidence"]) if self.evaluation_metrics["confidence"] else 70
            avg_clarity = sum(self.evaluation_metrics["clarity"]) / len(self.evaluation_metrics["clarity"]) if self.evaluation_metrics["clarity"] else 70
            avg_relevance = sum(self.evaluation_metrics["relevance"]) / len(self.evaluation_metrics["relevance"]) if self.evaluation_metrics["relevance"] else 70
            
            analytics = {
                "score": int((avg_confidence + avg_clarity + avg_relevance) / 3),
                "feedback": "Overall good performance with room for improvement in specific areas.",
                "skill_breakdown": {
                    "technical": int(avg_relevance),
                    "communication": int(avg_clarity),
                    "problem_solving": int(avg_confidence),
                    "domain_knowledge": int((avg_confidence + avg_relevance) / 2)
                },
                "areas_of_improvement": [
                    "Provide more specific examples",
                    "Improve answer structure",
                    "Show more confidence in responses"
                ],
                "recommended_resources": [
                    "Practice STAR method for behavioral questions",
                    "Review technical fundamentals",
                    "Mock interview practice"
                ],
                "resume_alignment": "Good alignment between resume and interview performance",
                "readiness_score": int((avg_confidence + avg_clarity + avg_relevance) / 3),
                "next_steps": "Continue practicing and focus on areas of improvement"
            }
        
        # Add conversational metrics
        analytics["conversational_metrics"] = {
            "avg_confidence": sum(self.evaluation_metrics["confidence"]) / len(self.evaluation_metrics["confidence"]) if self.evaluation_metrics["confidence"] else 0,
            "avg_clarity": sum(self.evaluation_metrics["clarity"]) / len(self.evaluation_metrics["clarity"]) if self.evaluation_metrics["clarity"] else 0,
            "avg_relevance": sum(self.evaluation_metrics["relevance"]) / len(self.evaluation_metrics["relevance"]) if self.evaluation_metrics["relevance"] else 0,
            "interview_type": self.interview_type,
            "final_difficulty": self.current_difficulty,
            "total_questions": len(self.responses),
            "conversation_summary": conversation_summary
        }
        
        return analytics
    
    def get_session_state(self):
        """Get current session state"""
        return {
            "session_state": self.session_state,
            "interview_type": self.interview_type,
            "current_difficulty": self.current_difficulty,
            "questions_answered": len(self.responses),
            "total_questions": len(self.questions),
            "current_metrics": {
                "avg_confidence": sum(self.evaluation_metrics["confidence"]) / len(self.evaluation_metrics["confidence"]) if self.evaluation_metrics["confidence"] else 0,
                "avg_clarity": sum(self.evaluation_metrics["clarity"]) / len(self.evaluation_metrics["clarity"]) if self.evaluation_metrics["clarity"] else 0,
                "avg_relevance": sum(self.evaluation_metrics["relevance"]) / len(self.evaluation_metrics["relevance"]) if self.evaluation_metrics["relevance"] else 0
            },
            "conversation_history": self.conversation_history
        }


# Global interview sessions store
_interview_sessions = {}

def get_interview_agent(session_id: str) -> InterviewAgent:
    """Get or create interview agent for a session"""
    if session_id not in _interview_sessions:
        _interview_sessions[session_id] = InterviewAgent()
    return _interview_sessions[session_id]

def clear_interview_session(session_id: str):
    """Clear interview session"""
    if session_id in _interview_sessions:
        del _interview_sessions[session_id]
