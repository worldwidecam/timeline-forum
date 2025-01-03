import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogContent,
  useTheme,
  IconButton
} from '@mui/material';
import { format, addHours, subHours, isSameHour } from 'date-fns';
import axios from 'axios';
import EventDisplay from './EventDisplay';
import TimelinePosts from './TimelinePosts';
import { useAuth } from '../contexts/AuthContext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function TimelineView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [timelineInfo, setTimelineInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRows, setEventRows] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [zoomLevel, setZoomLevel] = useState('month'); // 'day', 'week', 'month', 'year'
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0); // Track our base position
  const [visibleTimeRange, setVisibleTimeRange] = useState({
    start: null,
    end: null
  });
  const [timeMarkers, setTimeMarkers] = useState([]);
  const [bufferMarkers, setBufferMarkers] = useState({
    before: [],
    after: []
  });
  const timelineRef = useRef(null);

  const BUFFER_HOURS = 24; // Hours of markers to keep in buffer
  const MARKER_SPACING = 100; // Pixels between each hour marker
  const HOURS_PER_SIDE = 24; // 24 hours worth of markers on each side
  const TIMELINE_BASE_WIDTH = MARKER_SPACING * (HOURS_PER_SIDE * 2 + 1); // Total width including both sides and center
  const SCROLL_AMOUNT = MARKER_SPACING; // One hour per scroll
  const HOURS_TO_ADD = 6; // Reduce the number of hours added each time to maintain better control

  useEffect(() => {
    // Initialize timeline with current time centered and full day padding on both sides
    const now = new Date();
    const startTime = subHours(now, HOURS_PER_SIDE); // 24 hours before
    const endTime = addHours(now, HOURS_PER_SIDE); // 24 hours after
    
    setVisibleTimeRange({
      start: startTime,
      end: endTime,
      now: now
    });

    // Generate all markers for the 48-hour range (24 before + current + 24 after)
    const initialMarkers = [];
    let currentTime = new Date(startTime);
    
    while (currentTime <= endTime) {
      const hourDiff = (currentTime - startTime) / (1000 * 60 * 60);
      initialMarkers.push({
        time: new Date(currentTime),
        position: hourDiff * MARKER_SPACING,
        label: format(currentTime, 'ha'),
        isPresent: isSameHour(currentTime, now)
      });
      currentTime = addHours(currentTime, 1);
    }
    
    setTimeMarkers(initialMarkers);
    
    // Center the timeline
    const centerOffset = (TIMELINE_BASE_WIDTH / 2) - (window.innerWidth / 2);
    setTimelineOffset(-centerOffset);
    setBaseOffset(-centerOffset);
  }, []);

  const generateBufferMarkers = (start, end) => {
    const before = [];
    const after = [];
    
    // Generate buffer before visible range
    let time = new Date(start);
    for (let i = 0; i < BUFFER_HOURS; i++) {
      time = addHours(time, -1);
      before.unshift({
        time: new Date(time),
        label: format(time, 'ha')
      });
    }
    
    // Generate buffer after visible range
    time = new Date(end);
    for (let i = 0; i < BUFFER_HOURS; i++) {
      time = addHours(time, 1);
      after.push({
        time: new Date(time),
        label: format(time, 'ha')
      });
    }
    
    return { before, after };
  };

  const generateInitialMarkers = (range) => {
    if (!range || !range.start || !range.end || !range.now) return [];
    
    const markers = [];
    let currentTime = new Date(range.start);
    
    // Add extra markers before the start time
    let extraStart = addHours(currentTime, -12); // Add 12 hours before
    while (extraStart < currentTime) {
      markers.push({
        time: new Date(extraStart),
        position: calculateMarkerPosition(extraStart, range),
        label: format(extraStart, 'ha'),
        isPresent: isSameHour(extraStart, range.now)
      });
      extraStart = addHours(extraStart, 1);
    }
    
    // Add regular markers
    while (currentTime <= range.end) {
      markers.push({
        time: new Date(currentTime),
        position: calculateMarkerPosition(currentTime, range),
        label: format(currentTime, 'ha'),
        isPresent: isSameHour(currentTime, range.now)
      });
      currentTime = addHours(currentTime, 1);
    }
    
    return markers;
  };

  const getTimelineBoundaries = () => {
    const now = new Date('2025-01-02T16:32:56-08:00');
    
    // Calculate how many hours we can show based on timeline width
    const timelineWidth = TIMELINE_BASE_WIDTH;
    const markerSpacing = MARKER_SPACING;
    const visibleHours = Math.floor((timelineWidth * 0.94) / markerSpacing);
    const hoursOnEachSide = Math.floor(visibleHours / 2);
    
    // Center the current time
    const start = addHours(now, -hoursOnEachSide);
    const end = addHours(now, hoursOnEachSide);
    
    return { 
      start: new Date(start.setMinutes(0, 0, 0)), 
      end: new Date(end.setMinutes(59, 59, 999)),
      now 
    };
  };

  const calculateMarkerPosition = (date, range) => {
    if (!date || !range || !range.start || !range.end) return 0;
    
    const current = new Date(date);
    const start = new Date(range.start);
    
    // Calculate position based on exact hour difference
    const hoursDiff = (current - start) / (1000 * 60 * 60);
    const position = hoursDiff * MARKER_SPACING;
    
    console.log('Position calculation:', {
      time: current.toLocaleTimeString(),
      startTime: start.toLocaleTimeString(),
      hoursDiff,
      position
    });
    
    return position;
  };

  const extendTimeRange = (direction) => {
    setVisibleTimeRange(prev => {
      const newRange = { ...prev };
      const hoursToAdd = direction < 0 ? -HOURS_PER_SIDE : HOURS_PER_SIDE;
      
      if (direction < 0) {
        newRange.start = addHours(prev.start, hoursToAdd);
      } else {
        newRange.end = addHours(prev.end, hoursToAdd);
      }

      setTimeMarkers(prevMarkers => {
        const newMarkers = [];
        let currentTime;
        
        if (direction < 0) {
          // Add 24 new hours of markers to the left
          currentTime = new Date(newRange.start);
          while (currentTime < prev.start) {
            const hourDiff = (currentTime - newRange.start) / (1000 * 60 * 60);
            newMarkers.push({
              time: new Date(currentTime),
              position: hourDiff * MARKER_SPACING,
              label: format(currentTime, 'ha'),
              isPresent: isSameHour(currentTime, newRange.now)
            });
            currentTime = addHours(currentTime, 1);
          }
        } else {
          // Add 24 new hours of markers to the right
          currentTime = addHours(prev.end, 1);
          while (currentTime <= newRange.end) {
            const hourDiff = (currentTime - newRange.start) / (1000 * 60 * 60);
            newMarkers.push({
              time: new Date(currentTime),
              position: hourDiff * MARKER_SPACING,
              label: format(currentTime, 'ha'),
              isPresent: isSameHour(currentTime, newRange.now)
            });
            currentTime = addHours(currentTime, 1);
          }
        }

        // Update positions of existing markers relative to new start time
        const updatedMarkers = prevMarkers.map(marker => {
          const hourDiff = (marker.time - newRange.start) / (1000 * 60 * 60);
          return {
            ...marker,
            position: hourDiff * MARKER_SPACING
          };
        });

        return direction < 0 
          ? [...newMarkers, ...updatedMarkers]
          : [...updatedMarkers, ...newMarkers];
      });
      
      return newRange;
    });
  };

  const handleScroll = (direction) => {
    const newOffset = timelineOffset - (direction * SCROLL_AMOUNT);
    setTimelineOffset(newOffset);
    
    // When we've scrolled 12 hours worth, extend the timeline
    const extensionThreshold = MARKER_SPACING * 12;
    if (Math.abs(newOffset - baseOffset) > extensionThreshold) {
      extendTimeRange(direction);
      setBaseOffset(newOffset);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX - timelineOffset);
    e.preventDefault(); // Prevent text selection
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    handleScroll(deltaX);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchTimelineInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/timeline/${id}`);
        setTimelineInfo(response.data);
      } catch (error) {
        console.error('Error fetching timeline info:', error);
      }
    };

    fetchTimelineInfo();
  }, [id]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/timeline/${id}/events`);
        const sortedEvents = response.data.sort((a, b) => 
          new Date(a.event_date) - new Date(b.event_date)
        );
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [id]);

  useEffect(() => {
    // Calculate rows for events to prevent overlapping
    const calculateEventRows = () => {
      const rows = {};
      const timeBuffer = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      
      sortedEvents.forEach((event) => {
        const eventDate = new Date(event.event_date).getTime();
        let row = 0;
        
        // Find the first row where this event won't overlap with others
        while (true) {
          const eventsInRow = Object.entries(rows).filter(([, r]) => r === row);
          const hasOverlap = eventsInRow.some(([id]) => {
            const otherEvent = events.find(e => e.id.toString() === id);
            const otherDate = new Date(otherEvent.event_date).getTime();
            return Math.abs(eventDate - otherDate) < timeBuffer;
          });
          
          if (!hasOverlap) {
            rows[event.id] = row;
            break;
          }
          row++;
        }
      });
      
      setEventRows(rows);
    };

    calculateEventRows();
  }, [events]);

  const addHours = (date, hours) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  };

  const isSameHour = (date1, date2) => {
    if (!date1 || !date2) return false;
    return new Date(date1).getHours() === new Date(date2).getHours();
  };

  const presentDayStyles = {
    position: 'absolute',
    top: '-55px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'float 2s ease-in-out infinite',
    zIndex: 3,
    '& .marker-label': {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    '& .marker-arrow': {
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: `8px solid ${theme.palette.primary.main}`,
    },
    '& .marker-line': {
      width: '2px',
      height: '15px',
      background: `linear-gradient(to bottom, ${theme.palette.primary.main}, transparent)`
    }
  };

  const globalStyles = {
    '@keyframes float': {
      '0%, 100%': {
        transform: 'translateY(0)',
      },
      '50%': {
        transform: 'translateY(-5px)',
      },
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
  };

  const handleEditEvent = (event) => {
    // Navigate to edit page
    navigate(`/timeline/${id}/event/${event.id}/edit`);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`http://localhost:5000/api/event/${eventId}`);
      // Refresh events
      const response = await axios.get(`http://localhost:5000/api/timeline/${id}/events`);
      setEvents(response.data);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'auto', 
      bgcolor: theme.palette.mode === 'light' ? 'background.default' : '#000',
      overflowX: 'hidden' // Hide overflow
    }}>
      <Box sx={{ 
        width: '100%',
        position: 'relative',
        bgcolor: theme.palette.mode === 'light' ? 'background.paper' : '#2c1b47',
        color: theme.palette.mode === 'light' ? 'text.primary' : '#fff',
        minHeight: 'auto', 
        paddingBottom: '20px', 
        overflowX: 'hidden' 
      }}>
        <Container maxWidth={false} sx={{ 
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: '100vw', 
          overflowX: 'hidden' 
        }}>
          <Box my={4}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  <Box component="span" sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'light' ? 'primary.main' : '#ce93d8',
                    mr: 1
                  }}>
                    #
                  </Box>
                  {timelineInfo?.name || 'Loading...'}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Timeline View
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  bgcolor: theme.palette.mode === 'light' ? 'background.paper' : '#2c1b47',
                  borderRadius: '20px',
                  padding: '4px',
                  border: theme.palette.mode === 'light' 
                    ? `1px solid ${theme.palette.primary.main}` 
                    : `1px solid #ce93d8`
                }}>
                  {['day', 'week', 'month', 'year'].map((level) => (
                    <Button
                      key={level}
                      size="small"
                      onClick={() => setZoomLevel(level)}
                      sx={{
                        minWidth: '60px',
                        color: zoomLevel === level ? '#fff' : theme.palette.mode === 'light' ? 'primary.main' : '#ce93d8',
                        backgroundColor: zoomLevel === level ? theme.palette.mode === 'light' ? 'primary.main' : '#9c27b0' : 'transparent',
                        borderRadius: '16px',
                        textTransform: 'capitalize',
                        '&:hover': {
                          backgroundColor: zoomLevel === level ? theme.palette.mode === 'light' ? 'primary.main' : '#9c27b0' : 'rgba(156, 39, 176, 0.1)'
                        }
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </Box>
                {user ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/timeline/${id}/event/create`)}
                  >
                    Create Event
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/login"
                    sx={{ color: '#fff' }}
                  >
                    Login to Create Event
                  </Button>
                )}
              </Box>
            </Box>

            {/* Timeline Container */}
            <Box 
              ref={timelineRef}
              className="timeline-scroll-container"
              sx={{
                width: '100%',
                overflowX: 'hidden',
                overflowY: 'visible',
                position: 'relative',
                height: '300px',
                minHeight: 'auto', 
                mt: 2,
                mb: 2
              }}
            >
              {/* Timeline Container with Navigation Endpoints */}
              <Box sx={{
                position: 'relative',
                width: '100%',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Left Navigation */}
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2
                }}>
                  <Typography variant="caption" sx={{ mb: 1 }}>Earlier</Typography>
                  <IconButton onClick={() => handleScroll(-1)} size="small">
                    <NavigateBeforeIcon />
                  </IconButton>
                </Box>

                {/* Timeline Content */}
                <Box sx={{
                  position: 'relative',
                  width: 'calc(100% - 80px)',
                  margin: '0 40px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}>
                  {/* Timeline Bar */}
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    height: '2px',
                    backgroundColor: theme.palette.primary.main,
                    transform: `translateX(${timelineOffset}px)`,
                    transition: 'transform 0.1s ease-out',
                    width: TIMELINE_BASE_WIDTH
                  }} />

                  {/* Time Markers Container */}
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    transform: `translateX(${timelineOffset}px)`,
                    transition: 'transform 0.1s ease-out',
                    width: TIMELINE_BASE_WIDTH,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {timeMarkers.map((marker, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'absolute',
                          left: `${marker.position}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <Typography variant="caption" sx={{ mb: 1 }}>{marker.label}</Typography>
                        <Box
                          sx={{
                            width: '2px',
                            height: '10px',
                            backgroundColor: marker.isPresent ? theme.palette.secondary.main : theme.palette.text.secondary
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Right Navigation */}
                <Box sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2
                }}>
                  <Typography variant="caption" sx={{ mb: 1 }}>Later</Typography>
                  <IconButton onClick={() => handleScroll(1)} size="small">
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            {/* Timeline Posts */}
            <Box sx={{ backgroundColor: theme.palette.mode === 'light' ? 'background.default' : '#121212', py: 4 }}>
              <Container maxWidth="lg">
                <TimelinePosts timelineId={id} />
              </Container>
            </Box>
            {/* Event Dialog */}
            <Dialog
              open={Boolean(selectedEvent)}
              onClose={handleCloseEventDialog}
              maxWidth="md"
              fullWidth
            >
              <DialogContent>
                {selectedEvent && (
                  <EventDisplay
                    event={selectedEvent}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    currentUserId={1} // TODO: Replace with actual logged-in user ID
                  />
                )}
              </DialogContent>
            </Dialog>
            {/* Black space section */}
            <Box sx={{ 
              flex: 1,
              backgroundColor: theme.palette.mode === 'light' ? 'background.default' : '#000',
              width: '100%',
              minHeight: '50vh' 
            }} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default TimelineView;
