from langchain.tools import tool
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from typing import Dict, List
import os
import json

@tool
def generate_followup_question(
    conversation_history: str,
    last_response: str,
    interview_type: str = "general",
    current_difficulty: str = "medium",
    resume_context: str = ""
) -> str:
    """
    Generate a contextual follow-up question based on the conversation and resume.
    Follow-ups should dig deeper into resume claims and specific experiences.
    
    Args:
        conversation_history: Previous Q&A exchanges
        last_response: Candidate's most recent answer
        interview_type: Type of interview (hr, technical, behavioral, situational)
        current_difficulty: Current difficulty level
        resume_context: Structured resume information
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.8,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert interviewer conducting a {interview_type} interview.
        
        Generate a follow-up question that:
        1. Digs deeper into what the candidate just said
        2. References their resume (specific projects, skills, technologies, experiences)
        3. Asks for concrete examples from their listed experience
        4. Probes technical details if they mentioned a technology from their resume
        5. Challenges them to elaborate on claims made in their resume
        
        Resume Context:
        {resume_context if resume_context else "No structured context available"}
        
        Question Style Examples:
        - "You mentioned [TECHNOLOGY] in your answer. I see it's also in your resume. How did you specifically use it in [PROJECT]?"
        - "That's interesting. In your resume, you listed [SKILL]. Can you give me a specific example of when you used it?"
        - "You worked on [PROJECT] according to your resume. How does what you just described relate to that project?"
        
        CRITICAL: The follow-up must feel natural and reference something from their resume or previous answer.
        
        Return ONLY a JSON object:
        {{
            "question": "Your follow-up question here that references resume items",
            "category": "{interview_type}",
            "difficulty": "{current_difficulty}",
            "reasoning": "Why this follow-up makes sense based on their answer and resume"
        }}"""),
        ("user", f"Conversation History:\n{conversation_history}\n\nLast Response: {last_response}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content


@tool
def evaluate_response_realtime(
    question: str,
    response: str,
    interview_type: str = "general",
    job_role: str = "",
    resume_context: str = ""
) -> str:
    """
    Evaluate response in real-time with confidence, clarity, and relevance scores.
    Also checks alignment with resume claims.
    
    Args:
        question: The question that was asked
        response: Candidate's answer
        interview_type: Type of interview
        job_role: Target job role
        resume_context: Structured resume information
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert interviewer evaluating a {interview_type} interview response for a {job_role} position.

Evaluate the response on THREE key metrics:

1. **Confidence** (0-100): How certain and decisive does the candidate sound?
   - High (80-100): Definitive statements, no hedging, clear assertions
   - Medium (50-79): Some uncertainty, occasional hedging
   - Low (0-49): Very uncertain, excessive "I think", "maybe", "probably"

2. **Clarity** (0-100): How well-structured and easy to follow is the communication?
   - High (80-100): Logical flow, concise, well-organized, easy to understand
   - Medium (50-79): Somewhat clear but could be more concise
   - Low (0-49): Rambling, unclear, poorly structured

3. **Relevance** (0-100): How well does the answer address the question and align with their resume?
   - High (80-100): Directly answers question, provides resume-backed examples, demonstrates claimed skills
   - Medium (50-79): Partially relevant, some alignment with resume
   - Low (0-49): Off-topic, doesn't align with resume claims, vague

Resume Context (for alignment check):
{resume_context if resume_context else "No structured context available"}

CRITICAL: If the question asks about something from their resume, check if their answer demonstrates actual knowledge of that skill/project/technology.

Return ONLY a JSON object:
{{
    "confidence": 0-100,
    "clarity": 0-100,
    "relevance": 0-100,
    "overall_score": 0-100,
    "feedback": "Brief constructive feedback (1-2 sentences)",
    "strength": "What they did well",
    "improvement": "One specific thing to improve",
    "resume_alignment": "How well their answer aligns with resume claims (if applicable)"
}}"""),
        ("user", f"Question: {question}\n\nCandidate Response: {response}")
    ])
    
    chain = prompt | llm
    response_obj = chain.invoke({})
    
    return response_obj.content


@tool
def adjust_difficulty(
    conversation_history: str,
    current_difficulty: str = "medium"
) -> str:
    """
    Analyzes performance and suggests difficulty adjustment.
    
    Args:
        conversation_history: JSON string of Q&A pairs with evaluations
        current_difficulty: Current difficulty level
    
    Returns:
        JSON with recommended difficulty and reasoning
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an adaptive interview system analyzer.
        
        Analyze the conversation history and evaluation scores to determine if difficulty should be adjusted.
        
        Current difficulty: {current_difficulty}
        
        Rules:
        - If average scores are consistently above 80: Increase difficulty
        - If average scores are consistently below 50: Decrease difficulty
        - If scores are between 50-80: Maintain current difficulty
        - Consider the trend (improving vs declining)
        
        Difficulty levels: easy, medium, hard
        
        Return ONLY a JSON object:
        {{
            "recommended_difficulty": "easy/medium/hard",
            "should_change": true/false,
            "reasoning": "Why this adjustment makes sense",
            "average_performance": 0-100
        }}"""),
        ("user", f"Conversation History with Scores:\n{conversation_history}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content


@tool
def generate_conversation_summary(
    conversation_history: str,
    interview_type: str = "general"
) -> str:
    """
    Summarizes the interview conversation and identifies key themes.
    
    Args:
        conversation_history: JSON string of Q&A pairs
        interview_type: Type of interview
    
    Returns:
        JSON with conversation summary and insights
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an interview analyst summarizing a {interview_type} interview.
        
        Analyze the conversation and provide:
        1. Key topics discussed
        2. Candidate's main strengths shown
        3. Areas that need more exploration
        4. Overall interview flow quality
        
        Return ONLY a JSON object:
        {{
            "key_topics": ["topic1", "topic2", "topic3"],
            "demonstrated_strengths": ["strength1", "strength2"],
            "areas_to_explore": ["area1", "area2"],
            "flow_quality": "excellent/good/fair/poor",
            "summary": "2-3 sentence summary of the interview"
        }}"""),
        ("user", f"Interview Conversation:\n{conversation_history}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content


def get_conversational_tools():
    """Returns all conversational interview tools"""
    return [
        generate_followup_question,
        evaluate_response_realtime,
        adjust_difficulty,
        generate_conversation_summary
    ]
