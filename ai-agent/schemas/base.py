from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None
    timezone: str = "UTC"

class ActionStep(BaseModel):
    tool_name: str = Field(..., description="The name of the tool to use")
    tool_input: Dict[str, Any] = Field(..., description="Input parameters for the tool")
    reasoning: str = Field(..., description="Why this tool was chosen")
    risk_level: str = Field(default="low", description="Risk level: low, medium, high")
    confidence: float = Field(default=0.8, description="Confidence score 0.0-1.0")

class Plan(BaseModel):
    steps: List[ActionStep]
    original_command: str

class EnhancedPlan(Plan):
    """Enhanced plan with additional metadata"""
    overall_risk: str = Field(default="low", description="Overall risk assessment")
    requires_confirmation: bool = Field(default=False, description="Whether user confirmation is needed")
    estimated_duration: Optional[int] = Field(default=None, description="Estimated duration in seconds")

class AgentResponse(BaseModel):
    status: str
    plan: Optional[Plan] = None
    execution_results: List[Dict[str, Any]] = []
    final_response: str
    confidence: Optional[float] = None
    execution_time: Optional[float] = None

class CommandRequest(BaseModel):
    command: str
    user_id: str
    context: Optional[Dict[str, Any]] = None
