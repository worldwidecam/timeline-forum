from extensions.db import db
from datetime import datetime

class UserMusic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    music_url = db.Column(db.String(500), nullable=True)
    music_platform = db.Column(db.String(20), nullable=True)  # 'youtube', 'soundcloud', or 'spotify'
    created_at = db.Column(db.DateTime, default=datetime.now())
    updated_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now())