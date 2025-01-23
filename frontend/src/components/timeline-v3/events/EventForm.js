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
  Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from 'axios';

const EventForm = ({ open, onClose, timelineId, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString(),
    url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Reset form when opened
      setFormData({
        title: '',
        description: '',
        event_date: new Date().toISOString(),
        url: ''
      });
      setError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

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

      // Call the callback with the new event
      if (onEventCreated) {
        onEventCreated(response.data);
      }

      // Close the dialog
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
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6">Add New Event</Typography>
        {!loading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <TextField
              name="title"
              label="Event Title"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              autoFocus
            />

            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            <DateTimePicker
              label="Event Date & Time"
              value={new Date(formData.event_date)}
              onChange={handleDateChange}
              disabled={loading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />

            <TextField
              name="url"
              label="Reference URL (optional)"
              fullWidth
              value={formData.url}
              onChange={handleChange}
              disabled={loading}
              type="url"
              helperText="Add a link to an article or resource related to this event"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Event'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventForm;
