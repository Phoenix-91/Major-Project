from langchain.tools import tool
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict
import os
import json

@tool
def generate_interview_questions(
    resume_text: str,
    job_role: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    resume_context: str = ""
) -> str:
    """
    Generates interview questions STRICTLY based on resume content.
    Questions explicitly reference specific projects, skills, and experiences from the resume.
    
    Args:
        resume_text: Parsed text from candidate's resume
        job_role: Target job role (e.g., "Software Engineer", "Data Scientist")
        difficulty: Question difficulty (easy, medium, hard)
        num_questions: Number of questions to generate
        resume_context: Structured resume context (skills, projects, experience)
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.7,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert technical interviewer. Generate {num_questions} {difficulty} 
        interview questions for a {job_role} position STRICTLY based on the candidate's resume.
        
        CRITICAL RULES - FOLLOW EXACTLY:
        1. ONLY ask about skills, technologies, projects, and experiences EXPLICITLY mentioned in the resume
        2. ALWAYS reference specific items from the resume by name
        3. DO NOT ask generic questions that could apply to anyone
        4. Start questions with phrases like:
           - "I see you worked on [PROJECT NAME]..."
           - "You mentioned [TECHNOLOGY] in your resume..."
           - "In your role at [COMPANY]..."
           - "Your resume shows experience with [SKILL]..."
        
        Question Types to Include:
        - Project Deep-Dives: Ask about specific projects, their architecture, challenges, your role
        - Technology Probing: Ask how they used specific technologies they listed
        - Experience-Based: Ask about responsibilities and achievements at companies they worked at
        - Problem-Solving: Ask how they solved specific problems in their listed projects
        
        Resume Context:
        {resume_context if resume_context else "See resume text below"}
        
        Example Good Questions:
        - "I see you built an E-commerce Platform using React and Node.js. Can you walk me through the architecture and your specific contributions?"
        - "You mentioned Docker in your skills. How did you use Docker in your [PROJECT NAME] project?"
        - "At [COMPANY], you worked as a [ROLE]. Can you describe a challenging problem you solved there?"
        
        Example BAD Questions (DO NOT USE):
        - "Tell me about yourself" (too generic)
        - "What are your strengths?" (not resume-specific)
        - "Where do you see yourself in 5 years?" (not technical or resume-based)
        
        Return ONLY a JSON array of questions with this format:
        [
            {{"question": "I see you worked on [SPECIFIC PROJECT]. Can you explain...", "category": "technical/behavioral/project", "difficulty": "{difficulty}"}},
            ...
        ]"""),
        ("user", f"Resume:\n{resume_text}\n\nJob Role: {job_role}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content

@tool
def evaluate_interview_response(
    question: str,
    response: str,
    job_role: str,
    resume_context: str = ""
) -> str:
    """
    Evaluates a candidate's response to an interview question.
    
    Args:
        question: The interview question asked
        response: Candidate's response
        job_role: Target job role
        resume_context: Optional resume context for evaluation
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert interviewer evaluating responses for a {job_role} position.
        
        Evaluate the response on:
        1. Technical accuracy (if applicable)
        2. Communication clarity
        3. Problem-solving approach
        4. Completeness of answer
        5. Relevance to the question
        
        Provide:
        - Score (0-10)
        - Brief feedback (2-3 sentences)
        - Strengths
        - Areas for improvement
        
        Return as JSON:
        {{
            "score": 0-10,
            "feedback": "...",
            "strengths": ["...", "..."],
            "improvements": ["...", "..."]
        }}"""),
        ("user", f"Question: {question}\n\nCandidate Response: {response}\n\nResume Context: {resume_context}")
    ])
    
    chain = prompt | llm
    response_obj = chain.invoke({})
    
    return response_obj.content

@tool
def generate_interview_analytics(
    questions_and_responses: str,
    resume_text: str,
    job_role: str
) -> str:
    """
    Generates comprehensive analytics for a completed interview.
    
    Args:
        questions_and_responses: JSON string of questions and responses
        resume_text: Candidate's resume text
        job_role: Target job role
    """
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert interview analyst. Generate comprehensive analytics for this {job_role} interview.
        
        Provide:
        1. Overall score (0-100)
        2. Detailed feedback (3-4 sentences)
        3. Skill-wise breakdown (technical, communication, problem-solving)
        4. Areas for improvement (3-5 specific points)
        5. Recommended resources (3-5 specific resources/topics)
        6. Resume vs Performance alignment
        7. Readiness score for the role (0-100)
        
        Return as JSON:
        {{
            "score": 0-100,
            "feedback": "...",
            "skill_breakdown": {{
                "technical": 0-100,
                "communication": 0-100,
                "problem_solving": 0-100,
                "domain_knowledge": 0-100
            }},
            "areas_of_improvement": ["...", "...", "..."],
            "recommended_resources": ["...", "...", "..."],
            "resume_alignment": "...",
            "readiness_score": 0-100,
            "next_steps": "..."
        }}"""),
        ("user", f"Interview Data:\n{questions_and_responses}\n\nResume:\n{resume_text}\n\nJob Role: {job_role}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return response.content

def get_interview_tools():
    """Returns all interview-related tools"""
    return [
        generate_interview_questions,
        evaluate_interview_response,
        generate_interview_analytics
    ]
