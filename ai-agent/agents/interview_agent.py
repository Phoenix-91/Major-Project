from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from tools.interview_tool import generate_interview_questions, evaluate_interview_response, generate_interview_analytics
import os
import json

class InterviewAgent:
    """Specialized agent for conducting AI interviews"""
    
    def __init__(self):
        self.llm = ChatGroq(
            model="llama3-70b-8192",
            temperature=0.7,
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.current_question_index = 0
        self.questions = []
        self.responses = []
    
    def start_interview(self, resume_text: str, job_role: str, difficulty: str = "medium"):
        """Initialize interview with resume-based questions"""
        # Generate questions
        questions_json = generate_interview_questions.invoke({
            "resume_text": resume_text,
            "job_role": job_role,
            "difficulty": difficulty,
            "num_questions": 5
        })
        
        try:
            self.questions = json.loads(questions_json)
        except:
            # Fallback if JSON parsing fails
            self.questions = [
                {"question": "Tell me about yourself and your background.", "category": "behavioral", "difficulty": difficulty},
                {"question": f"What interests you about the {job_role} role?", "category": "behavioral", "difficulty": difficulty},
                {"question": "Describe a challenging project you've worked on.", "category": "situational", "difficulty": difficulty},
                {"question": "What are your key technical strengths?", "category": "technical", "difficulty": difficulty},
                {"question": "Where do you see yourself in 5 years?", "category": "behavioral", "difficulty": difficulty}
            ]
        
        self.current_question_index = 0
        self.responses = []
        
        return self.get_next_question()
    
    def get_next_question(self):
        """Get the next interview question"""
        if self.current_question_index >= len(self.questions):
            return None
        
        question = self.questions[self.current_question_index]
        return {
            "question": question.get("question", question) if isinstance(question, dict) else question,
            "index": self.current_question_index + 1,
            "total": len(self.questions),
            "category": question.get("category", "general") if isinstance(question, dict) else "general"
        }
    
    def submit_response(self, response: str, resume_text: str = "", job_role: str = ""):
        """Submit response to current question and get evaluation"""
        if self.current_question_index >= len(self.questions):
            return {"error": "No active question"}
        
        current_q = self.questions[self.current_question_index]
        question_text = current_q.get("question", current_q) if isinstance(current_q, dict) else current_q
        
        # Evaluate response
        evaluation_json = evaluate_interview_response.invoke({
            "question": question_text,
            "response": response,
            "job_role": job_role,
            "resume_context": resume_text
        })
        
        try:
            evaluation = json.loads(evaluation_json)
        except:
            evaluation = {
                "score": 7,
                "feedback": "Good response with relevant details.",
                "strengths": ["Clear communication"],
                "improvements": ["Could add more specific examples"]
            }
        
        # Store response
        self.responses.append({
            "question": question_text,
            "response": response,
            "evaluation": evaluation
        })
        
        # Move to next question
        self.current_question_index += 1
        
        return {
            "evaluation": evaluation,
            "next_question": self.get_next_question()
        }
    
    def complete_interview(self, resume_text: str, job_role: str):
        """Generate final analytics for completed interview"""
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
            avg_score = sum(r["evaluation"].get("score", 7) for r in self.responses) / len(self.responses) if self.responses else 70
            analytics = {
                "score": int(avg_score * 10),
                "feedback": "Overall good performance with room for improvement in specific areas.",
                "skill_breakdown": {
                    "technical": 75,
                    "communication": 80,
                    "problem_solving": 70,
                    "domain_knowledge": 75
                },
                "areas_of_improvement": [
                    "System design concepts",
                    "More specific examples in responses",
                    "Deeper technical explanations"
                ],
                "recommended_resources": [
                    "System Design Interview book",
                    "LeetCode for problem-solving",
                    "Industry-specific blogs and documentation"
                ],
                "resume_alignment": "Good alignment between resume and interview performance",
                "readiness_score": int(avg_score * 10),
                "next_steps": "Practice more technical interviews and work on system design"
            }
        
        return analytics


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
