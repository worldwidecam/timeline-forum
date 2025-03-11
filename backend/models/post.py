from extensions.db import db
from datetime import datetime

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)
    url = db.Column(db.String(500))
    url_title = db.Column(db.String(500))
    url_description = db.Column(db.Text)
    url_image = db.Column(db.String(500))
    image = db.Column(db.String(500))  # New field for uploaded images
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now())
    upvotes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy=True)
    promoted_to_event = db.Column(db.Boolean, default=False)
    promotion_score = db.Column(db.Float, default=0.0)
    source_count = db.Column(db.Integer, default=0)
    promotion_votes = db.Column(db.Integer, default=0)

    def update_promotion_score(self):
        """
        Updates the promotion score of a post and determines if it should be promoted to timeline view.
        
        Note: This promotion system may be updated in the future to implement a new visual spacing
        system where promoted events will take up visual space according to their correlated marker
        spacing in the timeline. This will provide a more integrated and visually consistent
        experience between posts and their timeline representations.
        """
        # Calculate base score from votes and sources
        base_score = (self.promotion_votes * 0.7) + (self.source_count * 0.3)
        
        # Apply time decay factor (posts older than 7 days get penalized)
        days_old = (datetime.now() - self.created_at).days
        time_factor = 1.0 if days_old <= 7 else (1.0 - (0.1 * (days_old - 7)))
        time_factor = max(0.1, time_factor)  # Don't let it go below 0.1
        
        # Calculate final score
        self.promotion_score = base_score * time_factor
        
        # Determine if post should be promoted based on score threshold
        # This threshold might need tuning based on usage patterns
        PROMOTION_THRESHOLD = 5.0
        self.promoted_to_event = self.promotion_score >= PROMOTION_THRESHOLD
        
        return self.promotion_score