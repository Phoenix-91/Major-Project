"""
Multi-LLM Provider with Automatic Fallback
Supports: Groq (primary), Ollama (fallback), OpenAI (backup)
"""

import os
from typing import Optional, Dict, Any
import logging
from langchain_groq import ChatGroq
from langchain_community.llms import Ollama
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

class MultiLLMProvider:
    """
    Manages multiple LLM providers with automatic fallback
    Priority: Groq -> Ollama -> OpenAI
    """
    
    def __init__(self):
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.ollama_base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        
        # Initialize providers
        self.providers = {}
        self._initialize_providers()
        
    def _initialize_providers(self):
        """Initialize all available LLM providers"""
        
        # 1. Groq (Primary - Fast and Free)
        if self.groq_api_key and self.groq_api_key != 'your-groq-api-key-here':
            try:
                self.providers['groq'] = ChatGroq(
                    api_key=self.groq_api_key,
                    model_name="llama-3.3-70b-versatile",  # Fast model
                    temperature=0.7,
                    max_tokens=2048,
                    timeout=30,
                    max_retries=2
                )
                logger.info("✅ Groq LLM initialized")
            except Exception as e:
                logger.warning(f"⚠️ Groq initialization failed: {e}")
        
        # 2. Ollama (Fallback - Local and Free)
        try:
            self.providers['ollama'] = Ollama(
                base_url=self.ollama_base_url,
                model="llama3.2:3b",  # Lightweight model
                temperature=0.7,
                timeout=30
            )
            logger.info("✅ Ollama LLM initialized")
        except Exception as e:
            logger.warning(f"⚠️ Ollama initialization failed: {e}")
        
        # 3. OpenAI (Backup - Paid but reliable)
        if self.openai_api_key and self.openai_api_key.startswith('sk-'):
            try:
                self.providers['openai'] = ChatOpenAI(
                    api_key=self.openai_api_key,
                    model_name="gpt-3.5-turbo",
                    temperature=0.7,
                    max_tokens=2048,
                    timeout=30
                )
                logger.info("✅ OpenAI LLM initialized")
            except Exception as e:
                logger.warning(f"⚠️ OpenAI initialization failed: {e}")
        
        if not self.providers:
            raise RuntimeError("❌ No LLM providers available! Please configure at least one.")
        
        logger.info(f"🚀 Available providers: {list(self.providers.keys())}")
    
    def get_llm(self, preferred: Optional[str] = None):
        """
        Get LLM with fallback support
        
        Args:
            preferred: Preferred provider ('groq', 'ollama', 'openai')
        
        Returns:
            LLM instance
        """
        # Try preferred provider first
        if preferred and preferred in self.providers:
            logger.info(f"Using preferred provider: {preferred}")
            return self.providers[preferred]
        
        # Fallback order: groq -> ollama -> openai
        fallback_order = ['groq', 'ollama', 'openai']
        
        for provider in fallback_order:
            if provider in self.providers:
                logger.info(f"Using provider: {provider}")
                return self.providers[provider]
        
        raise RuntimeError("No LLM providers available")
    
    def invoke_with_fallback(self, prompt: str, preferred: Optional[str] = None) -> str:
        """
        Invoke LLM with automatic fallback on failure
        
        Args:
            prompt: The prompt to send
            preferred: Preferred provider
        
        Returns:
            LLM response
        """
        fallback_order = ['groq', 'ollama', 'openai']
        
        # Put preferred provider first if specified
        if preferred and preferred in self.providers:
            fallback_order.remove(preferred)
            fallback_order.insert(0, preferred)
        
        last_error = None
        
        for provider_name in fallback_order:
            if provider_name not in self.providers:
                continue
            
            try:
                logger.info(f"🔄 Trying {provider_name}...")
                provider = self.providers[provider_name]
                
                # Invoke based on provider type
                if hasattr(provider, 'invoke'):
                    response = provider.invoke(prompt)
                    if hasattr(response, 'content'):
                        result = response.content
                    else:
                        result = str(response)
                else:
                    result = provider(prompt)
                
                logger.info(f"✅ Success with {provider_name}")
                return result
                
            except Exception as e:
                logger.warning(f"⚠️ {provider_name} failed: {str(e)}")
                last_error = e
                continue
        
        # All providers failed
        raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")
    
    def get_available_providers(self) -> list:
        """Get list of available providers"""
        return list(self.providers.keys())
    
    def is_provider_available(self, provider: str) -> bool:
        """Check if a specific provider is available"""
        return provider in self.providers


# Global instance
_llm_provider = None

def get_llm_provider() -> MultiLLMProvider:
    """Get or create global LLM provider instance"""
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = MultiLLMProvider()
    return _llm_provider
