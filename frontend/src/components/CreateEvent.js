import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    event_date: '',
    url: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Submitting event:', formData);  
      const response = await axios.post(
        `http://localhost:5000/api/timeline/${id}/event`,  
        formData
      );
      console.log('Server response:', response.data);  
      if (response.data.event) {
        navigate(`/timeline/${id}`);  
      } else {
        setError('Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error creating event:', error.response?.data || error.message);
      setError('Failed to create event. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={3} position="relative">
            <IconButton
              aria-label="close"
              onClick={() => navigate(`/timeline/${id}`)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: '#ce93d8',
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom>
              Create Event
            </Typography>
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="Event Date"
                name="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                    color: '#ce93d8',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& .MuiInputAdornment-root': {
                      color: '#ce93d8',
                    },
                    '& input::-webkit-calendar-picker-indicator': {
                      filter: 'invert(0.8) sepia(1) saturate(1) hue-rotate(220deg)',
                    }
                  }
                }}
                required
              />
              <TextField
                fullWidth
                label="URL (Optional)"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                margin="normal"
                placeholder="https://example.com"
                helperText="Add a relevant link to this event"
              />
              <Box mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Create Event
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default CreateEvent;
