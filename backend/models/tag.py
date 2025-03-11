from extensions.db import db
from datetime import datetime

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'), nullable=True)

    def __repr__(self):
        return f'<Tag {self.name}>'