import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { Close as CloseIcon, Image as ImageIcon, Link as LinkIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from 'axios';

const EventForm = ({ open, onClose, timelineId, onEventCreated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString(),
    url: '',
    url_title: '',
    url_description: '',
    url_image: '',
    media_url: '',
    media_type: '',
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlData, setUrlData] = useState(null);

  useEffect(() => {
    if (open) {
      // Reset form when opened
      setFormData({
        title: '',
        description: '',
        event_date: new Date().toISOString(),
        url: '',
        url_title: '',
        url_description: '',
        url_image: '',
        media_url: '',
        media_type: '',
        tags: []
      });
      setError('');
      setActiveTab(0);
      setUrlData(null);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleDateChange = (newDate) => {
    if (newDate && !isNaN(newDate)) {
      setFormData(prev => ({
        ...prev,
        event_date: newDate.toISOString()
      }));
      setError('');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUrlBlur = async () => {
    if (!formData.url) return;
    
    try {
      setUrlLoading(true);
      const response = await axios.get(`/api/fetch-url-metadata?url=${encodeURIComponent(formData.url)}`);
      setUrlData(response.data);
      
      // Auto-fill URL metadata
      setFormData(prev => ({
        ...prev,
        url_title: response.data.title || '',
        url_description: response.data.description || '',
        url_image: response.data.image || ''
      }));
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleTagChange = (event) => {
    setFormData(prev => ({
      ...prev,
      tags: event.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.event_date) {
      setError('Date is required');
      return false;
    }
    if (formData.url && !formData.url.startsWith('http')) {
      setError('URL must start with http:// or https://');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `/api/timeline-v3/${timelineId}/events`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (onEventCreated) {
        onEventCreated(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      setError(
        error.response?.data?.error || 
        'Failed to create event. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Create New Event
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Basic Info" />
          <Tab label="Links & Media" />
          <Tab label="Tags" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <Stack spacing={2}>
            <TextField
              name="title"
              label="Event Title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
            <DateTimePicker
              label="Event Date & Time"
              value={new Date(formData.event_date)}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={2}>
            <TextField
              name="url"
              label="URL"
              value={formData.url}
              onChange={handleChange}
              onBlur={handleUrlBlur}
              fullWidth
              InputProps={{
                endAdornment: urlLoading && <CircularProgress size={20} />
              }}
              helperText="Add a reference link to this event"
            />
            
            {urlData && (
              <Alert severity="info" sx={{ mb: 2 }}>
                URL preview data loaded successfully
              </Alert>
            )}

            <TextField
              name="url_title"
              label="URL Title (Optional)"
              value={formData.url_title}
              onChange={handleChange}
              fullWidth
              helperText="Custom title for the reference link"
            />
          </Stack>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Coming Soon: Hashtag System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A powerful hashtag system is planned for this section, allowing for dynamic categorization and improved event discovery.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Create Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm;
