# backend/app.py

from dotenv import load_dotenv
load_dotenv(override=False)  # Don't override env vars already set by Docker


import os
import urllib.parse
from flask import Flask, request, jsonify, Response


from flask_cors import CORS


# import google.generativeai as genai

from google import genai

from utils import file_utils


from extraction.extractor import extract_resume_chunks
from matching.jd_parser import process_jd_and_embed
from matching.vector_store import get_session_retriever



# =========================
# Flask App
# =========================
app = Flask(__name__)
CORS(app)

db_user = os.getenv("POSTGRES_USER", "postgres")
db_pass = os.getenv("POSTGRES_PASSWORD", "1925@")
db_name = os.getenv("POSTGRES_DB", "resume2job")
db_pass_encoded = urllib.parse.quote_plus(db_pass)
db_url = f"postgresql://{db_user}:{db_pass_encoded}@db:5432/{db_name}"

raw_db_url = os.getenv("DATABASE_URL", db_url)
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-me")

from extensions import db, jwt
db.init_app(app)
jwt.init_app(app)

from flask_migrate import Migrate
import models # ensure models are imported for migrations
migrate = Migrate(app, db)

from routes.auth_routes import auth_bp
from routes.analytics_routes import analytics_bp
from routes.settings_routes import settings_bp
from routes.chat_routes import chat_bp
from routes.analysis_routes import analysis_bp
from flask_jwt_extended import jwt_required, get_jwt_identity

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

# Create database tables automatically if they don't exist
with app.app_context():
    db.create_all()

# =========================
# Gemini Config
# =========================
# def configure_gemini():
#     genai.configure(api_key=os.getenv("APP_API_KEY"))

client = genai.Client(api_key=os.getenv("APP_API_KEY"))


# =========================
# Infer response mode
# =========================
def infer_response_mode(prompt: str) -> str:
    prompt_lower = prompt.lower()

    if any(word in prompt_lower for word in [
        "guarantee", "step by step", "in detail",
        "what should i do", "how can i improve",
        "explain deeply", "detailed"
    ]):
        return "detailed"

    return "brief"


# =========================
# LLM Call
# =========================
# def call_llm(prompt: str) -> str:
#     try:
#         configure_gemini()
#         model = genai.GenerativeModel("gemini-2.5-flash")
#         response = model.generate_content(prompt)
#         return response.text.strip()
#     except Exception as e:
#         return "Sorry, I couldn't generate a response at the moment."


def stream_llm(prompt: str):
    try:
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=prompt
        )
        for chunk in response:
            yield chunk.text
    except Exception as e:
        print("Gemini error:", e)
        yield "Sorry, I couldn't generate a response at the moment."




# =========================
# Upload Endpoint
# =========================
@app.route("/upload", methods=["POST"])
@jwt_required()
def upload_files():
    user_id = get_jwt_identity()
    session_id = request.form.get("session_id")
    resume_file = request.files.get("resume")
    jd_file = request.files.get("jd")

    if not session_id or not resume_file or not jd_file:
        return "Missing session_id or files", 400

    from models import ChatSession, ResumeMetadata, ResumeAnalysis
    from extraction.analyzer import generate_resume_analysis
    
    # Create session if it doesn't exist
    session = ChatSession.query.filter_by(id=session_id).first()
    if not session:
        session = ChatSession(id=session_id, user_id=user_id, title=resume_file.filename or "New Analysis")
        db.session.add(session)
        db.session.commit()

    resume_path = file_utils.save_uploaded_file(resume_file, session_id, "resume")
    jd_path = file_utils.save_uploaded_file(jd_file, session_id, "jd")
    
    # Save metadata
    meta = ResumeMetadata(session_id=session_id, filename=resume_file.filename, file_type="resume")
    db.session.add(meta)
    db.session.commit()

    # Synchronous processing so the frontend doesn't query before vectors are ready
    try:
        resume_text = extract_resume_chunks(resume_path, session_id)
        jd_text = process_jd_and_embed(jd_path, session_id)
        
        # Generate the structured resume analysis using LLM
        analysis_data = generate_resume_analysis(resume_text, jd_text)
        
        # Save analysis to DB
        analysis_record = ResumeAnalysis(
            user_id=user_id,
            resume_id=meta.id,
            session_id=session_id,
            overall_score=analysis_data.get("overall_score", 0),
            ats_score=analysis_data.get("ats_score", 0),
            keyword_match=analysis_data.get("keyword_match", 0),
            skills_found=analysis_data.get("skills_found", []),
            missing_skills=analysis_data.get("missing_skills", []),
            strengths=analysis_data.get("strengths", []),
            weaknesses=analysis_data.get("weaknesses", []),
            improvement_suggestions=analysis_data.get("improvement_suggestions", []),
            experience_summary=analysis_data.get("experience_summary", ""),
            education_summary=analysis_data.get("education_summary", ""),
            projects_summary=analysis_data.get("projects_summary", "")
        )
        db.session.add(analysis_record)
        
        # Also update the basic metadata score for quick access
        meta.score = analysis_data.get("overall_score", 0)
        meta.ats_score = analysis_data.get("ats_score", 0)
        
        db.session.commit()
    except Exception as e:
        print("Error processing upload:", e)
        db.session.rollback()
        import traceback
        return jsonify({"msg": "Error analyzing files. Please try again.", "error": str(e), "trace": traceback.format_exc()}), 500

    return jsonify({"msg": "Upload received and processed successfully.", "session_id": session_id}), 200


@app.route("/", methods=["GET"])
def health():
    return {"status": "ok", "service": "Resume2Job backend"}


# =========================
# Query Endpoint
# =========================
@app.route("/query", methods=["POST"])
@jwt_required()
def handle_query():
    user_id = get_jwt_identity()
    session_id = request.form.get("session_id")
    prompt = request.form.get("prompt")

    if not session_id or not prompt:
        return jsonify({"msg": "Missing session_id or prompt"}), 400

    from models import ChatSession, Message
    
    # Verify session belongs to user
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"msg": "Session not found or access denied"}), 403

    # Get Langchain retriever for this session
    try:
        retriever = get_session_retriever(session_id)
        docs = retriever.invoke(prompt)
        
        if not docs:
            return jsonify({"msg": "Data not ready yet or no relevant info found. Please try again."}), 404
            
        # Combine retrieved chunks
        context = "\n".join([doc.page_content for doc in docs])
    except Exception as e:
        print(f"Retriever error: {e}")
        return jsonify({"msg": "Error retrieving context data."}), 500

    # Save User message to DB
    user_msg = Message(session_id=session_id, role="user", content=prompt)
    db.session.add(user_msg)
    db.session.commit()

    mode = infer_response_mode(prompt)

    if mode == "brief":
        llm_prompt = f"""
SYSTEM MESSAGE: You are an elite Resume Analyzer and Career Advisor, the absolute best in the industry. Your goal is to maximize the user's chances of landing a job by providing hyper-accurate, actionable feedback based on their resume and the job description.

INSTRUCTIONS: Answer the question clearly and concisely.

CHAIN OF THOUGHT:
1. Carefully analyze the User's Question against the Context Retrieved.
2. Identify the most critical and direct answer.
3. Formulate the response using concise bullet points.

FEW-SHOT EXAMPLES:
User: Is my resume ATS friendly?
Assistant: 
- **Format:** Your resume uses standard fonts and clear headings, which is ATS friendly.
- **Keywords:** However, you are missing key terms from the JD like "Agile" and "CI/CD".

RULES:
- Keep the response SHORT (max 120 words).
- Use bullet points only.
- No long explanations.

Context Retrieved:
{context}

User Question:
{prompt}
"""
    else:
        llm_prompt = f"""
SYSTEM MESSAGE: You are an elite Resume Analyzer and Career Advisor, the absolute best in the industry. Your goal is to maximize the user's chances of landing a job by providing hyper-accurate, actionable feedback based on their resume and the job description.

INSTRUCTIONS: Give a detailed, structured, and insightful analysis.

CHAIN OF THOUGHT:
1. Deconstruct the User's Question.
2. Cross-reference the question with the Context Retrieved (resume and JD).
3. Synthesize the findings into structured, categorized sections.
4. Provide actionable advice for improvement.

FEW-SHOT EXAMPLES:
User: How can I improve my experience section?
Assistant: 
### Impact and Metrics
- **Current State:** You list duties rather than achievements.
- **Improvement:** Quantify your impact (e.g., "Increased sales by 15%").
### Action Verbs
- **Current State:** Many bullets start with "Responsible for".
- **Improvement:** Start with strong action verbs like "Spearheaded", "Engineered", or "Optimized".

RULES:
- Use clear Markdown headings.
- Use bullet points.
- Explain thoroughly but clearly under each point.

Context Retrieved:
{context}

User Question:
{prompt}
"""

    def stream_and_save():
        full_response = ""
        try:
            response = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=llm_prompt
            )
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
        except Exception as e:
            print("Gemini error:", e)
            error_msg = "Sorry, I couldn't generate a response at the moment."
            full_response += error_msg
            yield error_msg
            
        # Save Assistant message to DB (using a new app context)
        with app.app_context():
            bot_msg = Message(session_id=session_id, role="assistant", content=full_response)
            db.session.add(bot_msg)
            db.session.commit()

    return Response(stream_and_save(), mimetype='text/event-stream')


# =========================
# Run App
# =========================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False,
        use_reloader=False
    )
