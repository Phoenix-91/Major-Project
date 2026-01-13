from langchain.tools import tool
from typing import Optional, List, Dict
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@tool
def send_email(recipient: str, subject: str, body: str) -> str:
    """Sends an email to the specified recipient using SMTP configuration."""
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    if not all([smtp_host, smtp_port, smtp_user, smtp_pass]):
        # Fallback for dev/demo if config missing
        print(f"⚠️ SMTP Config missing. Mock sending to {recipient}")
        return json.dumps({
            "success": True, 
            "message": f"[MOCK] Email sent to {recipient} (Configure SMTP to send real emails)",
            "recipient": recipient
        })

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_host, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        
        return json.dumps({
            "success": True,
            "message": f"Email sent successfully to {recipient}",
            "recipient": recipient,
            "subject": subject
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })

@tool
def detect_tone(text: str) -> str:
    """Analyzes the tone of the provided text."""
    from langchain_groq import ChatGroq
    from langchain_core.prompts import ChatPromptTemplate
    
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Analyze the tone of the following text. Return a JSON object with 'tone' (e.g., professional, casual, urgent, angry) and 'confidence' (0.0-1.0)."),
        ("user", "{text}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"text": text})
    return response.content

@tool
def draft_email(recipient: str, subject: str, context: str, tone: str = "professional") -> str:
    """
    Drafts an email using AI based on context and desired tone.
    """
    from langchain_groq import ChatGroq
    from langchain_core.prompts import ChatPromptTemplate
    
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.7,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert email writer. Draft a {tone} email based on the context provided.
        The email should be clear, concise, and appropriate for the {tone} tone.
        Subject: {subject}
        Recipient: {recipient}
        
        Return the email body only. Do not include the subject line in the body."""),
        ("user", f"Context: {context}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    return json.dumps({
        "recipient": recipient,
        "subject": subject,
        "body": response.content,
        "tone": tone
    })

@tool
def summarize_email(email_content: str) -> str:
    """Summarizes the content of an email into key points."""
    from langchain_groq import ChatGroq
    from langchain_core.prompts import ChatPromptTemplate
    
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Summarize the following email into 2-3 key bullet points."),
        ("user", "{email}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"email": email_content})
    
    return response.content

def get_email_tools():
    """Returns all email-related tools"""
    return [send_email, draft_email, summarize_email, detect_tone]
