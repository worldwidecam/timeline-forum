# Timeline Forum

An interactive web application for creating and visualizing timelines with events. Events are displayed on a horizontal timeline with year markers and can be expanded for more details.

## Features

### User Features
- User authentication (login/register)
- Customizable user profiles
  - Profile picture upload
  - Bio
  - Profile music player (MP3, WAV, OGG support)
- Dark/Light mode toggle

### Timeline Features
- Create and view timelines
- Add events to timelines
- Rich text formatting
- Image uploads for events
- Timeline sharing
- Fixed-width timeline (1200px) for consistent visualization
- Multi-scale zoom levels (day, week, month, year)

### Social Features
- Create posts
- Comment on posts
- Like posts and comments
- View user profiles
- Listen to profile music while browsing

## Post and Event System

The application features a dynamic relationship between posts and events:

### Posts
- Function as the primary form of user content
- Include titles, descriptions, dates, and URL attachments
- Associated with specific timelines using hashtags
- Accumulate popularity through user interactions
- Most popular posts within 24 hours automatically promote to events

### Events
- Represent significant timeline moments
- Share identical visual and data structure with posts
- Appear on the interactive timeline display
- Generated from highly-engaged posts
- Maintain chronological organization

### Promotion System
- Automated promotion based on 24-hour engagement metrics
- Popular posts automatically transition to timeline events
- Preserves post content and formatting in event display
- Creates a natural content curation system

## Timeline System

The timeline component is the core feature of this application, built with modular architecture for maintainability and flexibility.

### Timeline Architecture

#### Timeline Bar Component
The timeline bar consists of three independent but coordinated elements:
1. **Base Timeline** - The continuous blue line that serves as the visual foundation
2. **Time Markers** - Hour/day/month indicators that align with the timeline
3. **Navigation Controls** - Fixed "Earlier" and "Later" endpoints for timeline traversal

#### Key Design Principles
- **Separation of Concerns**: Each timeline element operates independently
- **Fixed Time Grid**: Time markers are positioned based on absolute time, not event positions
- **Continuous Navigation**: Pre-generated markers (24 hours in each direction) ensure smooth scrolling
- **Viewport-Based Display**: Only shows the portion of timeline within the current view
- **Consistent Spacing**: Fixed pixel spacing between markers maintains visual rhythm

### Timeline Scales
- **Day View** (Current Implementation)
  - 24-hour markers on each side of current time
  - 100px spacing between hour markers
  - Centered on current time by default
  - Smooth scrolling with marker generation as needed

- **Planned Views**
  - Week: 7-day markers with daily increments
  - Month: 30-day markers with daily increments
  - Year: 12-month markers with monthly increments

### Event System
Events are independent entities that overlay on the timeline:
- Events position themselves based on their timestamp
- No impact on timeline marker positioning or spacing
- Multiple events can exist at the same time point
- Events render as overlay markers on the timeline

### Current Implementation
- Modular component architecture
- Smooth bi-directional scrolling
- Fixed navigation controls
- Pre-generated time markers
- Centered current time display
- Consistent marker spacing

### Planned Improvements
1. **Event Integration**
   - Overlay event markers on timeline
   - Event creation at specific time points
   - Event clustering for simultaneous events
   - Event detail display on interaction

2. **Scale Implementation**
   - Scale switching with appropriate marker generation
   - Scale-specific marker spacing and labeling
   - Smooth transitions between scales

3. **Visual Enhancements**
   - Theme customization
   - Scale-appropriate styling
   - Event marker styling
   - Timeline decoration options

### Technical Notes
- Timeline width and marker spacing are configurable constants
- Marker positions are calculated based on time differences
- Navigation maintains a buffer of markers in both directions
- Component state manages visible time range and marker positions

## Project Philosophy and Direction

### User Experience First
Our development approach prioritizes seamless user experience over technical implementation. Every feature is designed with the following principles:
- Intuitive navigation that feels natural
- Smooth transitions without jarring changes
- Technical complexity hidden from the user
- Consistent and predictable behavior

### Timeline Navigation Design
The timeline implements smart navigation that adapts to user behavior:
- Initial view shows 24 hours before and after the current time
- Smooth scrolling between time markers
- Intelligent extension of timeline range based on navigation patterns
- "Return to Present" button appears contextually when needed
- Seamless loading of additional time periods without disrupting user flow

### Timeline Types and Visual Language
1. **Hashtag Timelines (#)**
   - System-generated timelines for hashtag aggregation
   - Visually identified by the # symbol prefix
   - Automatically collect and display relevant posts

2. **User/Company Timelines (Planned)**
   - Custom timelines with personalized tracking
   - Distinct visual identifiers for different timeline types
   - Flexible hashtag integration

### Core Features
- **Smart Navigation**
  - Contextual loading of timeline markers
  - Smooth scrolling with consistent behavior
  - Automatic range extension based on navigation patterns
  - Visual indicators for current time and day boundaries

- **Visual Hierarchy**
  - Clear timeline type indicators
  - Consistent visual language across components
  - Intuitive navigation controls
  - Clean separation of timeline elements

### Technical Implementation
- Client-side time management for consistency
- Dynamic marker generation and positioning
- Efficient timeline extension mechanism
- Responsive navigation controls
- Smart buffer management for smooth scrolling

### Future Enhancements
- Timeline filters (day/week/month/year)
- Event creation and display
- Discussion posts integration
- Enhanced hashtag system
- Social features (comments, likes, sharing)
- Additional timeline type support

### Development Approach
We maintain a balance between immediate functionality and future extensibility:
1. Focus on core user experience first
2. Implement features iteratively
3. Maintain consistent design language
4. Hide technical complexity from users
5. Build for future feature integration

## Project Structure

- `/backend`
  - Flask server
  - SQLite database
  - API endpoints
  - Data models
- `/frontend`
  - React components
  - Material-UI styling
  - Timeline visualization
  - Event management
  - `/src/components/timeline/`
    - `TimelineHeader.js` - Title, zoom controls, and create event button
    - `TimelineBar.js` - The horizontal timeline bar
    - `TimelineMarkers.js` - Time markers and scale indicators
    - `TimelineNavigation.js` - Left/Right navigation controls
    - `TimelinePostsSection.js` - Container for timeline posts
    - `TimelineBackground.js` - Background and spacing component
    - `EventDialog.js` - Event details dialog
    - `PresentTimeMarker.js` - "You are here" indicator

### Timeline Components

The timeline view is composed of several reusable components:

1. **TimelineHeader**
   - Timeline title with hashtag
   - Zoom level controls (day/week/month/year)
   - Create Event button
   - "Return to Present" button when applicable

2. **TimelineBar**
   - Main horizontal timeline bar
   - Visual representation of the timeline's scale

3. **TimelineMarkers**
   - Time markers for hours and days
   - Scale indicators based on zoom level

4. **PresentTimeMarker**
   - Animated "You are here" indicator
   - Visual pointer to current time
   - Smooth transitions on timeline updates

5. **TimelineNavigation**
   - "Earlier" and "Later" navigation buttons
   - Smooth scrolling controls
   - Visual indicators for timeline navigation

6. **TimelinePostsSection**
   - Container for timeline posts
   - Handles post layout and spacing
   - Maintains theme consistency

7. **EventDialog**
   - Modal display for event details
   - Edit and delete functionality
   - Responsive layout

8. **TimelineBackground**
   - Provides consistent background
   - Handles theme-based styling
   - Maintains proper spacing

Each component maintains consistent styling and follows Material-UI design principles while being independently maintainable and reusable.

### Component Interactions

The timeline components work together through the following interaction patterns:

1. **Timeline Navigation Flow**
   ```
   TimelineNavigation → TimelineView → TimelineBar + TimelineMarkers
   ├─ "Earlier/Later" clicks trigger handleScroll in TimelineView
   ├─ TimelineView updates timelineOffset state
   └─ TimelineBar and TimelineMarkers update positions
   ```

2. **Zoom Level Changes**
   ```
   TimelineHeader → TimelineView → TimelineMarkers
   ├─ Zoom control changes trigger setZoomLevel
   ├─ TimelineView recalculates marker spacing
   └─ TimelineMarkers updates with new scale
   ```

3. **Present Time Tracking**
   ```
   TimelineMarkers ←→ TimelineView ←→ TimelineHeader
   ├─ TimelineView tracks current time position
   ├─ TimelineMarkers shows "You are here" indicator
   └─ TimelineHeader shows/hides "Return to Present" button
   ```

4. **Event Creation Flow**
   ```
   TimelineHeader → TimelineView
   ├─ "Create Event" triggers navigation
   └─ New event gets added to timeline after creation
   ```

Key State Management:
- `timelineOffset`: Controlled by TimelineView, consumed by all components
- `zoomLevel`: Set by TimelineHeader, affects marker calculations
- `isPresentVisible`: Calculated by TimelineView, used by TimelineHeader
- `timeMarkers`: Generated by TimelineView, used by TimelineMarkers

This component architecture ensures:
- Clear separation of concerns
- Predictable data flow
- Centralized state management
- Efficient updates and rendering

### UI Components and Terminology

### Navigation Elements
- **View Profile Button**: Direct access to user profile page, located in the top-right navbar
- **Profile Hamburger Menu**: Expandable menu (≡) containing profile-related options and settings
- **Profile Avatar**: User's profile picture, displayed in the top-right corner

### Profile System
- **Profile Page**: Main user profile view
  - Personal information display
  - Activity history
  - Timeline overview
- **Profile Settings**: Configuration page accessed via Profile Hamburger Menu
  - Profile picture management
  - Account information updates
  - Personal details modification

### Profile Navigation
- Top navbar provides consistent access to profile features
- Profile Hamburger Menu (≡) contains all profile-related settings and options
- Clear separation between main profile view and settings management

### Visual Elements
- **Fret**: The space between time markers on the timeline. These are designed to be equidistant to create a consistent visual rhythm.
  - Reference: `TimelineView.js:144` (spacing calculation)

- **Endpoint**: The circular marker at the start of the timeline ("Beginning") and the arrow at the end ("Present day").
  - Reference: `TimelineView.js:314` (endpoint styling)

- **Event Dot**: The small circular markers on the timeline that represent individual events. These have a larger clickable area for better interaction.
  - Reference: `TimelineView.js:380` (event dot container)

- **Time Marker**: The vertical lines with timestamps that divide the timeline into equal segments.
  - Reference: `TimelineView.js:142` (generateTimeMarkers function)

### Technical Terms
- **Padding**: The empty space at the start (3%) and end of the timeline to prevent events from being too close to the edges.
  - Reference: `TimelineView.js:135` (calculatePosition function)

- **Available Space**: The percentage of the timeline's width (94%) that's available for content between the padding.
  - Reference: `TimelineView.js:145` (availableSpace constant)

- **Time Boundaries**: The calculated start and end times for the timeline, which adjust based on the time span of events.
  - Reference: `TimelineView.js:112` (getTimelineBoundaries function)

### Time Formats
- **Same-day**: Shows hours (e.g., "2PM")
- **Within-week**: Shows day and hour (e.g., "Wed 2PM")
- **Within-year**: Shows month and day (e.g., "Dec 13")
- **Multi-year**: Shows month and year (e.g., "Dec 2023")
  - Reference: `TimelineView.js:149-166` (time format logic)

## Technical Implementation

### Frontend Stack
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Key Dependencies**:
  - `@mui/material`: UI components
  - `@mui/icons-material`: Material icons
  - `axios`: HTTP requests
  - `react-router-dom`: Client-side routing

### Backend Stack
- **Framework**: Flask (Python)
- **Database**: SQLAlchemy with SQLite
- **Authentication**: Flask-JWT-Extended
- **File Uploads**: Flask's built-in file handling
- **Key Dependencies**:
  - `flask`: Web framework
  - `flask-sqlalchemy`: Database ORM
  - `flask-jwt-extended`: JWT authentication
  - `flask-cors`: CORS handling
  - `werkzeug`: File upload security

### Authentication System
- JWT-based authentication
- Token stored in localStorage
- Protected routes using `@jwt_required()` decorator
- Token format: Bearer authentication

### API Endpoints
- **Authentication**:
  - `POST /api/auth/register`: User registration
  - `POST /api/auth/login`: User login
  
- **User Profile**:
  - `GET /api/user/current`: Get current user data
  - `POST /api/profile/update`: Update user profile (multipart/form-data)
  
- **Timeline Management**:
  - `POST /api/timeline`: Create new timeline
  - `GET /api/timeline/<id>`: Get timeline details
  - `GET /api/timelines`: List all timelines
  
- **Posts and Events**:
  - `POST /api/timeline/<id>/posts`: Create post
  - `GET /api/timeline/<id>/posts`: Get timeline posts
  - `POST /api/timeline/<id>/events`: Create event
  - `GET /api/timeline/<id>/events`: Get timeline events

### File Structure
```
timeline-forum/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.js
│   ├── package.json
│   └── README.md
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── uploads/
└── README.md
```

### Development Setup
1. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Environment Variables**:
   - Backend:
     - `JWT_SECRET_KEY`: Secret key for JWT tokens
     - `UPLOAD_FOLDER`: Path for file uploads
   - Frontend:
     - `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

### Common Issues and Solutions
1. **JWT Token Issues**:
   - Ensure token is properly stored in localStorage
   - Check token format (Bearer + token)
   - Verify token expiration

2. **File Upload Issues**:
   - Use multipart/form-data for file uploads
   - Don't set Content-Type header manually
   - Check file size limits

3. **CORS Issues**:
   - Verify CORS configuration in backend
   - Check allowed origins and methods
   - Ensure credentials handling is consistent

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/worldwidecam/timeline-forum.git
cd timeline-forum
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python app.py
```
The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Click "Create Timeline" to create a new timeline
4. In a timeline view, click "Create Event" to add events
5. Events will appear on the timeline in chronological order
6. Hover over events to see the hover effect
7. Click on events to expand/collapse their details

## Project Structure

- `/backend`
  - Flask server
  - SQLite database
  - API endpoints
  - Data models
- `/frontend`
  - React components
  - Material-UI styling
  - Timeline visualization
  - Event management

## Technical Details

### Backend
- Flask framework
- SQLAlchemy for database management
- SQLite database
- Flask-CORS for handling cross-origin requests

### Frontend
- React
- Material-UI components
- Custom timeline visualization
- Responsive design

## Development

To make changes:
1. Create a new branch: `git checkout -b feature-name`
2. Make your changes
3. Commit: `git commit -m "Description of changes"`
4. Push: `git push origin feature-name`

## Database

- SQLite database located at `backend/instance/timeline_forum.db`
- Data persists between sessions
- No additional database setup required

## Next Steps

Planned features:
- Enhanced user authentication and authorization:
  - Clear distinction between anonymous and authenticated users
  - Rich user profiles for social interaction
  - Role-based permissions system
- Timeline privacy controls:
  - Personal private timeline for each user
  - Selective sharing capabilities
  - Privacy settings management
- Mobile responsiveness improvements
- Additional timeline customization options

## Current Authentication System

The authentication system is in its early phases:
- Basic login functionality implemented
- User registration available
- Future improvements planned:
  - Refined user permissions
  - Enhanced profile system for social sharing
  - Clear differentiation between anonymous and authenticated user capabilities

## Recent Updates
- Added profile music player feature
  - Upload and play audio files on profiles
  - Simple play/pause controls
  - Volume adjustment with mute option
  - Automatic cleanup of old audio files
- Improved profile picture handling
- Enhanced error handling for file uploads
