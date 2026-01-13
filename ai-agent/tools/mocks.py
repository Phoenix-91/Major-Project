from tools.email_tool import get_email_tools
from tools.calendar_tool import get_calendar_tools
from tools.interview_tool import get_interview_tools

def get_tools():
    """Returns all available tools for the agent"""
    tools = []
    tools.extend(get_email_tools())
    tools.extend(get_calendar_tools())
    tools.extend(get_interview_tools())
    return tools

def get_automation_tools():
    """Returns only automation tools (email + calendar)"""
    tools = []
    tools.extend(get_email_tools())
    tools.extend(get_calendar_tools())
    return tools

