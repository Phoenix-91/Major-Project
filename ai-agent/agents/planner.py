from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from schemas.base import Plan, EnhancedPlan
import os

class PlannerAgent:
    def __init__(self):
        self.llm = ChatGroq(
            model_name="llama3-70b-8192",
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=EnhancedPlan)
        
    def create_plan(self, user_command: str, context: dict = None) -> EnhancedPlan:
        """Create an execution plan with confidence scoring and risk assessment"""
        
        # Build context string
        context_str = ""
        if context:
            context_str = f"\n\nUser Context:\n{context}"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert AI planner for an automation system. 
            
            Available tools:
            - Email: send_email, draft_email, summarize_email
            - Calendar: schedule_meeting, check_calendar_conflicts, cancel_meeting, reschedule_meeting
            - Interview: generate_interview_questions, evaluate_interview_response, generate_interview_analytics
            
            Your task is to break down user requests into actionable steps.
            
            For each step:
            1. Choose the appropriate tool
            2. Specify exact parameters
            3. Explain your reasoning
            4. Assess risk level (low/medium/high)
            5. Provide confidence score (0.0-1.0)
            
            Risk Assessment:
            - HIGH: Sending emails, deleting data, financial actions
            - MEDIUM: Scheduling meetings, modifying existing data
            - LOW: Reading data, drafting content, generating reports
            
            {format_instructions}"""),
            ("user", "{command}{context}")
        ])
        
        messages = prompt.format_messages(
            command=user_command,
            context=context_str,
            format_instructions=self.parser.get_format_instructions()
        )
        
        response = self.llm.invoke(messages)
        return self.parser.parse(response.content)
    
    def assess_overall_risk(self, plan: EnhancedPlan) -> str:
        """Assess overall risk of the plan"""
        risk_levels = [step.risk_level for step in plan.steps]
        if 'high' in risk_levels:
            return 'high'
        elif 'medium' in risk_levels:
            return 'medium'
        return 'low'
    
    def requires_confirmation(self, plan: EnhancedPlan) -> bool:
        """Determine if plan requires user confirmation"""
        return self.assess_overall_risk(plan) in ['high', 'medium']
