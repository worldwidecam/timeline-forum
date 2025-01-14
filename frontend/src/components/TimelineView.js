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
import { format, addHours, subHours, isSameHour, startOfDay } from 'date-fns';
import axios from 'axios';
import EventDisplay from './EventDisplay';
import TimelinePosts from './TimelinePosts';
import { useAuth } from '../contexts/AuthContext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TimeMarkers from './timeline/TimeMarkers';
import TimelineNavigation from './timeline/TimelineNavigation';
import TimelineBar from './timeline/TimelineBar';
import TimelineHeader from './timeline/TimelineHeader';

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
  const [scrollClickCount, setScrollClickCount] = useState({ left: 0, right: 0 });
  const [isPresentVisible, setIsPresentVisible] = useState(true);
  const timelineRef = useRef(null);

  const BUFFER_HOURS = 24; // Hours of markers to keep in buffer
  const MARKER_SPACING = 100; // Pixels between each hour marker
  const HOURS_PER_SIDE = 24; // 24 hours worth of markers on each side
  const TIMELINE_BASE_WIDTH = MARKER_SPACING * (HOURS_PER_SIDE * 2 + 1); // Total width including both sides and center
  const SCROLL_AMOUNT = MARKER_SPACING; // One hour per scroll
  const CLICK_THRESHOLD = 5;
  const EXTENSION_STEP = 6; // Hours to add each time threshold is reached

  useEffect(() => {
    // Initialize timeline with current time centered and full day padding on both sides
    const now = new Date();
    
    // Calculate start time by going back to midnight of the previous day plus additional padding
    const startOfToday = startOfDay(now);
    const startTime = subHours(startOfToday, 24); // Start from midnight yesterday
    const endTime = addHours(startOfToday, 48); // End at midnight tomorrow
    
    setVisibleTimeRange({
      start: startTime,
      end: endTime,
      now: now
    });

    // Generate all markers for the 48-hour range
    const initialMarkers = [];
    let currentTime = new Date(startTime);
    
    while (currentTime <= endTime) {
      const hourDiff = (currentTime - startTime) / (1000 * 60 * 60);
      const isStartOfDay = currentTime.getHours() === 0;
      
      // Check if this is the current hour marker (immediately to the left of now)
      const nextHour = addHours(currentTime, 1);
      const isCurrentHour = currentTime <= now && nextHour > now;
      
      // Format day as "Friday the 3rd"
      const dayLabel = isStartOfDay 
        ? `${format(currentTime, 'EEEE')} the ${format(currentTime, 'do')}`
        : format(currentTime, 'ha');
      
      initialMarkers.push({
        time: new Date(currentTime),
        position: hourDiff * MARKER_SPACING,
        label: dayLabel,
        isPresent: isCurrentHour,
        isDay: isStartOfDay
      });
      currentTime = addHours(currentTime, 1);
    }
    
    setTimeMarkers(initialMarkers);
    
    // Calculate the exact position of current time
    const totalMinutes = (now - startTime) / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const currentTimePosition = totalHours * MARKER_SPACING;
    
    // Center the timeline on the current time position
    const centerOffset = currentTimePosition - (window.innerWidth / 2);
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
        isPresent: false
      });
      extraStart = addHours(extraStart, 1);
    }
    
    // Add regular markers
    while (currentTime <= range.end) {
      const isStartOfDay = currentTime.getHours() === 0;
      
      // Check if this is the current hour marker (immediately to the left of now)
      const nextHour = addHours(currentTime, 1);
      const isCurrentHour = currentTime <= range.now && nextHour > range.now;
      
      // Format day as "Friday the 3rd"
      const dayLabel = isStartOfDay 
        ? `${format(currentTime, 'EEEE')} the ${format(currentTime, 'do')}`
        : format(currentTime, 'ha');
      
      markers.push({
        time: new Date(currentTime),
        position: calculateMarkerPosition(currentTime, range),
        label: dayLabel,
        isPresent: isCurrentHour,
        isDay: isStartOfDay
      });
      currentTime = addHours(currentTime, 1);
    }
    
    return markers;
  };

  const getTimelineBoundaries = () => {
    const now = new Date();
    
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

  const calculateExactTimePosition = (date) => {
    if (!date || !visibleTimeRange.start) {
      console.log('Missing time data:', { date, startTime: visibleTimeRange.start });
      return 0;
    }
    
    // Calculate hours since start of timeline
    const startTime = visibleTimeRange.start;
    const totalMinutes = (date - startTime) / (1000 * 60);
    const totalHours = totalMinutes / 60;
    
    // Calculate position based on hours from start
    const position = totalHours * MARKER_SPACING;
    
    console.log('Position calculation:', {
      date: date.toLocaleTimeString(),
      startTime: startTime.toLocaleTimeString(),
      totalMinutes,
      totalHours,
      position
    });
    
    return position;
  };

  const extendTimeRange = (direction, hoursToAdd = HOURS_PER_SIDE) => {
    setVisibleTimeRange(prev => {
      const newRange = { ...prev };
      
      if (direction < 0) {
        newRange.start = addHours(prev.start, -hoursToAdd);
      } else {
        newRange.end = addHours(prev.end, hoursToAdd);
      }

      setTimeMarkers(prevMarkers => {
        const newMarkers = [];
        let currentTime;
        
        if (direction < 0) {
          // Add new hours of markers to the left
          currentTime = new Date(newRange.start);
          while (currentTime < prev.start) {
            const hourDiff = (currentTime - newRange.start) / (1000 * 60 * 60);
            const isStartOfDay = currentTime.getHours() === 0;
            
            const nextHour = addHours(currentTime, 1);
            const isCurrentHour = currentTime <= newRange.now && nextHour > newRange.now;
            
            const dayLabel = isStartOfDay 
              ? `${format(currentTime, 'EEEE')} the ${format(currentTime, 'do')}`
              : format(currentTime, 'ha');
            
            newMarkers.push({
              time: new Date(currentTime),
              position: hourDiff * MARKER_SPACING,
              label: dayLabel,
              isPresent: isCurrentHour,
              isDay: isStartOfDay
            });
            currentTime = addHours(currentTime, 1);
          }
        } else {
          // Add new hours of markers to the right
          currentTime = addHours(prev.end, 1);
          while (currentTime <= newRange.end) {
            const hourDiff = (currentTime - newRange.start) / (1000 * 60 * 60);
            const isStartOfDay = currentTime.getHours() === 0;
            
            const nextHour = addHours(currentTime, 1);
            const isCurrentHour = currentTime <= newRange.now && nextHour > newRange.now;
            
            const dayLabel = isStartOfDay 
              ? `${format(currentTime, 'EEEE')} the ${format(currentTime, 'do')}`
              : format(currentTime, 'ha');
            
            newMarkers.push({
              time: new Date(currentTime),
              position: hourDiff * MARKER_SPACING,
              label: dayLabel,
              isPresent: isCurrentHour,
              isDay: isStartOfDay
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
    
    // Update click count
    if (direction < 0) {
      setScrollClickCount(prev => ({
        ...prev,
        left: prev.left + 1
      }));
    } else {
      setScrollClickCount(prev => ({
        ...prev,
        right: prev.right + 1
      }));
    }

    // Check if we need to extend timeline
    const extensionThreshold = MARKER_SPACING * 12;
    if (Math.abs(newOffset - baseOffset) > extensionThreshold) {
      extendTimeRange(direction);
      setBaseOffset(newOffset);
    }

    // Check if we've reached the click threshold
    if (direction < 0 && scrollClickCount.left >= CLICK_THRESHOLD) {
      // Going backwards in time
      extendTimeRange(direction, EXTENSION_STEP);
      setScrollClickCount(prev => ({ ...prev, left: 0 }));
      
      // Adjust offset to maintain visual position
      const adjustedOffset = timelineOffset + (EXTENSION_STEP * MARKER_SPACING * direction);
      setTimelineOffset(adjustedOffset);
      setBaseOffset(adjustedOffset);
    } else if (direction > 0 && scrollClickCount.right >= CLICK_THRESHOLD) {
      // Going forwards in time
      extendTimeRange(direction, EXTENSION_STEP);
      setScrollClickCount(prev => ({ ...prev, right: 0 }));
      
      // No need to adjust offset when extending forward
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

  // Current time state for precise marker
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const newTime = new Date();
      setCurrentTime(newTime);
      
      // Update visible range with new current time
      setVisibleTimeRange(prev => ({
        ...prev,
        now: newTime
      }));

      // Update markers to reflect new current hour
      setTimeMarkers(prevMarkers => 
        prevMarkers.map(marker => {
          const nextHour = addHours(marker.time, 1);
          const isCurrentHour = marker.time <= newTime && nextHour > newTime;
          return {
            ...marker,
            isPresent: isCurrentHour
          };
        })
      );
    };

    // Update immediately and then every minute
    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    // Initialize timeline with current time centered and full day padding on both sides
    const now = new Date();
    
    // Calculate start time by going back to midnight of the previous day plus additional padding
    const startOfToday = startOfDay(now);
    const startTime = subHours(startOfToday, 24); // Start from midnight yesterday
    const endTime = addHours(startOfToday, 48); // End at midnight tomorrow
    
    setVisibleTimeRange({
      start: startTime,
      end: endTime,
      now: now
    });

    // Generate all markers for the 48-hour range
    const initialMarkers = [];
    let currentTime = new Date(startTime);
    
    while (currentTime <= endTime) {
      const hourDiff = (currentTime - startTime) / (1000 * 60 * 60);
      const isStartOfDay = currentTime.getHours() === 0;
      
      // Check if this is the current hour marker (immediately to the left of now)
      const nextHour = addHours(currentTime, 1);
      const isCurrentHour = currentTime <= now && nextHour > now;
      
      // Format day as "Friday the 3rd"
      const dayLabel = isStartOfDay 
        ? `${format(currentTime, 'EEEE')} the ${format(currentTime, 'do')}`
        : format(currentTime, 'ha');
      
      initialMarkers.push({
        time: new Date(currentTime),
        position: hourDiff * MARKER_SPACING,
        label: dayLabel,
        isPresent: isCurrentHour,
        isDay: isStartOfDay
      });
      currentTime = addHours(currentTime, 1);
    }
    
    setTimeMarkers(initialMarkers);
    
    // Calculate the exact position of current time
    const totalMinutes = (now - startTime) / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const currentTimePosition = totalHours * MARKER_SPACING;
    
    // Center the timeline on the current time position
    const centerOffset = currentTimePosition - (window.innerWidth / 2);
    setTimelineOffset(-centerOffset);
    setBaseOffset(-centerOffset);
  }, []);

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

  const checkPresentMarkerVisibility = () => {
    const now = new Date();
    const startTime = visibleTimeRange.start;
    
    if (!startTime) return true;

    // Calculate the current time's position
    const totalMinutes = (now - startTime) / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const currentPosition = totalHours * MARKER_SPACING;

    // Calculate visible range based on timeline offset
    const visibleStart = -timelineOffset;
    const visibleEnd = visibleStart + window.innerWidth;

    // Update visibility state
    setIsPresentVisible(currentPosition >= visibleStart && currentPosition <= visibleEnd);
  };

  useEffect(() => {
    checkPresentMarkerVisibility();
  }, [timelineOffset]);

  const snapToPresent = () => {
    const now = new Date();
    setVisibleTimeRange(prev => ({
      ...prev,
      now: now
    }));

    // Calculate position to center the current time
    const totalMinutes = (now - visibleTimeRange.start) / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const currentTimePosition = totalHours * MARKER_SPACING;
    
    // Center the timeline on the current time position
    const centerOffset = currentTimePosition - (window.innerWidth / 2);
    setTimelineOffset(-centerOffset);
    setBaseOffset(-centerOffset);
  };

  // Styles for different marker types
  const markerStyles = {
    day: {
      '& .marker-label': {
        color: theme.palette.text.primary,
        fontWeight: 'bold',
        fontSize: '0.9rem',
        marginBottom: '4px'
      },
      '& .marker-line': {
        width: '4px',
        height: '20px',
        backgroundColor: theme.palette.text.primary,
        borderRadius: '2px'
      }
    },
    currentHour: {
      '& .marker-label': {
        color: theme.palette.primary.main,
        fontWeight: 'bold'
      },
      '& .marker-line': {
        width: '3px',
        height: '15px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '1.5px'
      }
    },
    regular: {
      '& .marker-label': {
        color: theme.palette.text.secondary
      },
      '& .marker-line': {
        width: '2px',
        height: '10px',
        backgroundColor: theme.palette.text.secondary,
        borderRadius: '1px'
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'auto', 
      bgcolor: theme.palette.mode === 'light' ? 'background.default' : '#000',
      overflowX: 'hidden'
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
          <TimelineHeader
            timelineInfo={timelineInfo}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            isPresentVisible={isPresentVisible}
            snapToPresent={snapToPresent}
            user={user}
            theme={theme}
            id={id}
            navigate={navigate}
          />

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
              <TimelineNavigation
                position="left"
                onNavigate={handleScroll}
                label="Earlier"
              />

              {/* Timeline Content */}
              <Box sx={{
                position: 'relative',
                width: 'calc(100% - 80px)',
                margin: '0 40px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'visible' // Changed to allow markers to show above
              }}>
                {/* Timeline Bar */}
                <TimelineBar
                  timelineOffset={timelineOffset}
                  timeMarkers={timeMarkers}
                  MARKER_SPACING={MARKER_SPACING}
                  theme={theme}
                />

                {/* Time Markers Container */}
                <TimeMarkers
                  timeMarkers={timeMarkers}
                  timelineOffset={timelineOffset}
                  MARKER_SPACING={MARKER_SPACING}
                  markerStyles={markerStyles}
                  theme={theme}
                  calculateExactTimePosition={calculateExactTimePosition}
                  currentTime={currentTime}
                />
              </Box>

              {/* Right Navigation */}
              <TimelineNavigation
                position="right"
                onNavigate={handleScroll}
                label="Later"
              />
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
        </Container>
      </Box>
    </Box>
  );
}

export default TimelineView;
