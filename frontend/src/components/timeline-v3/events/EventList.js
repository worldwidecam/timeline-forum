import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Chip,
  useTheme,
  CardMedia,
  CardActionArea,
  Link,
  Tooltip,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as RemarkIcon,
  Newspaper as NewsIcon,
  PermMedia as MediaIcon,
  Link as LinkIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const EVENT_TYPES = {
  REMARK: 'remark',
  NEWS: 'news',
  MEDIA: 'media'
};

const EVENT_TYPE_COLORS = {
  [EVENT_TYPES.REMARK]: {
    light: '#2196f3',
    dark: '#1976d2'
  },
  [EVENT_TYPES.NEWS]: {
    light: '#f44336',
    dark: '#e91e63'
  },
  [EVENT_TYPES.MEDIA]: {
    light: '#4caf50',
    dark: '#3e8e41'
  }
};

const EventList = ({ events, selectedEventId, onEventSelect, onEventEdit, onEventDelete }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  const getEventTypeIcon = (type) => {
    switch (type) {
      case EVENT_TYPES.REMARK:
        return <RemarkIcon />;
      case EVENT_TYPES.NEWS:
        return <NewsIcon />;
      case EVENT_TYPES.MEDIA:
        return <MediaIcon />;
      default:
        return <RemarkIcon />;
    }
  };

  const getEventColor = (type) => {
    const colors = EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS[EVENT_TYPES.REMARK];
    return theme.palette.mode === 'dark' ? colors.dark : colors.light;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderEventContent = (event) => {
    const color = getEventColor(event.type);

    switch (event.type) {
      case EVENT_TYPES.NEWS:
        return (
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 500,
                  color: color,
                }}
              >
                {event.title}
              </Typography>
              {event.author && (
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  by <span style={{ fontWeight: 500, color: color }}>{event.author}</span>
                </Typography>
              )}
            </Box>

            {event.url && (
              <Link 
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ display: 'block', mb: 2 }}
              >
                <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  {event.url_image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={event.url_image}
                      alt={event.url_title || event.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" color="text.primary" gutterBottom>
                      {event.url_title || event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.url_description || event.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LinkIcon fontSize="small" />
                      {event.url_source || new URL(event.url).hostname}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>

            {event.tags && event.tags.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {event.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: `${color}20`,
                      color: color,
                      '&:hover': { bgcolor: `${color}30` }
                    }}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        );

      case EVENT_TYPES.MEDIA:
        return (
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 500,
                  color: color,
                }}
              >
                {event.title}
              </Typography>
              {event.author && (
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  by <span style={{ fontWeight: 500, color: color }}>{event.author}</span>
                </Typography>
              )}
            </Box>

            {event.media_url && (
              <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                {event.media_type === 'video' ? (
                  <video
                    src={event.media_url}
                    controls
                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                  />
                ) : event.media_type === 'audio' ? (
                  <audio
                    src={event.media_url}
                    controls
                    style={{ width: '100%' }}
                  />
                ) : (
                  <img
                    src={event.media_url}
                    alt={event.title}
                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                  />
                )}
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>

            {event.tags && event.tags.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {event.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: `${color}20`,
                      color: color,
                      '&:hover': { bgcolor: `${color}30` }
                    }}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        );

      case EVENT_TYPES.REMARK:
      default:
        return (
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 500,
                  color: color,
                }}
              >
                {event.title}
              </Typography>
              {event.author && (
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  by <span style={{ fontWeight: 500, color: color }}>{event.author}</span>
                </Typography>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>

            {event.tags && event.tags.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {event.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: `${color}20`,
                      color: color,
                      '&:hover': { bgcolor: `${color}30` }
                    }}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        );
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        mt: 3,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Event List
        </Typography>
        
        {/* Search and Filters */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Stack direction="row" spacing={1}>
            {Object.values(EVENT_TYPES).map((type) => (
              <Chip
                key={type}
                label={type}
                icon={getEventTypeIcon(type)}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                color={selectedType === type ? "primary" : "default"}
                sx={{
                  '&:hover': {
                    bgcolor: `${getEventColor(type)}20`,
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Event Cards */}
      <Stack spacing={2}>
        {filteredEvents.map((event) => {
          const color = getEventColor(event.type);
          const isSelected = selectedEventId === event.id;

          return (
            <Card
              key={event.id}
              sx={{
                position: 'relative',
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.01)',
                  boxShadow: `0 0 0 1px ${color}`,
                },
                ...(isSelected && {
                  boxShadow: `0 0 0 2px ${color}`,
                }),
              }}
            >
              <CardActionArea 
                onClick={() => onEventSelect(event)}
                sx={{ 
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'transparent',
                  },
                }}
              >
                {/* Event Type Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 0,
                    height: 24,
                    bgcolor: color,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    zIndex: 2,
                  }}
                >
                  <Box sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                    {getEventTypeIcon(event.type)}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500 }}>
                    {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>

                {renderEventContent(event)}
              </CardActionArea>

              {/* Action Buttons */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 2,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Tooltip title="Edit Event">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventEdit(event);
                    }}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                      color: color,
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Event">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventDelete(event);
                    }}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: theme.palette.error.main,
                        color: '#fff',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default EventList;
