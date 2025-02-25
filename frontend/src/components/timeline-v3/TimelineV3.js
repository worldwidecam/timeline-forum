import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, useTheme, Button, Fade, Stack, Typography, Fab, Tooltip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import TimelineBackground from './TimelineBackground';
import TimelineBar from './TimelineBar';
import TimeMarkers from './TimeMarkers';
import HoverMarker from './HoverMarker';
import EventMarker from './events/EventMarker';
import EventCounter from './events/EventCounter';
import EventList from './events/EventList';
import EventDialog from './events/EventDialog';
import AddIcon from '@mui/icons-material/Add';

const API_BASE_URL = '/api';

function TimelineV3() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [timelineId, setTimelineId] = useState(id);
  const [timelineName, setTimelineName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch timeline details when component mounts or timelineId changes
  useEffect(() => {
    const fetchTimelineDetails = async () => {
      if (!timelineId || timelineId === 'new') return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/api/timeline-v3/${timelineId}`);
        if (response.data && response.data.name) {
          setTimelineName(response.data.name);
        }
      } catch (error) {
        console.error('Error fetching timeline details:', error);
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);  // Scroll to the top of the page
      }
    };

    // First try to get name from URL params (for newly created timelines)
    const params = new URLSearchParams(window.location.search);
    const nameFromUrl = params.get('name');
    if (nameFromUrl) {
      setTimelineName(nameFromUrl);
      setIsLoading(false);
    } else {
      // If no name in URL, fetch from backend
      fetchTimelineDetails();
    }
  }, [timelineId]);

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
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Add new state for events and event form
  const [events, setEvents] = useState([]);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [isRecentering, setIsRecentering] = useState(false);
  const [isFullyFaded, setIsFullyFaded] = useState(false);

  const handleEventSelect = (event) => {
    setSelectedEventId(event.id);
  };

  const handleDotClick = (event) => {
    console.log('Dot clicked for event:', event); // Debug log
    setSelectedEventId(event.id);
  };

  // Fetch events when timeline ID changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!timelineId || timelineId === 'new') return;
      
      try {
        setIsLoadingEvents(true);
        console.log('Fetching events for timeline:', timelineId);
        const response = await api.get(`/api/timeline-v3/${timelineId}/events`);
        console.log('Events response:', response.data);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [timelineId]);

  // Create timeline when component mounts
  useEffect(() => {
    const createTimeline = async () => {
      try {
        // Get timeline name from URL parameters
        const params = new URLSearchParams(window.location.search);
        const timelineName = params.get('name') || 'Timeline V3';
        
        const response = await api.post('/api/timeline-v3', {
          name: timelineName,
          description: `A new timeline created: ${timelineName}`
        });
        setTimelineId(response.data.id);
        console.log('Timeline created:', response.data);
      } catch (error) {
        console.error('Error creating timeline:', error);
      }
    };
    
    if (!timelineId) {
      createTimeline();
    }
  }, [timelineId]);

  const handleEventSubmit = async (eventData) => {
    let mediaUrl = null; // Define mediaUrl here
    try {
      console.log('Sending event creation request to:', `/api/timeline-v3/${timelineId}/events`);
      const response = await api.post(`/api/timeline-v3/${timelineId}/events`, {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        type: eventData.type,
        url: eventData.url || '',
        url_title: eventData.url_title || '',
        url_description: eventData.url_description || '',
        url_image: eventData.url_image || '',
        url_source: eventData.url_source || '',
        media_url: mediaUrl || '',
        media_type: eventData.media ? eventData.media.type.split('/')[0] : '',
        tags: eventData.tags || []
      });
      console.log('Event creation response:', response.data);

      // Add the new event to state and close form
      const newEvent = response.data;
      setEvents(prev => [...prev, newEvent]);
      setDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      setSubmitError(error.response?.data?.error || 'Failed to create event');
      throw error;
    }
  };

  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleEventDelete = async (event) => {
    try {
      await api.delete(`/api/timeline-v3/${timelineId}/events/${event.id}`);
      setEvents(events.filter(e => e.id !== event.id));
      if (selectedEventId === event.id) {
        setSelectedEventId(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      // Keep the event in the UI if deletion fails
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

  // Reset current event index when switching views
  useEffect(() => {
    if (viewMode !== 'position') {
      setCurrentEventIndex(0);
      setSelectedEventId(null);
    }
  }, [viewMode]);

  // Reset current event index if it's out of bounds after events change
  useEffect(() => {
    if (currentEventIndex >= events.length) {
      setCurrentEventIndex(Math.max(0, events.length - 1));
    }
  }, [events.length, currentEventIndex]);

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
    setIsRecentering(true);

    // Wait for fade out to complete
    setTimeout(() => {
      setIsFullyFaded(true);
      
      // Reset timeline offset and markers
      setTimelineOffset(0);
      setMarkers(getInitialMarkers());
      
      // Update URL without page reload
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('view', viewMode);
      navigate(`/timeline-v3/${timelineId}?${searchParams.toString()}`, { replace: true });

      // Start fade in animation after a short delay
      setTimeout(() => {
        setIsFullyFaded(false);
        setTimeout(() => {
          setIsRecentering(false);
        }, 50);
      }, 100);
    }, 400); // Match the transition duration
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

  const timelineTransitionStyles = {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isRecentering ? 0 : 1,
    transform: `
      translate3d(0, 0, 0)
      scale(${isRecentering ? '0.98' : '1'})
      ${isFullyFaded ? 'translateY(-10px)' : 'translateY(0)'}
    `,
    pointerEvents: isRecentering ? 'none' : 'auto',
    willChange: 'transform, opacity'
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
              <Typography variant="h4" component="div" sx={{ color: theme.palette.primary.main, minWidth: '200px' }}>
                {!isLoading && `# ${timelineName}`}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getViewDescription()}
              </Box>
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  setDialogOpen(true);
                }}
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
            overflow: 'hidden',
            ...timelineTransitionStyles
          }}
        >
          <TimelineBackground />
          <TimelineBar
            timelineOffset={timelineOffset}
            markerSpacing={100}
            minMarker={Math.min(...markers)}
            maxMarker={Math.max(...markers)}
            theme={theme}
            style={timelineTransitionStyles}
          />
          {viewMode === 'position' && (
            <EventCounter
              count={events.length}
              events={events}
              currentIndex={currentEventIndex}
              onChangeIndex={setCurrentEventIndex}
              onDotClick={handleDotClick}
              viewMode={viewMode}
              style={timelineTransitionStyles}
            />
          )}
          {/* Event Markers - only show in time-based views */}
          {viewMode !== 'position' && events.map((event, index) => (
            <EventMarker
              key={event.id}
              event={event}
              timelineOffset={timelineOffset}
              markerSpacing={100}
              viewMode={viewMode}
              index={index}
              totalEvents={events.length}
              style={timelineTransitionStyles}
            />
          ))}
          <TimeMarkers 
            timelineOffset={timelineOffset}
            markerSpacing={100}
            markerStyles={markerStyles}
            markers={markers}
            viewMode={viewMode}
            theme={theme}
            style={timelineTransitionStyles}
          />
          <HoverMarker 
            position={hoverPosition} 
            timelineOffset={timelineOffset}
            markerSpacing={100}
            viewMode={viewMode}
            markers={markers}
            theme={theme}
            style={timelineTransitionStyles}
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
      <Box sx={{ mt: 4 }}>
        <EventList 
          events={events}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
          selectedEventId={selectedEventId}
          onEventSelect={handleEventSelect}
        />
      </Box>

      {/* Event Dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEventSubmit}
        initialEvent={editingEvent}
      />

      {/* Floating Action Button */}
      <Tooltip title="Create New Event">
        <Fab
          color="primary"
          onClick={() => {
            setEditingEvent(null);
            setDialogOpen(true);
          }}
          sx={{
            position: 'fixed',
            right: 32,
            bottom: 32,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}

export default TimelineV3;
