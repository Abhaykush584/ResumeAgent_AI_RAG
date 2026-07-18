from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import ResumeMetadata, ChatSession
from extensions import db
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    user_id = get_jwt_identity()
    
    total_resumes = ResumeMetadata.query.join(ChatSession).filter(ChatSession.user_id == user_id).count()
    total_chats = ChatSession.query.filter_by(user_id=user_id).count()
    
    avg_score = db.session.query(func.avg(ResumeMetadata.score)).join(ChatSession).filter(ChatSession.user_id == user_id).scalar() or 0
    avg_ats = db.session.query(func.avg(ResumeMetadata.ats_score)).join(ChatSession).filter(ChatSession.user_id == user_id).scalar() or 0

    return jsonify({
        "totalResumes": total_resumes,
        "totalChats": total_chats,
        "avgScore": round(avg_score, 1),
        "avgAtsScore": round(avg_ats, 1)
    }), 200
