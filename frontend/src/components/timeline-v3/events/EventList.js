import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import {
  Event as EventIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon
} from '@mui/icons-material';

const EventList = ({ events, onEventSelect, onEventDelete, onEventEdit, selectedEventId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterTag, setFilterTag] = useState('all');
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedEventId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedEventId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      case 'audio':
        return <AudioIcon />;
      default:
        return null;
    }
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = filterTag === 'all' || 
        (event.tags && event.tags.includes(filterTag));
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.event_date) - new Date(b.event_date);
        case 'date-desc':
          return new Date(b.event_date) - new Date(a.event_date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  return (
    <Paper 
      elevation={2}
      sx={{ 
        mt: 3,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EventIcon color="primary" />
          <Typography variant="h6" component="div">
            Event List
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ ml: 'auto' }}
          >
            {filteredAndSortedEvents.length} events
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="date-desc">Newest First</MenuItem>
              <MenuItem value="date-asc">Oldest First</MenuItem>
              <MenuItem value="title-asc">Title A-Z</MenuItem>
              <MenuItem value="title-desc">Title Z-A</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Tag</InputLabel>
            <Select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              label="Filter Tag"
            >
              <MenuItem value="all">All Tags</MenuItem>
              <MenuItem value="important">Important</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="milestone">Milestone</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>
      
      <List sx={{ maxHeight: '600px', overflow: 'auto', p: 2 }}>
        {filteredAndSortedEvents.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No events found
          </Typography>
        ) : (
          <Stack spacing={2}>
            {filteredAndSortedEvents.map((event) => (
              <Card 
                key={event.id}
                ref={event.id === selectedEventId ? selectedRef : null}
                sx={{
                  position: 'relative',
                  '&::before': event.id === selectedEventId ? {
                    content: '""',
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    animation: 'pulse 2s infinite'
                  } : {},
                  '@keyframes pulse': {
                    '0%': {
                      opacity: 1,
                      transform: 'scale(1)'
                    },
                    '50%': {
                      opacity: 0.5,
                      transform: 'scale(1.02)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'scale(1)'
                    }
                  }
                }}
                sx={{ 
                  '&:hover': { boxShadow: 4 },
                  transition: 'box-shadow 0.2s'
                }}
                onClick={() => onEventSelect?.(event)}
              >
                {(event.media_url || event.url_image) && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={event.media_url || event.url_image}
                    alt={event.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {event.title}
                    </Typography>
                    {event.media_type && (
                      <Tooltip title={`${event.media_type} attached`}>
                        <Box>{getMediaIcon(event.media_type)}</Box>
                      </Tooltip>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(event.event_date)}
                    </Typography>
                  </Stack>

                  {event.url && (
                    <Box sx={{ mb: 1 }}>
                      <Button
                        startIcon={<LinkIcon />}
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        {event.url_title || 'View Reference'}
                      </Button>
                    </Box>
                  )}

                  {event.tags && event.tags.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {event.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          color={tag === 'important' ? 'error' : 'default'}
                        />
                      ))}
                    </Stack>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {onEventEdit && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventEdit(event);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {onEventDelete && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventDelete(event);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </List>
    </Paper>
  );
};

export default EventList;
