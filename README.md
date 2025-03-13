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

### Event Marker Positioning System

The EventMarker component uses a sophisticated hierarchical time-based positioning system to place events accurately on the timeline across different view modes.

#### Key Principles

1. **Reference Point System**:
   - Point [0] represents the current time reference (now)
   - Positive values represent future times
   - Negative values represent past times

2. **Hierarchical Time Units**:
   - **Year**: Broadest time unit, providing general positioning area
   - **Month**: Narrows position within a year
   - **Day**: Further narrows position within a month
   - **Hour/Minute**: Provides exact positioning within a day

3. **View Mode-Specific Positioning**:
   - **Day View**: 
     - Each marker represents an hour
     - Events in current hour positioned between marker [0] (current hour) and marker [1] (next hour)
     - Position calculated as fraction of hour completed
   
   - **Week View**: 
     - Each marker represents a day
     - Today's events positioned between marker [0] (today) and marker [1] (tomorrow)
     - Position calculated as fraction of day completed

   - **Month View**: 
     - Each marker represents a day within the month
     - For same month events: Position based on day difference
     - For different month events: Position based on total day difference

   - **Year View**: 
     - Each marker represents a month
     - For same year events: Position based on month difference with day precision
     - For different year events: Position based on total month difference

4. **Visibility Logic**:
   - Events are only rendered if they fall within the visible range or are currently selected
   - View-specific visibility checks (e.g., within current week for week view)
   - Selected events always remain visible regardless of timeline position

5. **Position Calculation Formula**:
   ```
   position = primaryUnitDifference + (secondaryUnitValue / secondaryUnitTotal)
   ```
   Example (Day View): position = hourDifference + (minutes / 60)

#### Implementation Details

- Uses `date-fns` library for accurate date calculations
- Real-time updates with interval-based current time refresh
- Debug logging for position calculations
- Special handling for same-day/same-hour events
- Visibility optimizations to prevent rendering off-screen markers

### Component Reference Table
| Component          | Key Functionality          | Location                                  |
|--------------------|----------------------------|-------------------------------------------|
| Timeline Core      | Coordinate calculations    | `frontend/src/components/timeline-v3/`   |
| Event List         | Unified display render     | `EventList.js:36` (current focus)         |
| Time Markers       | Dynamic generation         | `TimelineV3.js:142`                      |
| Event Marker       | Event positioning system   | `events/EventMarker.js`                  |

### Current Focus Area: Day View
1. **Completion Requirements**  
- Finalize hour marker spacing algorithm  
- Implement smooth timezone transitions  
- Connect to real-time event feed  

2. **Key Dependencies**  
- `useWindowSize` hook  
- Timeline scroll position context  
- Event dot portal rendering

### Recent Fixes and Improvements

#### Timezone Handling
- **JavaScript/Python Timezone Integration**: Implemented proper timezone handling between frontend and backend
- **Key Insight**: JavaScript's `getTimezoneOffset()` returns minutes WEST of UTC with opposite sign convention
  - For PST (UTC-8), it returns +480 minutes
  - Backend now correctly subtracts this offset to convert from UTC to local time
- **Implementation Details**:
  - Frontend sends ISO dates with timezone offset information
  - Backend adjusts dates using the timezone offset before storing
  - Card components use consistent date formatting with `format(date, 'MMM d, yyyy, h:mm a')`

#### UI Improvements
- **Description Length Management**: Limited event card descriptions to 15 words to prevent layout issues
  - Full descriptions remain accessible in event popups
  - Implemented in all card types (News, Remark, Media)
- **Consistent Date Formatting**: Standardized date display across all components

#### Cross-View Navigation System
- We are currently in the thought process of creating a cross-view navigation system. The idea is to implement an arrow pointing to the last clicked position on the timeline, whether it be a time marker or an event marker.

#### Hardcoded Values Review
- During recent reviews, it was noted that the code has hardcoded values for specific ports (e.g., 3000, 5000) which complicates deployment and communication between frontend, backend, and database. This is an area that needs addressing to facilitate easier publishing of the site.

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

### Cloud Storage Integration
- **Cloudinary Integration**: Implemented Cloudinary for persistent file storage
  - **Purpose**: Solves the ephemeral file system issue on Render hosting
  - **Features**:
    - Automatic image optimization (quality and format)
    - Image transformations (resizing, cropping, effects)
    - Audio file optimization
    - Thumbnail generation
  - **Implementation**:
    - Files uploaded to Cloudinary instead of local storage
    - Images return optimized URLs and thumbnails
    - Audio files use AAC codec with optimized bitrate
    - Backward compatibility with existing local files
  - **Configuration**:
    - Set environment variables in production:
      - `CLOUDINARY_CLOUD_NAME`
      - `CLOUDINARY_API_KEY`
      - `CLOUDINARY_API_SECRET`

### Online Mailbox Feature
- **Mailbox Implementation**: Users can send and receive mail visually, using themed stationery like in Animal Crossing, with a virtual inbox to display messages.

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
- **File Storage**: Cloudinary cloud storage
- **File Uploads**: Flask's built-in file handling
- **Key Dependencies**:
  - `flask`: Web framework
  - `flask-sqlalchemy`: Database ORM
  - `flask-jwt-extended`: JWT authentication
  - `flask-cors`: CORS handling
  - `werkzeug`: File upload security
  - `cloudinary`: Cloud storage for media files

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
