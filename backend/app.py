from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS, cross_origin
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename
import requests
from bs4 import BeautifulSoup
import re
import time
from sqlalchemy import func, desc
import logging

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///timeline_forum.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Tokens don't expire

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# File upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Serve static files
@app.route('/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_audio_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'mp3', 'wav', 'ogg'}

def get_favicon_url(url, soup):
    try:
        # Try different favicon possibilities
        favicon = (
            soup.find('link', rel='icon') or
            soup.find('link', rel='shortcut icon') or
            soup.find('link', rel='apple-touch-icon')
        )
        if favicon and favicon.get('href'):
            favicon_url = favicon['href']
            if not bool(urlparse(favicon_url).netloc):
                base_url = '{uri.scheme}://{uri.netloc}'.format(uri=urlparse(url))
                favicon_url = base_url + favicon_url if favicon_url.startswith('/') else base_url + '/' + favicon_url
            return favicon_url
        
        # If no favicon found in HTML, try the default /favicon.ico location
        base_url = '{uri.scheme}://{uri.netloc}'.format(uri=urlparse(url))
        return f"{base_url}/favicon.ico"
    except:
        return None

def get_link_preview(url):
    try:
        # Special handling for different platforms
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()

        # YouTube and YouTube Music
        if 'youtube.com' in domain or 'youtu.be' in domain:
            video_id = None
            if 'watch?v=' in url:
                video_id = url.split('watch?v=')[1].split('&')[0]
            elif 'youtu.be/' in url:
                video_id = url.split('youtu.be/')[1].split('?')[0]
            
            if video_id:
                return {
                    'url_title': 'YouTube Video',
                    'url_description': 'Click to watch on YouTube',
                    'url_image': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'
                }

        # Spotify
        elif 'spotify.com' in domain:
            if '/track/' in url or '/album/' in url or '/playlist/' in url or '/artist/' in url:
                spotify_id = url.split('/')[-1].split('?')[0]
                content_type = 'track' if '/track/' in url else 'album' if '/album/' in url else 'playlist' if '/playlist/' in url else 'artist'
                return {
                    'url_title': f'Spotify {content_type.title()}',
                    'url_description': f'Click to listen on Spotify',
                    'url_image': 'https://developer.spotify.com/images/guidelines/design/icon3@2x.png'  # Spotify logo as fallback
                }

        # Twitter/X
        elif 'twitter.com' in domain or 'x.com' in domain:
            return {
                'url_title': 'Twitter Post',
                'url_description': 'Click to view on Twitter',
                'url_image': 'https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png'
            }

        # Instagram
        elif 'instagram.com' in domain:
            return {
                'url_title': 'Instagram Post',
                'url_description': 'Click to view on Instagram',
                'url_image': 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png'
            }

        # TikTok
        elif 'tiktok.com' in domain:
            return {
                'url_title': 'TikTok Video',
                'url_description': 'Click to watch on TikTok',
                'url_image': 'https://sf16-scmcdn-va.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-dark-e95da587b6efa1520dcd11f4b45c0cf6.svg'
            }

        # Default handling for other URLs
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Try to get OpenGraph metadata first
        title = (
            soup.find('meta', property='og:title') or 
            soup.find('meta', property='twitter:title') or 
            soup.find('title')
        )
        title = title.get('content', '') if title and title.get('content') else title.string if title else ''
        
        description = (
            soup.find('meta', property='og:description') or 
            soup.find('meta', property='twitter:description') or 
            soup.find('meta', attrs={'name': 'description'})
        )
        description = description.get('content', '') if description else ''
        
        image = (
            soup.find('meta', property='og:image') or 
            soup.find('meta', property='twitter:image')
        )
        image = image.get('content', '') if image else ''
        
        # Clean up URLs
        if image and not bool(urlparse(image).netloc):
            base_url = '{uri.scheme}://{uri.netloc}'.format(uri=urlparse(url))
            image = base_url + image if image.startswith('/') else base_url + '/' + image

        # If no image found, try to get favicon
        if not image:
            image = get_favicon_url(url, soup)
            
        return {
            'url_title': title[:500] if title else '',
            'url_description': description[:1000] if description else '',
            'url_image': image[:500] if image else ''
        }
    except Exception as e:
        print(f"Error fetching link preview: {str(e)}")
        # Return domain name and try to get favicon as fallback
        try:
            domain = urlparse(url).netloc
            base_url = '{uri.scheme}://{uri.netloc}'.format(uri=urlparse(url))
            favicon_url = f"{base_url}/favicon.ico"
            return {
                'url_title': domain,
                'url_description': 'Click to visit website',
                'url_image': favicon_url
            }
        except:
            return {
                'url_title': url,
                'url_description': 'Click to visit website',
                'url_image': ''
            }

# Models
class UserMusic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    music_url = db.Column(db.String(500), nullable=True)
    music_platform = db.Column(db.String(20), nullable=True)  # 'youtube', 'soundcloud', or 'spotify'
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
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
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)
    url = db.Column(db.String(500))
    url_title = db.Column(db.String(500))
    url_description = db.Column(db.Text)
    url_image = db.Column(db.String(500))
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    upvotes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy=True)
    promoted_to_event = db.Column(db.Boolean, default=False)
    promotion_score = db.Column(db.Float, default=0.0)
    source_count = db.Column(db.Integer, default=0)
    promotion_votes = db.Column(db.Integer, default=0)
    last_score_update = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    def update_promotion_score(self):
        base_score = self.upvotes
        comment_bonus = len(self.comments) * 0.5
        source_bonus = self.source_count * 2
        content_bonus = min(len(self.content) / 500, 2)
        promotion_bonus = self.promotion_votes * 1.5

        self.promotion_score = base_score + comment_bonus + source_bonus + content_bonus + promotion_bonus
        self.last_score_update = datetime.now(timezone.utc)
        return self.promotion_score

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    url = db.Column(db.String(500))
    url_title = db.Column(db.String(500))
    url_description = db.Column(db.Text)
    url_image = db.Column(db.String(500))
    timeline_id = db.Column(db.Integer, db.ForeignKey('timeline.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    upvotes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='event', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

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

@app.route('/api/timeline/<int:timeline_id>/event', methods=['POST'])
@jwt_required()
def create_event(timeline_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        print(f"Received event data: {data}")  # Debug log
        
        if not all(key in data for key in ['title', 'content', 'event_date']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        new_event = Event(
            title=data['title'],
            content=data['content'],
            event_date=datetime.fromisoformat(data['event_date']),
            url=data.get('url', ''),
            timeline_id=timeline_id,
            created_by=current_user_id
        )
        
        if new_event.url:
            try:
                link_preview = get_link_preview(new_event.url)
                new_event.url_title = link_preview['url_title']
                new_event.url_description = link_preview['url_description']
                new_event.url_image = link_preview['url_image']
            except Exception as preview_error:
                print(f"Error fetching link preview: {str(preview_error)}")
                # Continue without link preview if it fails
                pass
        
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({
            'message': 'Event created successfully',
            'event': {
                'id': new_event.id,
                'title': new_event.title,
                'content': new_event.content,
                'event_date': new_event.event_date.isoformat(),
                'url': new_event.url,
                'url_title': new_event.url_title,
                'url_description': new_event.url_description,
                'url_image': new_event.url_image,
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
        'url': event.url,
        'url_title': event.url_title,
        'url_description': event.url_description,
        'url_image': event.url_image,
        'upvotes': event.upvotes
    } for event in events])

@app.route('/api/timelines', methods=['GET'])
def get_timelines():
    search = request.args.get('search', '').lower()
    if search:
        timelines = Timeline.query.filter(func.lower(Timeline.name).contains(search)).all()
    else:
        timelines = Timeline.query.all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'description': t.description
    } for t in timelines])

@app.route('/api/event/<int:event_id>/comments', methods=['GET'])
def get_event_comments(event_id):
    comments = Comment.query.filter_by(event_id=event_id).order_by(Comment.created_at.desc()).all()
    return jsonify([{
        'id': comment.id,
        'content': comment.content,
        'user_id': comment.user_id,
        'username': User.query.get(comment.user_id).username,
        'created_at': comment.created_at.isoformat(),
        'updated_at': comment.updated_at.isoformat()
    } for comment in comments])

@app.route('/api/event/<int:event_id>/comments', methods=['POST'])
def create_comment(event_id):
    data = request.get_json()
    
    if not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
        
    new_comment = Comment(
        content=data['content'],
        event_id=event_id,
        user_id=1  # Temporary default user ID
    )
    
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify({
        'id': new_comment.id,
        'content': new_comment.content,
        'user_id': new_comment.user_id,
        'created_at': new_comment.created_at.isoformat(),
        'updated_at': new_comment.updated_at.isoformat()
    }), 201

@app.route('/api/comments/<int:comment_id>', methods=['PUT', 'DELETE'])
def manage_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    if request.method == 'DELETE':
        db.session.delete(comment)
        db.session.commit()
        return '', 204
    
    data = request.get_json()
    if not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    
    comment.content = data['content']
    db.session.commit()
    
    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'user_id': comment.user_id,
        'created_at': comment.created_at.isoformat(),
        'updated_at': comment.updated_at.isoformat()
    })

@app.route('/api/user/current', methods=['GET'])
@jwt_required()
def get_current_user():
    # Convert JWT identity to integer for database query
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'bio': user.bio,
        'avatar_url': user.avatar_url,
        'created_at': user.created_at.isoformat()
    })

@app.route('/api/timeline/<int:timeline_id>/posts', methods=['GET'])
def get_timeline_posts(timeline_id):
    posts = Post.query.filter_by(timeline_id=timeline_id).order_by(Post.created_at.desc()).all()
    return jsonify([{
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'event_date': post.event_date.isoformat(),
        'url': post.url,
        'url_title': post.url_title,
        'url_description': post.url_description,
        'url_image': post.url_image,
        'created_by': post.created_by,
        'created_at': post.created_at.isoformat(),
        'upvotes': post.upvotes,
        'username': User.query.get(post.created_by).username
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
def create_post_without_timeline():
    try:
        data = request.get_json()
        print(f"Received post data: {data}")  # Debug log
        
        if not all(key in data for key in ['title', 'content', 'date']):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create timelines from tags if they don't exist
        timelines = []
        if 'tags' in data and data['tags']:
            for tag in data['tags']:
                # Convert tag to lowercase for case-insensitive comparison
                normalized_tag = tag.lower()
                # First try to find an existing timeline with case-insensitive search
                timeline = Timeline.query.filter(func.lower(Timeline.name) == normalized_tag).first()
                if not timeline:
                    timeline = Timeline(
                        name=normalized_tag,  # Store the tag in lowercase
                        description=f"Timeline for {tag}",
                        created_by=1  # Default user ID
                    )
                    db.session.add(timeline)
                    db.session.commit()
                timelines.append(timeline)
        
        # If no tags provided, use or create the default timeline
        if not timelines:
            timeline = Timeline.query.filter_by(name='general').first()  # Use lowercase for consistency
            if not timeline:
                timeline = Timeline(
                    name='general',  # Use lowercase for consistency
                    description='General timeline for uncategorized posts',
                    created_by=1  # Default user ID
                )
                db.session.add(timeline)
                db.session.commit()
            timelines.append(timeline)

        # Create the post
        new_post = Post(
            title=data['title'],
            content=data['content'],
            event_date=datetime.fromisoformat(data['date']),
            url=data.get('url', ''),
            created_by=1,  # Default user ID
            timeline_id=timelines[0].id
        )
        
        if new_post.url:
            try:
                link_preview = get_link_preview(new_post.url)
                new_post.url_title = link_preview.get('url_title')
                new_post.url_description = link_preview.get('url_description')
                new_post.url_image = link_preview.get('url_image')
            except Exception as preview_error:
                print(f"Error fetching link preview: {str(preview_error)}")
                pass
        
        db.session.add(new_post)
        db.session.commit()
        
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
            'timeline': {
                'id': timelines[0].id,
                'name': timelines[0].name
            }
        }), 201
    except Exception as e:
        print(f"Error creating post: {str(e)}")  # Debug log
        db.session.rollback()
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
                'promotion_score': post.promotion_score,
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
                new_event = Event(
                    title=post.title,
                    content=post.content,
                    event_date=post.event_date,
                    url=post.url,
                    url_title=post.url_title,
                    url_description=post.url_description,
                    url_image=post.url_image,
                    timeline_id=timeline_id,
                    created_by=post.created_by,
                    created_at=datetime.now(timezone.utc),
                    upvotes=post.upvotes
                )
                
                # Mark post as promoted
                post.promoted_to_event = True
                promoted_posts.append(post.id)
                
                db.session.add(new_event)
        
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
            
            music_prefs.music_url = f'http://localhost:5000/uploads/{filename}'
            
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

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
        
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token with string identity
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'token': access_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create access token with string identity
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'token': access_token
    })

@app.route('/api/profile/update', methods=['POST'])
@jwt_required()
def update_profile():
    try:
        # Convert JWT identity to integer for database query
        current_user_id = int(get_jwt_identity())
        app.logger.info(f'Updating profile for user {current_user_id}')
        
        user = User.query.get(current_user_id)
        if not user:
            app.logger.error(f'User {current_user_id} not found')
            return jsonify({'error': 'User not found'}), 404

        form_data = request.form
        app.logger.info(f'Received form data: {form_data}')
        
        # Update user fields
        if 'username' in form_data:
            existing_user = User.query.filter_by(username=form_data['username']).first()
            if existing_user and existing_user.id != current_user_id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = form_data['username']
            
        if 'email' in form_data:
            existing_user = User.query.filter_by(email=form_data['email']).first()
            if existing_user and existing_user.id != current_user_id:
                return jsonify({'error': 'Email already registered'}), 400
            user.email = form_data['email']
            
        if 'bio' in form_data:
            user.bio = form_data['bio']
            app.logger.info(f'Updated bio to: {user.bio}')
            
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and allowed_file(file.filename):
                filename = secure_filename(f'avatar_{current_user_id}_{int(time.time())}.{file.filename.rsplit(".", 1)[1].lower()}')
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                user.avatar_url = f'http://localhost:5000/uploads/{filename}'
                app.logger.info(f'Updated avatar URL to: {user.avatar_url}')
                
        db.session.commit()
        app.logger.info('Profile updated successfully')
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'bio': user.bio,
            'avatar_url': user.avatar_url,
            'created_at': user.created_at.isoformat()
        })
        
    except Exception as e:
        app.logger.error(f'Error updating profile: {str(e)}')
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({
        'error': 'Invalid token',
        'message': error_string
    }), 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify({
        'error': 'No token provided',
        'message': error_string
    }), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return jsonify({
        'error': 'Token has expired',
        'message': 'Please log in again'
    }), 401

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create new tables with updated schema
    app.run(debug=True)
