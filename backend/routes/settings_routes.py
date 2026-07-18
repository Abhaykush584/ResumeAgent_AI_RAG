from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    return jsonify({
        "theme": "dark",
        "llmModel": "gemini-1.5-flash",
        "temperature": 0.7,
        "chunkSize": 1000
    }), 200

@settings_bp.route('/', methods=['PUT'])
@jwt_required()
def update_settings():
    data = request.get_json()
    return jsonify({"msg": "Settings updated successfully", "settings": data}), 200
