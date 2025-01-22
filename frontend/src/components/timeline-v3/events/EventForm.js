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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import FileUpload from '../shared/FileUpload';

const EventForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().slice(0, 16),
    url: '',
    media: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        event_date: new Date().toISOString().slice(0, 16),
        url: '',
        media: null,
      });
      setError('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleFileUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      media: file,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add New Event</Typography>
          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            disabled={isSubmitting}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1,
              bgcolor: 'error.light',
              color: 'error.dark',
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          error={!!error}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          required
          error={!!error}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Date and Time"
          name="event_date"
          type="datetime-local"
          value={formData.event_date}
          onChange={handleChange}
          required
          error={!!error}
          disabled={isSubmitting}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="URL (optional)"
          name="url"
          value={formData.url}
          onChange={handleChange}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mt: 2 }}>
          <FileUpload
            onFileSelect={handleFileUpload}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting || !formData.title || !formData.description || !formData.event_date}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventForm;
