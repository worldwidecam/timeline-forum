import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, useTheme, Button, Fade, Stack, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import TimelineBackground from './TimelineBackground';
import TimelineBar from './TimelineBar';
import TimeMarkers from './TimeMarkers';
import HoverMarker from './HoverMarker';
import EventForm from './events/EventForm';
import TimelineEvent from './events/TimelineEvent';
import EventMarker from './events/EventMarker';
import EventCounter from './events/EventCounter';
import EventList from './events/EventList';
import AddIcon from '@mui/icons-material/Add';

function TimelineV3() {
  const { id } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const [timelineId, setTimelineId] = useState(id);
  const [timelineName, setTimelineName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name) {
      setTimelineName(name);
    }
  }, []);

  const getCurrentDateTime = () => {
    return new Date();
  };

  const getInitialMarkers = () => {
    const markerSpacing = 100; // pixels between each marker
    const screenWidth = window.innerWidth;
    const markersNeeded = Math.ceil(screenWidth / markerSpacing);
    // We want equal numbers on each side of zero, so we'll make it odd
    const totalMarkers = markersNeeded + (markersNeeded % 2 === 0 ? 1 : 0);
    const sideCount = Math.floor(totalMarkers / 2);
    
    return Array.from(
      { length: totalMarkers }, 
      (_, i) => i - sideCount
    );
  };

  const getDayProgress = () => {
    const now = getCurrentDateTime();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes / (24 * 60); // Returns a value between 0 and 1
  };

  const getMonthProgress = () => {
    const now = getCurrentDateTime();
    const currentDay = now.getDate();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return (currentDay - 1) / totalDays; // Returns a value between 0 and 1
  };

  const getYearProgress = () => {
    const now = getCurrentDateTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now - startOfYear;
    const oneYear = 1000 * 60 * 60 * 24 * 365; // milliseconds in a year
    return diff / oneYear; // Returns a value between 0 and 1
  };

  const getExactTimePosition = () => {
    const now = getCurrentDateTime();
    
    if (viewMode === 'year') {
      return getYearProgress();
    }
    
    if (viewMode === 'month') {
      return getMonthProgress();
    }
    
    if (viewMode === 'week') {
      return getDayProgress();
    }
    
    // Day view - Calculate position relative to current hour
    const currentMinute = now.getMinutes();
    return currentMinute / 60; // Returns a value between 0 and 1
  };

  const getFormattedDate = () => {
    const now = getCurrentDateTime();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getViewDescription = () => {
    if (viewMode === 'day') {
      return (
        <>
          <Typography variant="subtitle1" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Day View
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="span">
            {getFormattedDate()}
          </Typography>
        </>
      );
    }
    if (viewMode === 'week') {
      return (
        <>
          <Typography variant="subtitle1" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Week View
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="span">
            {getFormattedDate()}
          </Typography>
        </>
      );
    }
    if (viewMode === 'month') {
      return (
        <>
          <Typography variant="subtitle1" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Month View
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="span">
            {getFormattedDate()}
          </Typography>
        </>
      );
    }
    if (viewMode === 'year') {
      return (
        <>
          <Typography variant="subtitle1" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Year View
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="span">
            {getFormattedDate()}
          </Typography>
        </>
      );
    }
    return (
      <>
        <Typography variant="subtitle1" color="text.secondary" component="span" sx={{ mr: 1 }}>
          Coordinate View
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="span">
          Reference point is position 0
        </Typography>
      </>
    );
  };

  // Core state
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [markers, setMarkers] = useState(getInitialMarkers());
  const [viewMode, setViewMode] = useState(() => {
    // Get view mode from URL or default to 'day'
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'day';
  });
  const [hoverPosition, setHoverPosition] = useState(getExactTimePosition());

  // Add new state for events and event form
  const [events, setEvents] = useState([]);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [timelineCreated, setTimelineCreated] = useState(false);

  // Create timeline when component mounts
  useEffect(() => {
    const createTimeline = async () => {
      try {
        // Get timeline name from URL parameters
        const params = new URLSearchParams(window.location.search);
        const timelineName = params.get('name') || 'Timeline V3';
        
        const response = await axios.post('/api/timeline-v3', {
          name: timelineName,
          description: `A new timeline created: ${timelineName}`
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTimelineId(response.data.id);
        setTimelineCreated(true);
        console.log('Timeline created:', response.data);
      } catch (error) {
        console.error('Error creating timeline:', error);
      }
    };
    
    if (!timelineId) {
      createTimeline();
    }
  }, [timelineId]);

  // Fetch events when timeline loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Fetching events for timeline:', timelineId);
        const response = await axios.get(`/api/timeline-v3/${timelineId}/events`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Events response:', response.data);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    if (timelineId && timelineCreated) {
      fetchEvents();
    }
  }, [timelineId, timelineCreated]);

  const handleEventSubmit = async (eventData) => {
    if (!timelineId) {
      throw new Error('Timeline ID is required');
    }

    try {
      setSubmitError(null);
      console.log('Creating event with data:', eventData);
      console.log('Timeline ID:', timelineId);
      console.log('Auth token:', localStorage.getItem('token'));
      
      // If there's a media file, upload it first
      let mediaUrl = null;
      if (eventData.media) {
        const formData = new FormData();
        formData.append('file', eventData.media);
        
        console.log('Uploading media file:', eventData.media);
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Media upload response:', uploadResponse.data);
        mediaUrl = uploadResponse.data.url;
      }

      // Create the event
      console.log('Sending event creation request to:', `/api/timeline-v3/${timelineId}/events`);
      const response = await axios.post(`/api/timeline-v3/${timelineId}/events`, {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        url: eventData.url || '',
        media_url: mediaUrl || '',
        media_type: eventData.media ? eventData.media.type.split('/')[0] : '',
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Event creation response:', response.data);

      // Add the new event to state and close form
      const newEvent = response.data;
      setEvents(prev => [...prev, newEvent]);
      setIsEventFormOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      setSubmitError(error.response?.data?.error || 'Failed to create event');
      throw error;
    }
  };

  // Update hover position when view mode changes
  useEffect(() => {
    setHoverPosition(getExactTimePosition());
  }, [viewMode]);

  // Update hover position every minute
  useEffect(() => {
    if (viewMode === 'day') {
      const interval = setInterval(() => {
        setHoverPosition(getExactTimePosition());
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  // Update markers on window resize
  useEffect(() => {
    const handleResize = () => {
      // Only update if we're centered (timelineOffset === 0)
      if (timelineOffset === 0) {
        setMarkers(getInitialMarkers());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [timelineOffset]);

  // Navigation functions
  const handleLeft = () => {
    const minMarker = Math.min(...markers);
    setMarkers([...markers, minMarker - 1]);
    setTimelineOffset(timelineOffset + 100);
  };

  const handleRight = () => {
    const maxMarker = Math.max(...markers);
    setMarkers([...markers, maxMarker + 1]);
    setTimelineOffset(timelineOffset - 100);
  };

  const handleRecenter = () => {
    // Trigger fade out
    const transitionElement = document.querySelector('.MuiFade-root');
    if (transitionElement) {
      transitionElement.style.opacity = '0';
    }

    // Wait for fade out before redirecting
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('view', viewMode);
      window.location.href = url.toString();
    }, 300); // Half of the total transition time
  };

  // Marker styles
  const markerStyles = {
    reference: {
      '& .marker-line': {
        height: '20px',
        width: '2px',
        backgroundColor: theme.palette.primary.main
      }
    },
    regular: {
      '& .marker-line': {
        height: '10px',
        width: '1px',
        backgroundColor: theme.palette.text.secondary
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '400px',
      bgcolor: theme.palette.mode === 'light' ? 'background.default' : '#000',
      overflowX: 'hidden',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      position: 'relative',
      mb: 3
    }}>
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" component="div" sx={{ color: theme.palette.primary.main }}>
                # {timelineName || 'Timeline V3'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getViewDescription()}
              </Box>
              <Button
                onClick={() => setIsEventFormOpen(true)}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.success.dark,
                  },
                  boxShadow: 2
                }}
              >
                Add Event
              </Button>
              <Fade in={timelineOffset !== 0}>
                <Button
                  onClick={handleRecenter}
                  variant="contained"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    boxShadow: 2
                  }}
                >
                  Back to Present
                </Button>
              </Fade>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant={viewMode === 'day' ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(viewMode === 'day' ? 'position' : 'day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(viewMode === 'week' ? 'position' : 'week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(viewMode === 'month' ? 'position' : 'month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'year' ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(viewMode === 'year' ? 'position' : 'year')}
            >
              Year
            </Button>
          </Stack>
        </Stack>
        
        <Box 
          sx={{
            width: '100%',
            height: '300px',
            bgcolor: theme.palette.mode === 'light' ? 'background.paper' : '#2c1b47',
            borderRadius: 2,
            boxShadow: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <TimelineBackground />
          <TimelineBar
            timelineOffset={timelineOffset}
            markerSpacing={100}
            minMarker={Math.min(...markers)}
            maxMarker={Math.max(...markers)}
            theme={theme}
          />
          
          {/* Event Counter - only show in base coordinate view */}
          {viewMode === 'position' && (
            <EventCounter count={events.length} />
          )}

          {/* Event Markers */}
          {events.map((event, index) => (
            <EventMarker
              key={event.id}
              event={event}
              position={index}
              timelineOffset={timelineOffset}
              markerSpacing={100}
              viewMode={viewMode}
              theme={theme}
            />
          ))}

          <TimeMarkers 
            timelineOffset={timelineOffset}
            markerSpacing={100}
            markerStyles={markerStyles}
            markers={markers}
            viewMode={viewMode}
            theme={theme}
          />
          <HoverMarker 
            position={hoverPosition}
            timelineOffset={timelineOffset}
            markerSpacing={100}
            viewMode={viewMode}
            markers={markers}
            theme={theme}
          />
          <Button
            onClick={handleLeft}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: 100,
              bgcolor: 'background.paper',
              zIndex: 2, // Higher z-index to stay above hover marker
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            LEFT
          </Button>
          <Button
            onClick={handleRight}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: 100,
              bgcolor: 'background.paper',
              zIndex: 2, // Higher z-index to stay above hover marker
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            RIGHT
          </Button>
        </Box>
      </Container>

      {/* Event List */}
      <Container maxWidth={false}>
        <EventList events={events} />
      </Container>

      {/* Event Creation Form */}
      <EventForm
        open={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        timelineId={timelineId}
        onEventCreated={(newEvent) => {
          setEvents(prev => [...prev, newEvent]);
          setIsEventFormOpen(false);
        }}
      />
    </Box>
  );
}

export default TimelineV3;
