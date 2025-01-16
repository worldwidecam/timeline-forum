import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import TimelineList from './components/TimelineList';
import TimelineView from './components/TimelineView';
import TimelineV3 from './components/timeline-v3/TimelineV3';
import CreateTimeline from './components/CreateTimeline';
import CreateEvent from './components/CreateEvent';
import CreatePost from './components/CreatePost';
import PostsFeed from './components/PostsFeed';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProfileSettings from './components/ProfileSettings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { CircularProgress, Box } from '@mui/material';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <Router>
          <Navbar />
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box sx={{ flex: 1, pt: 8 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ flex: 1 }}>
                      <PostsFeed />
                    </Box>
                    <Box sx={{ width: 300, p: 2 }}>
                      <TimelineList />
                    </Box>
                  </Box>
                } />
                <Route path="/timelines" element={
                  <ProtectedRoute>
                    <TimelineList />
                  </ProtectedRoute>
                } />
                <Route path="/timeline/:id" element={
                  <ProtectedRoute>
                    <TimelineView />
                  </ProtectedRoute>
                } />
                <Route path="/timeline-v3/:id" element={
                  <ProtectedRoute>
                    <TimelineV3 />
                  </ProtectedRoute>
                } />
                <Route path="/timeline/create" element={
                  <ProtectedRoute>
                    <CreateTimeline />
                  </ProtectedRoute>
                } />
                <Route path="/timeline/:id/event/create" element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                } />
                <Route path="/create-post" element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/profile/settings" element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
