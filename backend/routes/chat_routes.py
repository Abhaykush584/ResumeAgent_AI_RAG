from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import ChatSession, Message, db

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.created_at.desc()).all()
    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at.isoformat()
        } for s in sessions
    ]), 200

@chat_bp.route('/<session_id>/history', methods=['GET'])
@jwt_required()
def get_history(session_id):
    user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"msg": "Session not found"}), 404
        
    messages = Message.query.filter_by(session_id=session_id).order_by(Message.created_at.asc()).all()
    return jsonify([
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat()
        } for m in messages
    ]), 200

@chat_bp.route('/<session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"msg": "Session not found"}), 404
        
    from models import ResumeMetadata, ResumeAnalysis
    ResumeAnalysis.query.filter_by(session_id=session_id).delete()
    ResumeMetadata.query.filter_by(session_id=session_id).delete()

    db.session.delete(session)
    db.session.commit()
    return jsonify({"msg": "Session deleted successfully"}), 200
