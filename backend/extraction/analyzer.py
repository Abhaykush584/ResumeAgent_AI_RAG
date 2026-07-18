import os
import json
from google import genai

def generate_resume_analysis(resume_text, jd_text):
    """
    Generates a structured JSON analysis comparing a resume to a job description.
    Returns a Python dictionary with the analysis.
    """
    api_key = os.getenv("APP_API_KEY")
    if not api_key:
        raise RuntimeError("APP_API_KEY not set")
    
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
    Analyze the provided Resume against the provided Job Description.

    Return ONLY a highly accurate, structured JSON object with the following exact keys and types:
    {{
        "overall_score": <int, 0-100 based on alignment>,
        "ats_score": <int, 0-100 based on ATS readability and keyword matching>,
        "keyword_match": <int, 0-100 based on keyword density>,
        "skills_found": [<list of strings, exact skills found in both>],
        "missing_skills": [<list of strings, key skills in JD missing from resume>],
        "strengths": [<list of strings, bullet points of resume strengths>],
        "weaknesses": [<list of strings, bullet points of areas to improve>],
        "improvement_suggestions": [<list of strings, actionable feedback>],
        "experience_summary": "<string, brief summary of work experience>",
        "education_summary": "<string, brief summary of education>",
        "projects_summary": "<string, brief summary of projects>"
    }}

    IMPORTANT: 
    - The response must be valid JSON.
    - Do not include markdown code block formatting (```json) in your response. Just return the raw JSON object.
    
    Job Description:
    {jd_text}
    
    Resume:
    {resume_text}
    """

    from tenacity import retry, stop_after_attempt, wait_exponential

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
    def _call_gemini():
        return client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

    try:
        response = _call_gemini()
        
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"Error generating analysis: {e}")
        # Return fallback safe data
        return {
            "overall_score": 0,
            "ats_score": 0,
            "keyword_match": 0,
            "skills_found": [],
            "missing_skills": [],
            "strengths": [],
            "weaknesses": [],
            "improvement_suggestions": [],
            "experience_summary": "",
            "education_summary": "",
            "projects_summary": ""
        }
