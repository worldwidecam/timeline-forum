import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date());
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const postData = {
        title,
        content,
        date: date.toISOString(),
        url: url || null,
        tags
      };

      await axios.post('http://localhost:5000/api/posts', postData);
      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const normalizedTag = currentTag.trim().toLowerCase();
      if (!tags.includes(normalizedTag)) {
        setTags([...tags, normalizedTag]);
      }
      setCurrentTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <IconButton
          aria-label="close"
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            rows={4}
            margin="normal"
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            margin="normal"
            type="url"
          />

          <TextField
            fullWidth
            label="Add Tags (press Enter)"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={handleAddTag}
            margin="normal"
          />

          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreatePost;
