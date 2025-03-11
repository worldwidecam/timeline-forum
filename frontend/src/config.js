const config = {
    API_URL: process.env.NODE_ENV === 'production' 
        ? (process.env.REACT_APP_API_URL || 'https://timeline-forum-backend.onrender.com')
        : 'http://localhost:5000',
};

export default config;
