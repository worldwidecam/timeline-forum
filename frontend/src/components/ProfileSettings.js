import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MusicPlayer from './MusicPlayer';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [musicData, setMusicData] = useState({
    music_url: '',
    music_platform: 'youtube'
  });
  const [musicFile, setMusicFile] = useState(null);
  const [musicPreview, setMusicPreview] = useState(null);

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

  const handleThemeChange = (event) => {
    toggleTheme();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create FormData for multipart form submission
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('bio', formData.bio);
      
      if (selectedFile) {
        submitData.append('avatar', selectedFile);
      }

      // Add password change to form data if provided
      if (formData.currentPassword && formData.newPassword) {
        submitData.append('current_password', formData.currentPassword);
        submitData.append('new_password', formData.newPassword);
      }

      const response = await axios.post('http://localhost:5000/api/profile/update', 
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (updateProfile) {
        updateProfile(response.data);
      }
      setSuccess('Profile updated successfully');
      
      // Only reload if there were no errors
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMusicChange = (e) => {
    const { name, value } = e.target;
    setMusicData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMusicFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setMusicFile(file);
        setMusicPreview(URL.createObjectURL(file));
      } else {
        setError('Please select an audio file (MP3, WAV, or OGG)');
      }
    }
  };

  const handleMusicSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('music', musicFile);

      const response = await axios.post(
        'http://localhost:5000/api/profile/music',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSuccess('Music updated successfully');
      setMusicData(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update music');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={handleThemeChange}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
              />
            }
            label={isDarkMode ? "Dark Mode" : "Light Mode"}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={previewUrl || user?.avatar_url || ''}
                  sx={{ width: 100, height: 100 }}
                  alt={formData.username}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{ mt: 1 }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12} sm={8} md={9}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Profile Music
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="music-file"
                type="file"
                onChange={handleMusicFileChange}
              />
              <label htmlFor="music-file">
                <Button variant="outlined" component="span">
                  Choose Audio File
                </Button>
              </label>
              {musicFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {musicFile.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              {(musicPreview || musicData?.music_url) && (
                <MusicPlayer url={musicPreview || musicData?.music_url} />
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMusicSubmit}
                disabled={!musicFile}
              >
                Update Music
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
          </Grid>
        </Box>
        
        <Snackbar
          open={Boolean(success)}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default ProfileSettings;
