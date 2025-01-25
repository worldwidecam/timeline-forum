import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, useTheme, Button, Fade, Stack, Typography, Fab, Tooltip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
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
  const { user } = useAuth();
  const theme = useTheme();
  const [timelineId, setTimelineId] = useState(id);
  const [timelineName, setTimelineName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch timeline details when component mounts or timelineId changes
  useEffect(() => {
    const fetchTimelineDetails = async () => {
      if (!timelineId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/timeline-v3/${timelineId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTimelineName(response.data.name);
      } catch (error) {
        console.error('Error fetching timeline details:', error);
      } finally {
        setIsLoading(false);
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

  // Add new state for events and event form
  const [events, setEvents] = useState([]);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch events whenever timelineId changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!timelineId) return;
      
      try {
        setIsLoadingEvents(true);
        console.log('Fetching events for timeline:', timelineId);
        const response = await axios.get(`${API_BASE_URL}/timeline-v3/${timelineId}/events`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
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
        
        const response = await axios.post(`${API_BASE_URL}/timeline-v3`, {
          name: timelineName,
          description: `A new timeline created: ${timelineName}`
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
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
        const uploadResponse = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Media upload response:', uploadResponse.data);
        mediaUrl = uploadResponse.data.url;
      }

      // Create the event
      console.log('Sending event creation request to:', `${API_BASE_URL}/timeline-v3/${timelineId}/events`);
      const response = await axios.post(`${API_BASE_URL}/timeline-v3/${timelineId}/events`, {
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

  const handleEventSelect = (event) => {
    setSelectedEventId(event.id);
  };

  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleEventDelete = (event) => {
    setEvents(events.filter(e => e.id !== event.id));
    if (selectedEventId === event.id) {
      setSelectedEventId(null);
    }
  };

  const handleEventSave = async (eventData) => {
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...eventData }
          : event
      ));
      setEditingEvent(null);
    } else {
      // Create new event
      const newEvent = {
        id: Date.now(), // temporary ID generation
        ...eventData
      };
      setEvents([...events, newEvent]);
    }
    setDialogOpen(false);
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

  const [currentEventIndex, setCurrentEventIndex] = useState(0);

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

  const handleDotClick = (event) => {
    setSelectedEventId(event.id);
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
            overflow: 'hidden'
          }}
        >
          <TimelineBackground />
          
          {/* Event Counter with Carousel */}
          <EventCounter 
            count={events.length} 
            events={events}
            currentIndex={currentEventIndex}
            onChangeIndex={setCurrentEventIndex}
            onDotClick={handleDotClick}
            viewMode={viewMode}
          />

          <TimelineBar
            timelineOffset={timelineOffset}
            markerSpacing={100}
            minMarker={Math.min(...markers)}
            maxMarker={Math.max(...markers)}
            theme={theme}
          />

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
        <EventList 
          events={events}
          selectedEventId={selectedEventId}
          onEventSelect={handleEventSelect}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
        />
      </Container>

      {/* Event Dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEvent(null);
        }}
        onSave={async (eventData) => {
          try {
            if (editingEvent) {
              // Update existing event
              const response = await axios.put(`/api/timeline-v3/${timelineId}/events/${editingEvent.id}`, {
                ...eventData,
                timeline_id: timelineId
              }, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              setEvents(events.map(event => 
                event.id === editingEvent.id 
                  ? response.data
                  : event
              ));
              setEditingEvent(null);
            } else {
              // Handle media upload first if present
              let mediaUrl = null;
              if (eventData.mediaFile) {
                const formData = new FormData();
                formData.append('file', eventData.mediaFile);
                const uploadResponse = await axios.post('/api/upload', formData, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                  }
                });
                mediaUrl = uploadResponse.data.url;
              }

              // Create new event
              const response = await axios.post(`/api/timeline-v3/${timelineId}/events`, {
                ...eventData,
                media_url: mediaUrl,
                timeline_id: timelineId
              }, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              setEvents(prev => [...prev, response.data]);
            }
            setDialogOpen(false);
          } catch (error) {
            console.error('Error saving event:', error);
            setSubmitError(error.response?.data?.message || 'Error saving event');
          }
        }}
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
