# Timeline Forum

A social news and forum website that organizes events on visual timelines. Similar to Reddit, but with a focus on chronological events and timeline-based communities.

## Features

- Create and join different timeline communities
- Post events with dates, descriptions, and media
- Interactive timeline visualization
- Upvote and comment on events
- User authentication and authorization
- Responsive and modern UI

## Tech Stack

### Backend
- Flask
- SQLAlchemy
- JWT Authentication
- SQLite database

### Frontend
- React
- Material-UI
- React Router
- Axios for API calls

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
timeline-forum/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TimelineList.js
│   │   │   ├── TimelineView.js
│   │   │   └── ...
│   │   └── App.js
│   └── package.json
└── README.md
```
