from flask import jsonify, request
from backend.app import app
from extensions.db import db
from models.timeline import Timeline


@app.route('/api/timeline', methods=['POST'])
def create_timeline():
    data = request.get_json()
    new_timeline = Timeline(
        name=data['name'],
        description=data['description'],
        created_by=1  # Temporary default user ID
    )
    db.session.add(new_timeline)
    db.session.commit()
    return jsonify({'message': 'Timeline created successfully', 'id': new_timeline.id}), 201