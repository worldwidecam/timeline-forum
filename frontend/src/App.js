import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import TimelineList from './components/TimelineList';
import TimelineView from './components/TimelineView';
import CreateTimeline from './components/CreateTimeline';
import CreateEvent from './components/CreateEvent';
import CreatePost from './components/CreatePost';
import PostsFeed from './components/PostsFeed';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProfileSettings from './components/ProfileSettings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box sx={{ flex: 1, pt: 8 }}>
              <Routes>
                <Route path="/" element={
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ flex: 1 }}>
                      <PostsFeed />
                    </Box>
                    <TimelineList />
                  </Box>
                } />
                <Route path="/timeline/:id" element={<TimelineView />} />
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
                <Route path="/post/create" element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
    </ThemeProvider>
  );
}

export default App;
