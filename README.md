# Timeline Forum (V3)

## AI Context Primer

### Core Architectural Tenets  
**1. Coordinate-Based Timeline** (`TimelineV3.js`)  
- Zero-point reference system  
- Bidirectional infinite growth  
- Marker generation algorithm (`generateTimeMarkers`)  

**2. Event/Post Unification** (`EventList.js:36`)  
- Shared data structure between events/posts  
- Hashtag-based timeline association  
- Identical rendering components  

**3. Navigation System** (`TimelineControls.js`)  
- Scroll position preservation  
- URL parameter synchronization  
- Hover marker persistence  

### Critical Implementation Patterns

```javascript
// Timeline width calculation (responsive hook)
const { width } = useWindowSize(); // From frontend/src/hooks/
```

```javascript
// Event dot click handler (TimelineView.js:380-415)
eventDotContainer.onClick = () => {
  // Maintains z-index hierarchy during portal rendering
};
```

### Component Reference Table
| Component          | Key Functionality          | Location                                  |
|--------------------|----------------------------|-------------------------------------------|
| Timeline Core      | Coordinate calculations    | `frontend/src/components/timeline-v3/`   |
| Event List         | Unified display render     | `EventList.js:36` (current focus)         |
| Time Markers       | Dynamic generation         | `TimelineV3.js:142`                      |

### Current Focus Area: Day View
1. **Completion Requirements**  
- Finalize hour marker spacing algorithm  
- Implement smooth timezone transitions  
- Connect to real-time event feed  

2. **Key Dependencies**  
- `useWindowSize` hook  
- Timeline scroll position context  
- Event dot portal rendering

### Future Enhancements
1. **Profile Personalization**: Users can customize their profile backgrounds, similar to Tumblr and MySpace.
2. Timeline filters (day/week/month/year)
3. Event creation and display
4. Discussion posts integration
5. Enhanced hashtag system
6. Social features (comments, likes, sharing)
7. Additional timeline type support

### Design Guidelines
- **Styling and Animations**: Ensure all styling and animations are smooth, humble, and modern-looking.

### Database Management
- **DBMS Considerations**: Focus on effective use of records and fields within the database.

### Online Mailbox Feature
- **Mailbox Implementation**: Users can send and receive mail visually, using themed stationery like in Animal Crossing, with a virtual inbox to display messages.

### Note on EventMarker Component
- The EventMarker component requires accurate date/time information for proper functionality. There are additional considerations to ensure it works correctly.

### Original Documentation
<details>
<summary>Legacy README Content</summary>

# Timeline Forum

A modern web application for creating and sharing timelines with interactive event cards.

## Features

### Timeline V3
- Interactive timeline with event cards
- Event types: Remarks, News, and Media
- Event filtering by type with modern, animated buttons
- Event sorting (newest/oldest) with preference memory
- Smart event referencing system:
  - Events can appear in multiple timelines through hashtags
  - All instances of an event share the same data
  - Changes and interactions are synchronized across timelines
- Modern UI with animations and transitions
- Responsive search functionality
- Smooth scrolling to selected events

## Technical Implementation

### Backend (Flask + SQLAlchemy)
- RESTful API endpoints for timeline and event management
- Efficient event referencing system using junction tables
- PostgreSQL database with proper relationships
- Tag-based timeline creation

### Frontend (React + Material-UI)
- Component-based architecture
- Framer Motion for smooth animations
- Material-UI for consistent, modern styling
- Local storage for user preferences
- Efficient event rendering and filtering

## Todo List

### High Priority
1. Event Card Enhancements
   - Create maximized view overlay for events
   - Show referenced timelines in expanded view
   - Add likes, comments, and voting system
   - Display full event description in expanded view

2. Timeline Improvements
   - Implement timeline navigation system
   - Add timeline descriptions and metadata
   - Create "Try Timeline V3 Beta" example page

3. User Experience
   - Add loading states with modern animations
   - Implement success/error toasts for user actions
   - Enhance search functionality with tag-based search

### Future Considerations
1. User Features
   - Event drafts on user profile
   - Event templates
   - User preference management

2. Data Management
   - Batch operations for events
   - Duplicate event detection
   - Event version history

3. Timeline Visualization
   - Enhanced timeline navigation
   - Timeline sharing and collaboration
   - Timeline statistics and analytics

## Getting Started

[Installation and setup instructions to be added]

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
   - Hashtags limited to alphanumeric characters only
   - Case-insensitive matching

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

## Timeline Implementation Comparison

#### Base Coordinate System
| Feature | Implementation |
|---------|---------------|
| Reference Point | Position 0 as center point |
| Marker Spacing | Fixed 100px between markers |
| Marker Values | Integer coordinates (-3, -2, -1, 0, 1, 2, 3) |
| Marker Display | Simple numeric display |
| Navigation | Smooth scrolling relative to position 0 |
| Viewport | Dynamic width based on screen size |
| Marker Generation | Generated based on viewport width |
| Position Calculation | Pure mathematical coordinates |
| Event Placement | Events positioned by converting timestamp to coordinate |
| Current Position | No specific time representation |

#### Day Filter Overlay
| Feature | Implementation |
|---------|---------------|
| Reference Point | Current time as position 0 |
| Marker Spacing | Inherited 100px from base system |
| Marker Values | Hours (12AM, 1AM, 2AM, etc.) |
| Marker Display | Time format with AM/PM |
| Navigation | Same smooth scrolling with time context |
| Viewport | Same dynamic width adaptation |
| Marker Generation | Same generation logic with time conversion |
| Position Calculation | Timestamp to hour coordinate conversion |
| Event Placement | Events positioned by hour of day |
| Current Position | Hover marker showing exact current time |

#### Key Transformations (Base → Day)
1. **Visual Representation**
   - Base: Pure numbers (-3 to +3)
   - Day: Time format (12AM to 11PM)

2. **Reference Point**
   - Base: Abstract position 0
   - Day: Current time at position 0

3. **Context Addition**
   - Base: No temporal context
   - Day: Current time, AM/PM, hour markers

4. **Special Elements**
   - Base: Basic markers only
   - Day: Hover marker, current time indicator

5. **Data Mapping**
   - Base: Direct coordinate mapping
   - Day: Time-to-coordinate conversion

This comparison shows how the day filter preserves the core coordinate system while adding temporal context through visual and functional transformations. Future view implementations (week, month, year) should follow a similar pattern of maintaining the base system while adding appropriate context and visual representations.
