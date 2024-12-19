# Timeline Forum

An interactive web application for creating and visualizing timelines with events. Events are displayed on a horizontal timeline with year markers and can be expanded for more details.

## Features

- Create multiple timelines
- Add events to timelines with titles, dates, and descriptions
- Visual timeline display with:
  - Year markers
  - Interactive event cards
  - Hover effects
  - Diagonal connecting lines
- Chronological event ordering
- Expandable event details
- Basic user authentication (early phase)
- Post-to-Event promotion system (in development)

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

The timeline component is the core feature of this application, requiring careful consideration for any modifications.

### Current Implementation
- Users can create custom timelines
- Events can be manually added to timelines
- Visual display includes:
  - Year markers
  - Interactive event cards
  - Hover effects
  - Diagonal connecting lines
- Chronological event ordering
- Expandable event details

### Future Vision
- Tag-Based Timeline Generation
  - Main timelines will be automatically created from post tags
  - Self-moderating through user engagement
  - Popular posts automatically promote to timeline events

### Timeline Privacy and Sharing
- Public Timelines
  - Generated from hashtags
  - Community-driven content
  - Visible to all users
  
- Private Timelines
  - Personal progress tracking
  - One dedicated private timeline per user profile
  - Optional sharing capabilities
  - Ideal for sensitive or personal content
  
- Profile Integration
  - Dedicated space for personal timeline
  - User control over timeline visibility
  - Selective sharing options

### Timeline Structure
- Main Display: Shows promoted events chronologically
- Discussion Section: Lists related posts below timeline
- Organization:
  - Hashtag-based categorization
  - Automated content promotion
  - Community-driven curation

### Important Note
The timeline component is fundamental to the project's functionality. Any modifications to its behavior or structure require careful consideration and should be treated as significant architectural decisions.

## Project Philosophy and Direction

### Core Concepts
- Timelines are the heart of this application
- Content flows from community engagement to historical record
- User experience prioritizes natural content curation

### Key Principles
1. **Timeline-Centric Design**
   - All features should enhance or complement the timeline experience
   - Timeline modifications require careful architectural consideration
   - Visual clarity and intuitive navigation are essential

2. **Community-Driven Content**
   - Posts naturally evolve into timeline events through engagement
   - Hashtags create self-moderating timeline communities
   - Balance between public discourse and personal progress tracking

3. **Progressive Enhancement**
   - Start with core functionality, then add features
   - Authentication and privacy controls evolve with user needs
   - Maintain focus on timeline visualization and interaction

### Development Priorities
1. Timeline visualization and interaction
2. Post-to-event promotion system
3. User authentication and profiles
4. Privacy controls and sharing features

### Future Considerations
When suggesting improvements, consider:
- How does it enhance the timeline experience?
- Does it maintain the natural flow from posts to events?
- Will it scale with community growth?
- Does it respect user privacy needs?

## Timeline Component Glossary

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
