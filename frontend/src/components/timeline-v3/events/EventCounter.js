import React, { useState, useEffect } from 'react';
import { Box, Badge, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EventCarousel from './EventCarousel';
import { EVENT_TYPE_COLORS } from './EventTypes';

const EventCounter = ({ 
  count, 
  events = [], 
  currentIndex = 0, 
  onChangeIndex,
  onDotClick,
  viewMode,
  timelineOffset = 0,
  markerSpacing = 100,
  sortOrder
}) => {
  // State to track day view current event index
  const [dayViewIndex, setDayViewIndex] = useState(0);
  
  // Reset day view index when view mode changes
  useEffect(() => {
    setDayViewIndex(0);
  }, [viewMode]);

  // Get color based on event type
  const getEventColor = (event) => {
    if (!event?.type) return 'primary.main';
    const colors = EVENT_TYPE_COLORS[event.type];
    return colors ? colors.light : 'primary.main';
  };

  // Handle day view navigation
  const handleDayViewChange = (newIndex) => {
    setDayViewIndex(newIndex);
  };

  // Handle day view dot click
  const handleDayViewDotClick = (event) => {
    if (onDotClick) {
      onDotClick(event);
    }
  };

  // Get filtered events for day view (events with valid dates)
  const getDayViewEvents = () => {
    return events.filter(event => event.event_date);
  };

  const dayViewEvents = getDayViewEvents();
  const currentDayViewEvent = dayViewEvents[dayViewIndex] || null;

  // Cycling functions adjusted based on sort order
  const goToPrevious = () => {
    if (sortOrder === 'newest') {
      setDayViewIndex(dayViewIndex < dayViewEvents.length - 1 ? dayViewIndex + 1 : 0);
    } else {
      setDayViewIndex(dayViewIndex > 0 ? dayViewIndex - 1 : dayViewEvents.length - 1);
    }
  };

  const goToNext = () => {
    if (sortOrder === 'newest') {
      setDayViewIndex(dayViewIndex > 0 ? dayViewIndex - 1 : dayViewEvents.length - 1);
    } else {
      setDayViewIndex(dayViewIndex < dayViewEvents.length - 1 ? dayViewIndex + 1 : 0);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Event Counter
        </Typography>
        <Badge
          badgeContent={count}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.9rem',
              height: '24px',
              minWidth: '24px',
              borderRadius: '12px'
            }
          }}
        >
          <EventIcon color="action" />
        </Badge>
      </Box>

      {/* Position view event carousel */}
      {viewMode === 'position' && events.length > 0 && (
        <EventCarousel
          events={events}
          currentIndex={currentIndex}
          onChangeIndex={onChangeIndex}
          onDotClick={onDotClick}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
        />
      )}

      {/* Day view event carousel */}
      {viewMode === 'day' && dayViewEvents.length > 0 && (
        <EventCarousel
          events={dayViewEvents}
          currentIndex={dayViewIndex}
          onChangeIndex={handleDayViewChange}
          onDotClick={handleDayViewDotClick}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
        />
      )}
    </Box>
  );
};

export default EventCounter;
