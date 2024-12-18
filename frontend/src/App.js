import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import TimelineList from './components/TimelineList';
import TimelineView from './components/TimelineView';
import CreateTimeline from './components/CreateTimeline';
import CreateEvent from './components/CreateEvent';
import PostsFeed from './components/PostsFeed';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
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
                <Route path="/" element={<PostsFeed />} />
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
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
            <TimelineList />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
