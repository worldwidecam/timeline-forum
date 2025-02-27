from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt, decode_token,
    set_access_cookies, set_refresh_cookies, unset_jwt_cookies,
    verify_jwt_in_request
)
from flask_cors import CORS
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Basic configurations
app.config.update(
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL').replace('postgres://', 'postgresql://') if os.getenv('DATABASE_URL') else 'sqlite:///timeline_forum.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'your-secret-key'),  # Change this in production
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=4),  # Increased from 1 hour to 4 hours
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),  # 30 days refresh token
    JWT_TOKEN_LOCATION=['headers'],
    JWT_HEADER_NAME='Authorization',
    JWT_HEADER_TYPE='Bearer'
)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Ensure the database exists
with app.app_context():
    db.create_all()

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Refresh-Token"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# Configure upload paths
base_dir = os.path.abspath(os.path.dirname(__file__))
app.config['UPLOAD_FOLDER'] = os.path.join(base_dir, 'static', 'uploads')
app.config['STATIC_FOLDER'] = os.path.join(base_dir, 'static')

# Create necessary directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['STATIC_FOLDER'], exist_ok=True)

# File upload configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_audio_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS

# Models
class UserMusic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    music_url = db.Column(db.String(500), nullable=True)
    music_platform = db.Column(db.String(20), nullable=True)  # 'youtube', 'soundcloud', or 'spotify'
    created_at = db.Column(db.DateTime, default=datetime.now())
    updated_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now())

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.now())
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(200), nullable=True)
    music = db.relationship('UserMusic', backref='user', uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Timeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now())

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

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'), nullable=True)

    def __repr__(self):
        return f'<Tag {self.name}>'

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

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now())
    updated_at = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now())

class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# JWT Configuration
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

# Routes
@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        logger.info("Starting file upload process")
        logger.info(f"Request files: {request.files}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Generate secure filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        # Save file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logger.info(f"Saving file to: {file_path}")
        file.save(file_path)
        
        # Generate URL
        file_url = f'/static/uploads/{filename}'
        logger.info(f"File saved successfully. URL: {file_url}")
        
        return jsonify({
            'url': file_url,
            'filename': filename
        })
    
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/static/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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

@app.route('/api/timeline/<int:timeline_id>', methods=['GET'])
def get_timeline(timeline_id):
    timeline = Timeline.query.get_or_404(timeline_id)
    return jsonify({
        'id': timeline.id,
        'name': timeline.name,
        'description': timeline.description,
        'created_by': timeline.created_by,
        'created_at': timeline.created_at.isoformat()
    })

@app.route('/api/timeline/<int:timeline_id>/posts', methods=['GET'])
def get_timeline_posts(timeline_id):
    posts = Post.query.filter_by(timeline_id=timeline_id).order_by(Post.event_date.desc()).all()
    return jsonify([{
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'event_date': post.event_date.isoformat(),
        'url': post.url,
        'url_title': post.url_title,
        'url_description': post.url_description,
        'url_image': post.url_image,
        'image': post.image,
        'created_by': post.created_by,
        'created_at': post.created_at.isoformat(),
        'upvotes': post.upvotes,
        'username': User.query.get(post.created_by).username,
        'display_type': post.display_type
    } for post in posts])

@app.route('/api/timeline/<int:timeline_id>/posts', methods=['POST'])
def create_post(timeline_id):
    try:
        data = request.get_json()
        print(f"Received post data: {data}")  # Debug log
        
        if not all(key in data for key in ['title', 'content', 'event_date']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        new_post = Post(
            title=data['title'],
            content=data['content'],
            event_date=datetime.fromisoformat(data['event_date']),
            url=data.get('url', ''),
            timeline_id=timeline_id,
            created_by=1  # Temporary default user ID
        )
        
        if new_post.url:
            try:
                link_preview = get_link_preview(new_post.url)
                new_post.url_title = link_preview['url_title']
                new_post.url_description = link_preview['url_description']
                new_post.url_image = link_preview['url_image']
            except Exception as preview_error:
                print(f"Error fetching link preview: {str(preview_error)}")
                # Continue without link preview if it fails
                pass
        
        db.session.add(new_post)
        db.session.commit()
        
        user = User.query.get(1)  # Temporary default user ID
        
        return jsonify({
            'id': new_post.id,
            'title': new_post.title,
            'content': new_post.content,
            'event_date': new_post.event_date.isoformat(),
            'url': new_post.url,
            'url_title': new_post.url_title,
            'url_description': new_post.url_description,
            'url_image': new_post.url_image,
            'created_by': new_post.created_by,
            'created_at': new_post.created_at.isoformat(),
            'upvotes': new_post.upvotes,
            'username': user.username
        }), 201
    except Exception as e:
        print(f"Error creating post: {str(e)}")  # Debug log
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post_without_timeline():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        title = data.get('title')
        content = data.get('content')
        date_str = data.get('date')
        url = data.get('url')
        tags = data.get('tags', [])
        image = data.get('image')  # Get the image URL from the request

        if not all([title, content, date_str]):
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            event_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

        # Create new post
        new_post = Post(
            title=title,
            content=content,
            event_date=event_date,
            created_by=current_user_id,
            url=url,
            image=image  # Add the image URL to the post
        )

        # If URL is provided, fetch preview data
        if url:
            preview_data = get_link_preview(url)
            if preview_data:
                new_post.url_title = preview_data.get('title')
                new_post.url_description = preview_data.get('description')
                new_post.url_image = preview_data.get('image')

        db.session.add(new_post)
        db.session.commit()

        # Add tags
        for tag_name in tags:
            tag = Tag.query.filter_by(name=tag_name.lower()).first()
            if not tag:
                tag = Tag(name=tag_name.lower())
                db.session.add(tag)
            
            post_tag = PostTag(post_id=new_post.id, tag_id=tag.id)
            db.session.add(post_tag)

        db.session.commit()

        return jsonify({
            'message': 'Post created successfully',
            'post_id': new_post.id
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts', methods=['GET'])
def get_all_posts():
    try:
        # Get query parameters for pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_by = request.args.get('sort', 'newest')  # 'newest', 'popular', 'promoted'

        # Base query with joins to get timeline and user information
        query = db.session.query(Post, Timeline, User)\
            .join(Timeline, Post.timeline_id == Timeline.id)\
            .join(User, Post.created_by == User.id)

        # Apply sorting
        if sort_by == 'newest':
            query = query.order_by(Post.created_at.desc())
        elif sort_by == 'popular':
            query = query.order_by(Post.upvotes.desc())
        elif sort_by == 'promoted':
            query = query.order_by(Post.promotion_score.desc())

        # Execute paginated query
        paginated_posts = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format the response
        posts = []
        for post, timeline, user in paginated_posts.items:
            posts.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'event_date': post.event_date.isoformat(),
                'created_at': post.created_at.isoformat(),
                'upvotes': post.upvotes,
                'url': post.url,
                'url_title': post.url_title,
                'url_description': post.url_description,
                'url_image': post.url_image,
                'timeline': {
                    'id': timeline.id,
                    'name': timeline.name,
                },
                'author': {
                    'id': user.id,
                    'username': user.username,
                    'avatar_url': user.avatar_url
                },
                'comment_count': len(post.comments)
            })

        return jsonify({
            'posts': posts,
            'total': paginated_posts.total,
            'pages': paginated_posts.pages,
            'current_page': page,
            'has_next': paginated_posts.has_next,
            'has_prev': paginated_posts.has_prev
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/timeline/<int:timeline_id>/check-promotions', methods=['POST'])
def check_timeline_promotions(timeline_id):
    try:
        # Get timeline's posts ordered by promotion score
        top_posts = Post.query.filter_by(
            timeline_id=timeline_id,
            promoted_to_event=False
        ).order_by(Post.promotion_score.desc()).limit(5).all()

        promoted_posts = []
        for post in top_posts:
            # Update the post's promotion score
            current_score = post.update_promotion_score()
            
            # Check if post meets promotion criteria
            if current_score >= 50:  # Base threshold
                # Create a new event from the post
                new_post = Post(
                    title=post.title,
                    description=post.content,
                    event_date=post.event_date,
                    url=post.url,
                    url_title=post.url_title,
                    url_description=post.url_description,
                    url_image=post.url_image,
                    timeline_id=timeline_id,
                    created_by=post.created_by,
                    created_at=datetime.now(),
                    upvotes=post.upvotes
                )
                
                # Mark post as promoted
                post.promoted_to_event = True
                promoted_posts.append(post.id)
                
                db.session.add(new_post)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'promoted_posts': promoted_posts,
            'message': f'Promoted {len(promoted_posts)} posts to timeline events'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/post/<int:post_id>/promote-vote', methods=['POST'])
def vote_for_promotion(post_id):
    try:
        post = Post.query.get_or_404(post_id)
        post.promotion_votes += 1
        post.update_promotion_score()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'new_score': post.promotion_score
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/profile/music', methods=['POST'])
@jwt_required()
def update_music_preferences():
    try:
        current_user_id = int(get_jwt_identity())
        app.logger.info(f'Updating music preferences for user {current_user_id}')
        
        user = User.query.get(current_user_id)
        if not user:
            app.logger.error(f'User {current_user_id} not found')
            return jsonify({'error': 'User not found'}), 404

        if 'music' not in request.files:
            return jsonify({'error': 'No music file provided'}), 400
            
        file = request.files['music']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_audio_file(file.filename):
            # Delete old music file if it exists
            if user.music and user.music.music_url:
                old_file = user.music.music_url.split('/')[-1]
                old_file_path = os.path.join(app.config['UPLOAD_FOLDER'], old_file)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            # Save new music file
            filename = secure_filename(f'music_{current_user_id}_{int(time.time())}.{file.filename.rsplit(".", 1)[1].lower()}')
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Update or create music preferences
            music_prefs = user.music
            if not music_prefs:
                music_prefs = UserMusic(user_id=user.id)
                db.session.add(music_prefs)
            
            music_prefs.music_url = f'http://localhost:5000/static/uploads/{filename}'
            
            db.session.commit()
            app.logger.info('Music preferences updated successfully')
            
            return jsonify({
                'music_url': music_prefs.music_url
            })
        else:
            return jsonify({'error': 'Invalid file type. Please upload an MP3, WAV, or OGG file'}), 400
            
    except Exception as e:
        app.logger.error(f'Error updating music preferences: {str(e)}')
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile/music', methods=['GET'])
@jwt_required()
def get_music_preferences():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        music_prefs = user.music
        if not music_prefs:
            return jsonify({
                'music_url': None,
                'music_platform': None
            })
            
        return jsonify({
            'music_url': music_prefs.music_url,
            'music_platform': music_prefs.music_platform
        })
        
    except Exception as e:
        app.logger.error(f'Error getting music preferences: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/timelines/<int:timeline_id>', methods=['DELETE'])
@jwt_required()
def delete_timeline(timeline_id):
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        
        # Only allow admin (user_id 1) to delete timelines
        if current_user_id != 1:
            return jsonify({'error': 'Unauthorized. Only admin can delete timelines'}), 403
            
        timeline = Timeline.query.get_or_404(timeline_id)
        
        # Don't allow deletion of the general timeline
        if timeline.name == 'general':
            return jsonify({'error': 'Cannot delete the general timeline'}), 400
            
        # Get all posts associated with this timeline
        posts = Post.query.filter_by(timeline_id=timeline_id).all()
        
        # Move posts to general timeline
        general_timeline = Timeline.query.filter(
            func.lower(Timeline.name) == 'general'
        ).first()
        
        if not general_timeline:
            general_timeline = Timeline(
                name='general',
                description='General timeline for uncategorized posts',
                created_by=1
            )
            db.session.add(general_timeline)
            db.session.commit()
        
        # Move posts to general timeline
        for post in posts:
            post.timeline_id = general_timeline.id
        
        # Delete the timeline
        db.session.delete(timeline)
        db.session.commit()
        
        return jsonify({
            'message': f'Timeline {timeline.name} deleted successfully. All posts moved to general timeline.'
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error deleting timeline: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/timelines/merge', methods=['POST'])
@jwt_required()
def merge_timelines():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        
        # Only allow admin (user_id 1) to merge timelines
        if current_user_id != 1:
            return jsonify({'error': 'Unauthorized. Only admin can merge timelines'}), 403
            
        data = request.get_json()
        if not all(key in data for key in ['source_id', 'target_id']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        source_timeline = Timeline.query.get_or_404(data['source_id'])
        target_timeline = Timeline.query.get_or_404(data['target_id'])
        
        # Don't allow merging if source is general timeline
        if source_timeline.name == 'general':
            return jsonify({'error': 'Cannot merge general timeline into another timeline'}), 400
            
        # Move all posts from source to target timeline
        Post.query.filter_by(timeline_id=source_timeline.id).update({'timeline_id': target_timeline.id})
        
        # Delete the source timeline
        db.session.delete(source_timeline)
        db.session.commit()
        
        return jsonify({
            'message': f'Timeline {source_timeline.name} merged into {target_timeline.name} successfully'
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error merging timelines: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    logger.info(f"Received registration request with data: {data}")
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        error_msg = f"Missing required fields: {', '.join(missing_fields)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400
        
    # Validate email format
    if not '@' in data['email']:
        error_msg = "Invalid email format"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400
        
    # Check if username or email already exists
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        error_msg = "Username already taken"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400
        
    existing_email = User.query.filter_by(email=data['email']).first()
    if existing_email:
        error_msg = "Email already registered"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400
    
    try:
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        logger.info(f"Successfully registered user: {user.username}")
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        error_msg = f"Database error during registration: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logger.info(f"Login attempt for email: {data.get('email', 'not provided')}")

        # Validate required fields
        if not all(k in data for k in ['email', 'password']):
            error_msg = 'Missing email or password'
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user:
            error_msg = 'User not found'
            logger.error(f"Login failed: {error_msg}")
            return jsonify({'error': error_msg}), 401

        if not user.check_password(data['password']):
            error_msg = 'Invalid password'
            logger.error(f"Login failed: {error_msg}")
            return jsonify({'error': error_msg}), 401

        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        logger.info(f"Login successful for user: {user.username}")
        
        # Return consistent response structure
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'avatar_url': user.avatar_url,
            'bio': user.bio
        }), 200

    except Exception as e:
        error_msg = f"Login error: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 500

@app.route('/api/auth/refresh', methods=['POST'])
def refresh():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Invalid refresh token format'}), 401

        refresh_token = auth_header.split(' ')[1]
        try:
            # Use verify_jwt_in_request with refresh=True to properly validate the token
            verify_jwt_in_request(refresh=True)
            current_user_id = get_jwt_identity()
            
            # Get user and create new access token
            user = User.query.get(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404

            access_token = create_access_token(identity=current_user_id)
            return jsonify({
                'access_token': access_token
            }), 200
        except Exception as e:
            logger.error(f"Invalid refresh token: {str(e)}")
            return jsonify({'error': 'Invalid refresh token'}), 401
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return jsonify({'error': 'Failed to refresh token'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        user_id = get_jwt_identity()
        
        token_block = TokenBlocklist(jti=jti, user_id=user_id)
        db.session.add(token_block)
        db.session.commit()
        
        return jsonify({'message': 'Successfully logged out'}), 200
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to logout'}), 500

@app.route('/api/auth/validate', methods=['POST'])
@jwt_required()
def validate_token():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({
            'valid': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        }), 200
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return jsonify({'error': 'Failed to validate token'}), 500

@app.route('/api/profile/update', methods=['POST'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Handle file upload
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f'avatar_{current_user_id}_{int(time.time())}.{ext}'
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                user.avatar_url = f'/uploads/{filename}'

        # Update other fields
        form_data = request.form
        
        if 'username' in form_data and form_data['username'] != user.username:
            if User.query.filter_by(username=form_data['username']).first():
                return jsonify({'error': 'Username already taken'}), 400
            user.username = form_data['username']
            
        if 'email' in form_data and form_data['email'] != user.email:
            if User.query.filter_by(email=form_data['email']).first():
                return jsonify({'error': 'Email already taken'}), 400
            user.email = form_data['email']
            
        if 'bio' in form_data:
            user.bio = form_data['bio']

        db.session.commit()
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar_url': user.avatar_url,
            'bio': user.bio
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@app.route('/api/timeline-v3', methods=['GET'])
def get_timelines_v3():
    try:
        timelines = Timeline.query.order_by(Timeline.created_at.desc()).all()
        return jsonify([{
            'id': timeline.id,
            'name': timeline.name,
            'description': timeline.description,
            'created_at': timeline.created_at.isoformat()
        } for timeline in timelines])
        
    except Exception as e:
        app.logger.error(f'Error fetching timelines: {str(e)}')
        return jsonify({'error': 'Failed to fetch timelines'}), 500

@app.route('/api/timeline-v3', methods=['POST'])
@jwt_required()
def create_timeline_v3():
    try:
        # Get the current user's ID from the JWT token
        current_user_id = get_jwt_identity()
        logger.info(f"Creating timeline for user ID: {current_user_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        if not data.get('name'):
            return jsonify({'error': 'Timeline name is required'}), 400
            
        # Check if a timeline with this name already exists for the user
        existing_timeline = Timeline.query.filter_by(
            name=data['name'],
            created_by=current_user_id
        ).first()
        
        if existing_timeline:
            return jsonify({'error': 'You already have a timeline with this name'}), 400
            
        new_timeline = Timeline(
            name=data['name'],
            description=data.get('description', ''),
            created_by=current_user_id
        )
        
        db.session.add(new_timeline)
        db.session.commit()
        
        logger.info(f"Timeline created successfully: {new_timeline.id}")
        
        return jsonify({
            'id': new_timeline.id,
            'name': new_timeline.name,
            'description': new_timeline.description,
            'created_at': new_timeline.created_at.isoformat()
        }), 201
        
    except Exception as e:
        error_msg = f"Failed to create timeline: {str(e)}"
        logger.error(error_msg)
        db.session.rollback()
        return jsonify({'error': error_msg}), 500

@app.route('/api/timeline-v3/<int:timeline_id>', methods=['GET'])
def get_timeline_v3(timeline_id):
    try:
        timeline = Timeline.query.get_or_404(timeline_id)
        return jsonify({
            'id': timeline.id,
            'name': timeline.name,
            'description': timeline.description,
            'created_by': timeline.created_by,
            'created_at': timeline.created_at.isoformat()
        })
    except Exception as e:
        app.logger.error(f'Error fetching timeline: {str(e)}')
        return jsonify({'error': 'Failed to fetch timeline'}), 500

@app.route('/api/timeline-v3/<timeline_id>/events', methods=['GET'])
def get_timeline_v3_events(timeline_id):
    try:
        app.logger.info(f'Getting events for timeline {timeline_id}')
        # Get events that are directly in this timeline
        direct_events = Event.query.filter_by(timeline_id=timeline_id).all()
        
        # Get the timeline
        timeline = Timeline.query.get(timeline_id)
        if not timeline:
            return jsonify({'error': 'Timeline not found'}), 404
            
        # Get events that reference this timeline
        referenced_events = timeline.referenced_events.all()
        
        # Combine both sets of events
        events = list(set(direct_events + referenced_events))
        
        # Sort events by date
        events.sort(key=lambda x: x.event_date)
        
        return jsonify([{
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'event_date': event.event_date.isoformat(),
            'type': event.type,
            'url': event.url,
            'url_title': event.url_title,
            'url_description': event.url_description,
            'url_image': event.url_image,
            'media_url': event.media_url,
            'media_type': event.media_type,
            'created_by': event.created_by,
            'created_at': event.created_at.isoformat(),
            'tags': [{'id': tag.id, 'name': tag.name} for tag in event.tags]
        } for event in events])
    except Exception as e:
        app.logger.error(f'Error getting events: {str(e)}')
        return jsonify({'error': 'Failed to get events'}), 500

@app.route('/api/timeline-v3/<timeline_id>/events', methods=['POST'])
def create_timeline_v3_event(timeline_id):
    try:
        # Get JSON data from request
        data = request.json
        app.logger.info(f'Creating event with data: {data}')
        
        # Validate required fields
        if not all(key in data for key in ['title', 'event_date', 'type']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Parse the event date from ISO format
        try:
            # Accept the date string exactly as provided by the frontend
            # This preserves the user's input without any timezone adjustments
            event_date_str = data['event_date'].replace('Z', '+00:00')
            event_date = datetime.fromisoformat(event_date_str)
            
            app.logger.info(f'Original event_date: {event_date}')
            
            # Log timezone information if provided (for debugging only)
            if 'timezone_offset' in data:
                app.logger.info(f'Timezone offset (minutes): {data["timezone_offset"]}')
                app.logger.info(f'Timezone name: {data.get("timezone_name", "Unknown")}')
            
            # Use created_at as provided or current time
            if 'created_at' in data:
                created_at_str = data['created_at'].replace('Z', '+00:00')
                created_at = datetime.fromisoformat(created_at_str)
                app.logger.info(f'Original created_at: {created_at}')
            else:
                created_at = datetime.now()
                
            app.logger.info(f'Parsed event date: {event_date}')
            app.logger.info(f'Final created_at: {created_at}')
        except ValueError as e:
            app.logger.error(f'Date parsing error: {str(e)}')
            return jsonify({'error': 'Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
        
        # Create the event with required fields
        new_event = Event(
            title=data['title'],
            description=data.get('description', ''),
            event_date=event_date,
            type=data['type'],
            timeline_id=timeline_id,
            created_by=1,  # Temporary default user ID
            created_at=created_at  # Use the adjusted created_at time
        )
        
        # Handle optional URL data
        if 'url' in data and data['url']:
            new_event.url = data['url']
            new_event.url_title = data.get('url_title', '')
            new_event.url_description = data.get('url_description', '')
            new_event.url_image = data.get('url_image', '')
        
        # Handle optional media data
        if 'media_url' in data and data['media_url']:
            new_event.media_url = data['media_url']
            new_event.media_type = data.get('media_type', '')
            
        # Handle tags
        if 'tags' in data and data['tags']:
            for tag_name in data['tags']:
                # Clean tag name
                tag_name = tag_name.strip().lower()
                if not tag_name:
                    continue
                    
                # Find or create tag
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    # Create new tag
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                    
                    # Create a new timeline for this tag if it doesn't exist
                    tag_timeline = Timeline.query.filter_by(name=f"#{tag_name}").first()
                    if not tag_timeline:
                        tag_timeline = Timeline(
                            name=f"#{tag_name}",
                            description=f"Timeline for #{tag_name}",
                            created_by=1  # Temporary default user ID
                        )
                        db.session.add(tag_timeline)
                        db.session.flush()  # Get the timeline ID
                        tag.timeline_id = tag_timeline.id

                        # Add this event as a reference in the new timeline
                        new_event.referenced_in.append(tag_timeline)
                
                new_event.tags.append(tag)
        
        app.logger.info('Attempting to save event to database')
        try:
            db.session.add(new_event)
            db.session.commit()
            app.logger.info('Event saved successfully')
            
            # Prepare tags for response
            tag_list = [{'id': tag.id, 'name': tag.name} for tag in new_event.tags]
            
            return jsonify({
                'id': new_event.id,
                'title': new_event.title,
                'description': new_event.description,
                'event_date': new_event.event_date.isoformat(),
                'type': new_event.type,
                'url': new_event.url,
                'url_title': new_event.url_title,
                'url_description': new_event.url_description,
                'url_image': new_event.url_image,
                'media_url': new_event.media_url,
                'media_type': new_event.media_type,
                'created_by': new_event.created_by,
                'created_at': new_event.created_at.isoformat(),
                'tags': tag_list
            }), 201
            
        except Exception as db_error:
            db.session.rollback()
            app.logger.error(f'Database error while saving event: {str(db_error)}')
            return jsonify({'error': f'Database error: {str(db_error)}'}), 500
            
    except Exception as e:
        app.logger.error(f'Error creating event: {str(e)}')
        return jsonify({'error': f'Failed to save event: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
