import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isSettingsPage = location.pathname.includes('/settings');

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {user?.username}'s Profile
        </Typography>
        
        {/* Render either the main profile content or the settings page */}
        {!isSettingsPage ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Typography>
              Email: {user?.email}
            </Typography>
            <Typography>
              Bio: {user?.bio || 'No bio added yet'}
            </Typography>
          </Box>
        ) : (
          <Outlet />
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile;
