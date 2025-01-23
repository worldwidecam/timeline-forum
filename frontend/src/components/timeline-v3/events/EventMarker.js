import React, { useState } from 'react';
import { Box, Paper, Popper, Fade, Typography, useTheme } from '@mui/material';
import TimelineEvent from './TimelineEvent';

const EventMarker = ({ 
  event, 
  timelineOffset, 
  markerSpacing, 
  viewMode,
  currentDate = new Date() // Reference date for calculations
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const calculatePosition = () => {
    const eventDate = new Date(event.event_date);
    let positionValue = 0;
    
    switch (viewMode) {
      case 'day':
        // Position based on hours and minutes within the day
        const minutes = eventDate.getHours() * 60 + eventDate.getMinutes();
        positionValue = (minutes / (24 * 60)) * markerSpacing;
        break;
        
      case 'week':
        // Position based on day and time within the week
        const dayOfWeek = eventDate.getDay();
        const minutesInDay = eventDate.getHours() * 60 + eventDate.getMinutes();
        positionValue = ((dayOfWeek * 24 * 60 + minutesInDay) / (7 * 24 * 60)) * markerSpacing;
        break;
        
      case 'month':
        // Position based on day and time within the month
        const dayOfMonth = eventDate.getDate();
        const daysInMonth = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 0).getDate();
        const dayProgress = minutesInDay / (24 * 60);
        positionValue = ((dayOfMonth - 1 + dayProgress) / daysInMonth) * markerSpacing;
        break;
        
      case 'year':
        // Position based on month and day within the year
        const startOfYear = new Date(eventDate.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((eventDate - startOfYear) / (1000 * 60 * 60 * 24));
        positionValue = (dayOfYear / 365) * markerSpacing;
        break;
    }

    return Math.round(positionValue + timelineOffset);
  };

  const getMarkerLabel = () => {
    const eventDate = new Date(event.event_date);
    
    switch (viewMode) {
      case 'day':
        return eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      case 'week':
        return eventDate.toLocaleDateString([], { weekday: 'short' }) + ' ' +
               eventDate.toLocaleTimeString([], { hour: 'numeric' });
      case 'month':
        return eventDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
      case 'year':
        return eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return '';
    }
  };

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: `${calculatePosition()}px`,
          bottom: 0,
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}
      >
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            border: `2px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[2],
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.2)',
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        />
        
        {/* Event Label */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%) rotate(-45deg)',
            transformOrigin: 'bottom left',
            whiteSpace: 'nowrap',
            color: theme.palette.text.secondary,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {getMarkerLabel()}
        </Typography>
      </Box>

      {/* Event Preview Popup */}
      <Popper
        open={isHovered}
        anchorEl={anchorEl}
        placement="top"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              sx={{
                p: 2,
                maxWidth: 300,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[4],
                mt: 1,
              }}
            >
              <TimelineEvent event={event} compact />
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default EventMarker;
