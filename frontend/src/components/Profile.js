import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MusicPlayer from './MusicPlayer';

const Profile = () => {
  const { user } = useAuth();
  const [musicData, setMusicData] = useState(null);

  useEffect(() => {
    const fetchMusicPreferences = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile/music', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.music_url) {
          setMusicData(response.data);
        }
      } catch (error) {
        console.error('Error fetching music preferences:', error);
      }
    };

    if (user) {
      fetchMusicPreferences();
    }
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5">Please log in to view your profile</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={user.avatar_url}
                sx={{ width: 120, height: 120 }}
                alt={user.username}
              />
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Bio Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              About Me
            </Typography>
            <Typography variant="body1">
              {user.bio || 'No bio yet'}
            </Typography>
          </Grid>

          {/* Music Section */}
          {musicData && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                My Music
              </Typography>
              <MusicPlayer url={musicData.music_url} platform={musicData.music_platform} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
