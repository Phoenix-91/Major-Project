from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
import json
import re

def parse_resume_structure(resume_text: str) -> dict:
    """
    Parse resume text into structured sections using Groq LLM.
    
    Extracts:
    - Skills (programming languages, frameworks, tools)
    - Projects (name, description, technologies, role)
    - Experience (company, role, duration, responsibilities)
    - Education (degree, institution, year)
    - Technologies (specific tech stack)
    
    Args:
        resume_text: Raw text extracted from resume PDF
        
    Returns:
        Dictionary with structured resume data
    """
    if not resume_text or len(resume_text.strip()) < 50:
        return {
            "raw_text": resume_text,
            "skills": [],
            "projects": [],
            "experience": [],
            "education": [],
            "technologies": []
        }
    
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.3,  # Lower temperature for more consistent parsing
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert resume parser. Extract structured information from the resume text.

CRITICAL: Return ONLY valid JSON, no markdown, no explanations, no code blocks.

Extract the following sections:

1. **skills**: Array of technical skills (programming languages, frameworks, tools, technologies)
2. **projects**: Array of objects with:
   - name: Project name
   - description: Brief description (1-2 sentences)
   - technologies: Array of technologies used
   - role: Candidate's role in the project
3. **experience**: Array of objects with:
   - company: Company name
   - role: Job title/role
   - duration: Time period (e.g., "2022-2024" or "Jan 2022 - Present")
   - responsibilities: Array of key responsibilities (max 3)
4. **education**: Array of objects with:
   - degree: Degree name
   - institution: School/University name
   - year: Graduation year or period
5. **technologies**: Array of all technologies/tools mentioned (deduplicated from skills and projects)

Return ONLY this JSON structure:
{
  "skills": ["skill1", "skill2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "role": "Developer/Lead/etc"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "2022-2024",
      "responsibilities": ["resp1", "resp2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "2024"
    }
  ],
  "technologies": ["tech1", "tech2"]
}

If a section is not found in the resume, use an empty array []."""),
        ("user", f"Resume Text:\n\n{resume_text}")
    ])
    
    try:
        chain = prompt | llm
        response = chain.invoke({})
        
        # Clean the response - remove markdown code blocks if present
        content = response.content.strip()
        
        # Remove markdown code blocks
        if content.startswith("```"):
            # Find the actual JSON content
            lines = content.split('\n')
            json_lines = []
            in_json = False
            for line in lines:
                if line.strip().startswith("```"):
                    in_json = not in_json
                    continue
                if in_json or (not line.strip().startswith("```")):
                    json_lines.append(line)
            content = '\n'.join(json_lines)
        
        # Parse JSON
        parsed_data = json.loads(content)
        
        # Add raw text
        parsed_data["raw_text"] = resume_text
        
        # Ensure all required fields exist
        required_fields = ["skills", "projects", "experience", "education", "technologies"]
        for field in required_fields:
            if field not in parsed_data:
                parsed_data[field] = []
        
        return parsed_data
        
    except Exception as e:
        print(f"Resume parsing error: {e}")
        # Fallback: Basic regex-based extraction
        return _fallback_parse(resume_text)


def _fallback_parse(resume_text: str) -> dict:
    """Fallback parser using simple regex patterns"""
    
    # Common technology keywords
    tech_keywords = [
        "Python", "JavaScript", "Java", "C++", "C#", "Ruby", "Go", "Rust",
        "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask",
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes",
        "AWS", "Azure", "GCP", "Git", "Jenkins", "CI/CD", "REST", "GraphQL",
        "HTML", "CSS", "TypeScript", "Swift", "Kotlin", "PHP", "SQL"
    ]
    
    # Extract technologies mentioned
    technologies = []
    skills = []
    text_upper = resume_text.upper()
    
    for tech in tech_keywords:
        if tech.upper() in text_upper:
            technologies.append(tech)
            skills.append(tech)
    
    # Try to extract project sections
    projects = []
    project_pattern = r"(?:PROJECT|PROJECTS?)[\s:]+(.{0,500}?)(?=\n\n|\n[A-Z]{3,}|$)"
    project_matches = re.findall(project_pattern, resume_text, re.IGNORECASE | re.DOTALL)
    
    for match in project_matches[:3]:  # Limit to 3 projects
        projects.append({
            "name": "Project",
            "description": match.strip()[:200],
            "technologies": [t for t in technologies if t.upper() in match.upper()],
            "role": "Developer"
        })
    
    # Try to extract experience
    experience = []
    exp_pattern = r"(?:EXPERIENCE|WORK EXPERIENCE)[\s:]+(.{0,500}?)(?=\n\n|\n[A-Z]{3,}|$)"
    exp_matches = re.findall(exp_pattern, resume_text, re.IGNORECASE | re.DOTALL)
    
    for match in exp_matches[:2]:  # Limit to 2 experiences
        experience.append({
            "company": "Company",
            "role": "Software Engineer",
            "duration": "2022-2024",
            "responsibilities": [match.strip()[:150]]
        })
    
    # Try to extract education
    education = []
    edu_pattern = r"(?:EDUCATION)[\s:]+(.{0,300}?)(?=\n\n|\n[A-Z]{3,}|$)"
    edu_matches = re.findall(edu_pattern, resume_text, re.IGNORECASE | re.DOTALL)
    
    for match in edu_matches[:2]:
        education.append({
            "degree": "Bachelor's Degree",
            "institution": "University",
            "year": "2024"
        })
    
    return {
        "raw_text": resume_text,
        "skills": list(set(skills)),
        "projects": projects,
        "experience": experience,
        "education": education,
        "technologies": list(set(technologies))
    }


def format_resume_context(parsed_resume: dict) -> str:
    """Format parsed resume into a concise context string for prompts"""
    
    context_parts = []
    
    if parsed_resume.get("skills"):
        context_parts.append(f"Skills: {', '.join(parsed_resume['skills'][:10])}")
    
    if parsed_resume.get("projects"):
        projects_str = []
        for proj in parsed_resume['projects'][:3]:
            proj_tech = ', '.join(proj.get('technologies', [])[:5])
            projects_str.append(f"{proj['name']} ({proj_tech})")
        context_parts.append(f"Projects: {'; '.join(projects_str)}")
    
    if parsed_resume.get("experience"):
        exp_str = []
        for exp in parsed_resume['experience'][:2]:
            exp_str.append(f"{exp['role']} at {exp['company']}")
        context_parts.append(f"Experience: {'; '.join(exp_str)}")
    
    if parsed_resume.get("education"):
        edu_str = []
        for edu in parsed_resume['education'][:2]:
            edu_str.append(f"{edu['degree']} from {edu['institution']}")
        context_parts.append(f"Education: {'; '.join(edu_str)}")
    
    return "\n".join(context_parts)
