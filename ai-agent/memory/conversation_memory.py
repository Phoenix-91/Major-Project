from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from typing import List, Dict, Optional
import os

class ConversationMemoryManager:
    """Manages conversation memory for the AI agent"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.llm = ChatGroq(
            model="llama3-70b-8192",
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Simple message history
        self.messages = []
        
        # User context (preferences, patterns)
        self.user_context = {}
    
    def add_interaction(self, user_message: str, ai_response: str):
        """Add a user-AI interaction to memory"""
        self.messages.append({"role": "user", "content": user_message})
        self.messages.append({"role": "assistant", "content": ai_response})
        
        # Keep only last 20 messages to avoid memory bloat
        if len(self.messages) > 20:
            self.messages = self.messages[-20:]
    
    
    def add_message(self, role: str, content: str):
        """Add a single message to memory"""
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > 20:
            self.messages = self.messages[-20:]
    
    def get_recent_messages(self, limit: int = 10) -> List[Dict]:
        """Get recent messages"""
        return self.messages[-limit:] if len(self.messages) > limit else self.messages
    
    def get_recent_history(self, num_messages: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        return self.get_recent_messages(num_messages)
    
    def get_summary(self) -> str:
        """Get summarized conversation history"""
        if not self.messages:
            return ""
        return f"Recent conversation with {len(self.messages)} messages"
    
    def update_user_context(self, key: str, value: any):
        """Update user context/preferences"""
        self.user_context[key] = value
    
    def get_user_context(self) -> Dict:
        """Get user context"""
        return self.user_context
    
    def clear_short_term(self):
        """Clear short-term memory"""
        self.short_term_memory.clear()
    
    def get_context_for_prompt(self) -> str:
        """Get formatted context for AI prompts"""
        context_parts = []
        
        # Add summary if available
        summary = self.get_summary()
        if summary:
            context_parts.append(f"Previous conversation summary: {summary}")
        
        # Add user preferences
        if self.user_context:
            context_parts.append(f"User preferences: {self.user_context}")
        
        return "\n".join(context_parts) if context_parts else ""


# Global memory store (in production, use Redis or similar)
_memory_store = {}

def get_memory(user_id: str) -> ConversationMemoryManager:
    """Get or create memory manager for a user"""
    if user_id not in _memory_store:
        _memory_store[user_id] = ConversationMemoryManager(user_id)
    return _memory_store[user_id]
