from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import ResumeAnalysis, ResumeMetadata, ChatSession
from extensions import db
import json

analysis_bp = Blueprint('analysis_routes', __name__, url_prefix='/api/analysis')

@analysis_bp.route('/latest', methods=['GET'])
@jwt_required()
def get_latest_analysis():
    user_id = get_jwt_identity()
    
    # Find the most recent analysis for this user
    analysis = ResumeAnalysis.query.filter_by(user_id=user_id).order_by(ResumeAnalysis.created_at.desc()).first()
    
    if not analysis:
        return jsonify({"has_analysis": False}), 200
        
    return jsonify({
        "has_analysis": True,
        "id": analysis.id,
        "overall_score": analysis.overall_score,
        "ats_score": analysis.ats_score,
        "keyword_match": analysis.keyword_match,
        "skills_found": analysis.skills_found,
        "missing_skills": analysis.missing_skills,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "improvement_suggestions": analysis.improvement_suggestions,
        "experience_summary": analysis.experience_summary,
        "education_summary": analysis.education_summary,
        "projects_summary": analysis.projects_summary,
        "created_at": analysis.created_at.isoformat()
    }), 200

@analysis_bp.route('/session/<session_id>', methods=['GET'])
@jwt_required()
def get_session_analysis(session_id):
    user_id = get_jwt_identity()
    
    analysis = ResumeAnalysis.query.filter_by(user_id=user_id, session_id=session_id).first()
    
    if not analysis:
        return jsonify({"has_analysis": False}), 200
        
    return jsonify({
        "has_analysis": True,
        "id": analysis.id,
        "overall_score": analysis.overall_score,
        "ats_score": analysis.ats_score,
        "keyword_match": analysis.keyword_match,
        "skills_found": analysis.skills_found,
        "missing_skills": analysis.missing_skills,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "improvement_suggestions": analysis.improvement_suggestions,
        "experience_summary": analysis.experience_summary,
        "education_summary": analysis.education_summary,
        "projects_summary": analysis.projects_summary,
        "created_at": analysis.created_at.isoformat()
    }), 200

@analysis_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    
    # Calculate stats
    analyses = ResumeAnalysis.query.filter_by(user_id=user_id).all()
    total_resumes = len(analyses)
    
    avg_ats = 0
    if total_resumes > 0:
        total_ats = sum((a.ats_score or 0) for a in analyses)
        avg_ats = round(total_ats / total_resumes)
        
    total_chats = ChatSession.query.filter_by(user_id=user_id).count()
    
    latest_resume = None
    if analyses:
        latest = sorted(analyses, key=lambda x: x.created_at, reverse=True)[0]
        meta = ResumeMetadata.query.get(latest.resume_id) if latest.resume_id else None
        if meta:
            latest_resume = {
                "filename": meta.filename,
                "uploaded_at": meta.uploaded_at.isoformat(),
                "ats_score": latest.ats_score
            }
            
    return jsonify({
        "total_resumes": total_resumes,
        "avg_ats_score": avg_ats,
        "total_chats": total_chats,
        "latest_resume": latest_resume
    }), 200
