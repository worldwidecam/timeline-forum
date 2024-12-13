from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, timezone
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///timeline_forum.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Timeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    url = db.Column(db.String(500))  # Add URL field
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    upvotes = db.Column(db.Integer, default=0)

# Routes
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

@app.route('/api/timeline/<int:timeline_id>/event', methods=['POST'])
def create_event(timeline_id):
    try:
        data = request.get_json()
        print(f"Received event data: {data}")  # Debug log
        
        if not all(key in data for key in ['title', 'content', 'event_date']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        new_event = Event(
            title=data['title'],
            content=data['content'],
            event_date=datetime.fromisoformat(data['event_date']),
            url=data.get('url', ''),  # Add URL handling
            timeline_id=timeline_id,
            created_by=1  # Temporary default user ID
        )
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({
            'message': 'Event created successfully',
            'event': {
                'id': new_event.id,
                'title': new_event.title,
                'content': new_event.content,
                'event_date': new_event.event_date.isoformat(),
                'url': new_event.url,  # Include URL in response
                'timeline_id': new_event.timeline_id
            }
        }), 201
    except Exception as e:
        print(f"Error creating event: {str(e)}")  # Debug log
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/timeline/<int:timeline_id>/events', methods=['GET'])
def get_timeline_events(timeline_id):
    events = Event.query.filter_by(timeline_id=timeline_id).order_by(Event.event_date).all()
    return jsonify([{
        'id': event.id,
        'title': event.title,
        'content': event.content,
        'event_date': event.event_date.isoformat(),
        'url': event.url,  # Include URL in response
        'upvotes': event.upvotes
    } for event in events])

@app.route('/api/timelines', methods=['GET'])
def get_timelines():
    timelines = Timeline.query.all()
    return jsonify([{
        'id': timeline.id,
        'name': timeline.name,
        'description': timeline.description
    } for timeline in timelines])

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()  # Drop all existing tables
        db.create_all()  # Create new tables with updated schema
    app.run(debug=True)
