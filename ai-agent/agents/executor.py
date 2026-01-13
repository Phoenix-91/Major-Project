from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from tools.mocks import get_automation_tools
from memory.conversation_memory import get_memory
import os
import time
import json

class AgentSystem:
    def __init__(self):
        self.tools = get_automation_tools()
        self.llm = ChatGroq(
            model="llama3-70b-8192", 
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY")
        )
        
    def execute(self, command: str, user_id: str = "default", max_retries: int = 2):
        """Execute a command with simplified tool calling"""
        
        # Get user memory
        memory = get_memory(user_id)
        
        # Build tool descriptions
        tool_descriptions = "\n".join([
            f"- {tool.name}: {tool.description}" 
            for tool in self.tools
        ])
        
        # Create prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""You are an intelligent automation agent. 

Available tools:
{tool_descriptions}

When you need to use a tool, respond with JSON in this format:
{{"action": "tool_name", "action_input": "input_string"}}

Otherwise, provide a direct answer."""),
            ("user", "{input}")
        ])
        
        # Execute with retry logic
        for attempt in range(max_retries + 1):
            try:
                start_time = time.time()
                
                # Get LLM response
                chain = prompt | self.llm
                response = chain.invoke({"input": command})
                
                result_text = response.content
                
                # Try to parse as tool call
                try:
                    if "{" in result_text and "action" in result_text:
                        action_data = json.loads(result_text)
                        tool_name = action_data.get("action")
                        tool_input = action_data.get("action_input")
                        
                        # Find and execute tool
                        for tool in self.tools:
                            if tool.name == tool_name:
                                tool_result = tool.invoke(tool_input)
                                result_text = f"Tool '{tool_name}' executed successfully. Result: {tool_result}"
                                break
                except:
                    # Not a tool call, just return the response
                    pass
                
                execution_time = time.time() - start_time
                
                # Save to memory
                memory.add_interaction(command, result_text)
                
                return {
                    "output": result_text,
                    "success": True,
                    "execution_time": execution_time,
                    "attempts": attempt + 1
                }
            except Exception as e:
                if attempt == max_retries:
                    return {
                        "output": f"Failed after {max_retries + 1} attempts: {str(e)}",
                        "success": False,
                        "error": str(e),
                        "attempts": attempt + 1
                    }
                # Wait before retry
                time.sleep(1)
                continue
