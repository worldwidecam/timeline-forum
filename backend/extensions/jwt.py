from flask import jsonify
from flask_jwt_extended import (
    JWTManager,
)

from models.token_blocklist import TokenBlocklist

jwt = JWTManager()


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = TokenBlocklist.query.filter_by(jti=jti).first()
    return token is not None

@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Missing or invalid authentication token',
        'details': str(error)
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Invalid authentication token format or signature',
        'details': str(error)
    }), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Authentication token has expired. Please refresh your token or login again.',
        'is_expired': True
    }), 401

@jwt.needs_fresh_token_loader
def token_not_fresh_callback(jwt_header, jwt_data):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Fresh token required. Please login again.'
    }), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_data):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Token has been revoked. Please login again.'
    }), 401