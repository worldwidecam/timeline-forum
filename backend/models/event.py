from extensions.db import db
from datetime import datetime

# Event-Tag Association Table
event_tags = db.Table('event_tags',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
    db.Column('created_at', db.DateTime, default=datetime.now)
)

# Event-Timeline Reference Table (for events referenced in multiple timelines)
event_timeline_refs = db.Table('event_timeline_refs',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
    db.Column('timeline_id', db.Integer, db.ForeignKey('timeline.id')),
    db.Column('created_at', db.DateTime, default=datetime.now)
)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True, default='')
    event_date = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.String(50), nullable=False, default='remark')
    url = db.Column(db.String(500), nullable=True)
    url_title = db.Column(db.String(500), nullable=True)
    url_description = db.Column(db.Text, nullable=True)
    url_image = db.Column(db.String(500), nullable=True)
    media_url = db.Column(db.String(500), nullable=True)
    media_type = db.Column(db.String(50), nullable=True)
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    tags = db.relationship('Tag', secondary=event_tags, backref=db.backref('events', lazy='dynamic'))
    referenced_in = db.relationship('Timeline', secondary=event_timeline_refs, backref=db.backref('referenced_events', lazy='dynamic'))

    def __repr__(self):
        return f'<Event {self.title}>'
    