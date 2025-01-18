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
- Dynamic width timeline that adapts to screen size
- Multiple view modes (currently implementing day view, with week/month/year views planned)

### Timeline System

The timeline component is the core feature of this application, built with modular architecture for maintainability and flexibility.

#### Core Concept
- **Coordinate-Based System**: Instead of using start/end times, the timeline is built around a coordinate system
- **Reference Point Zero**: All positions are calculated relative to position 0 (the reference point)
- **Bidirectional Growth**: Timeline can infinitely extend in both directions from the reference point
- **Simplified Logic**: Clean, mathematical approach to timeline navigation and marker placement

#### Day View Implementation
1. **Dynamic Timeline Width**
   - Calculates marker count based on screen width
   - Ensures equal number of markers on each side of zero
   - Maintains smooth scrolling when window is resized
   - Creates illusion of infinite scrolling

2. **Hover Marker Features**
   - Accurate positioning based on current time (hours:minutes)
   - Moves smoothly with timeline scrolling
   - Compact vertical indicator
   - Updates position every minute
   - Shows current time in AM/PM format
   - Semi-transparent background for better visibility

3. **Navigation System**
   - Smooth left/right scrolling
   - Maintains hover marker position during scrolling
   - "Back to Present" button with fade transition
   - Preserves view mode in URL parameters

4. **Visual Information**
   - "Day View" label with current date
   - Hashtag-based timeline identification
   - Clear hour markers (4AM, 5AM, etc.)
   - Smooth transitions and animations

### Post System

The application uses posts as the primary form of user content:

### Posts
- Function as the primary form of user content
- Include titles, descriptions, dates, and URL attachments
- Associated with specific timelines using hashtags (alphanumeric characters only)
- Support user interactions (likes, comments)

### Events
- Represent significant timeline moments
- Share identical visual and data structure with posts
- Appear on the interactive timeline display
- Maintain chronological organization

## Timeline System

The timeline component is the core feature of this application, built with modular architecture for maintainability and flexibility.

### Timeline V3 (Beta)
The latest iteration of our timeline system introduces a fundamental architectural improvement:

#### Core Concept
- **Coordinate-Based System**: Instead of using start/end times, the timeline is built around a coordinate system
- **Reference Point Zero**: All positions are calculated relative to position 0 (the reference point)
- **Bidirectional Growth**: Timeline can infinitely extend in both directions from the reference point
- **Simplified Logic**: Clean, mathematical approach to timeline navigation and marker placement

#### View Modes

##### Day View
1. **Markers**
   - Hour-based markers (4AM, 5AM, etc.)
   - Special styling for midnight markers (12 AM)
   - Day names displayed with midnight markers

2. **Hover Marker**
   - Shows current time in AM/PM format
   - Position updates every minute
   - Moves between hours based on minutes (e.g., 12:30 = halfway between 12 and 1)
   - Semi-transparent background for better visibility

##### Week View
1. **Markers**
   - Day-based markers showing weekday names
   - Compact format for regular days (e.g., "Monday")
   - Special format for Sundays showing date (e.g., "Jan 18")

2. **Hover Marker**
   - Shows current day and date
   - Position reflects time of day between days
   - Example: At 12 noon, marker is halfway (0.5) between today and tomorrow
   - Updates position based on current time

#### Navigation System
- Smooth left/right scrolling with elevated z-index buttons
- Maintains hover marker position during scrolling
- "Back to Present" button with fade transition
- Preserves view mode in URL parameters

#### Visual Elements
- Animated hover marker with pulsing effect
- Floating animations for better user experience
- Adaptive styling for dark/light modes
- Improved visibility of time markers

3. **Hover Marker Features**
   - Accurate positioning based on current time (hours:minutes)
   - Moves smoothly with timeline scrolling
   - Compact vertical indicator
   - Updates position every minute
   - Shows current time in AM/PM format
   - Semi-transparent background for better visibility

4. **Navigation System**
   - Smooth left/right scrolling
   - Maintains hover marker position during scrolling
   - "Back to Present" button with fade transition
   - Preserves view mode in URL parameters

4. **Visual Information**
   - "Day View" label with current date
   - Hashtag-based timeline identification
   - Clear hour markers (4AM, 5AM, etc.)
   - Smooth transitions and animations

### Post System

The application uses posts as the primary form of user content:

### Posts
- Function as the primary form of user content
- Include titles, descriptions, dates, and URL attachments
- Associated with specific timelines using hashtags (alphanumeric characters only)
- Support user interactions (likes, comments)

### Events
- Represent significant timeline moments
- Share identical visual and data structure with posts
- Appear on the interactive timeline display
- Maintain chronological organization

## Timeline System

The timeline component is the core feature of this application, built with modular architecture for maintainability and flexibility.

### Timeline V3 (Beta)
The latest iteration of our timeline system introduces a fundamental architectural improvement:

#### Core Concept
- **Coordinate-Based System**: Instead of using start/end times, the timeline is built around a coordinate system
- **Reference Point Zero**: All positions are calculated relative to position 0 (the reference point)
- **Bidirectional Growth**: Timeline can infinitely extend in both directions from the reference point
- **Simplified Logic**: Clean, mathematical approach to timeline navigation and marker placement

#### View Modes

##### Day View
1. **Markers**
   - Hour-based markers (4AM, 5AM, etc.)
   - Special styling for midnight markers (12 AM)
   - Day names displayed with midnight markers

2. **Hover Marker**
   - Shows current time in AM/PM format
   - Position updates every minute
   - Moves between hours based on minutes (e.g., 12:30 = halfway between 12 and 1)
   - Semi-transparent background for better visibility

##### Week View
1. **Markers**
   - Day-based markers showing weekday names
   - Compact format for regular days (e.g., "Monday")
   - Special format for Sundays showing date (e.g., "Jan 18")

2. **Hover Marker**
   - Shows current day and date
   - Position reflects time of day between days
   - Example: At 12 noon, marker is halfway (0.5) between today and tomorrow
   - Updates position based on current time

#### Navigation System
- Smooth left/right scrolling with elevated z-index buttons
- Maintains hover marker position during scrolling
- "Back to Present" button with fade transition
- Preserves view mode in URL parameters

#### Visual Elements
- Animated hover marker with pulsing effect
- Floating animations for better user experience
- Adaptive styling for dark/light modes
- Improved visibility of time markers

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

### Current Implementation Status (as of Jan 14, 2025)

#### Timeline Navigation
- Day view is fully functional with smooth scrolling
- Week view implementation in progress
  - Basic functionality working
  - Smooth scrolling implemented
  - Present marker visibility fixed
  - Return to Present working correctly

#### Known Issues
1. Week View
   - Timeline end boundaries too easily reachable (~15 clicks)
   - Need to maintain infinite scrolling feel

#### Next Steps
1. Fix Week View Issues
   - Adjust timeline extension amounts to prevent reaching boundaries
   - Ensure consistent marker spacing and positioning

2. Continue Timeline Scale Implementation
   - Complete week view fixes
   - Implement month view
   - Implement year view

3. Testing and Optimization
   - Add comprehensive tests for timeline navigation
   - Optimize marker generation and positioning
   - Improve performance for long scrolling sessions

#### Recent Changes
- Fixed present marker visibility in week view
- Improved smooth scrolling in both directions
- Adjusted week view initialization range
- Fixed Return to Present functionality

## Recent Updates

### January 2025
- Introduced Timeline V3 Beta with improved time display
- Added animated hover marker with exact time
- Enhanced midnight marker styling
- Improved timeline navigation
- Added beta access button in timeline list

### Planned Improvements
1. **Timeline V3 Enhancements**
   - Additional view modes (week, month, year)
   - Event integration
   - Timeline sharing features
   - Performance optimizations

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
