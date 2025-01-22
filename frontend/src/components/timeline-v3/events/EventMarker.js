import React, { useState } from 'react';
import { Box, Paper, Popper, Fade } from '@mui/material';
import TimelineEvent from './TimelineEvent';

const EventMarker = ({ event, position, timelineOffset, markerSpacing, viewMode, theme }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const calculatePosition = () => {
    const eventDate = new Date(event.event_date);
    let positionValue = 0;

    switch (viewMode) {
      case 'day':
        // Position based on hours and minutes in the day
        const minutes = eventDate.getHours() * 60 + eventDate.getMinutes();
        positionValue = (minutes / (24 * 60)) * markerSpacing;
        break;
      case 'week':
        // Position based on day of the week (0-6)
        const dayOfWeek = eventDate.getDay();
        positionValue = (dayOfWeek / 7) * markerSpacing;
        break;
      case 'month':
        // Position based on day of the month (1-31)
        const dayOfMonth = eventDate.getDate();
        const totalDays = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 0).getDate();
        positionValue = ((dayOfMonth - 1) / totalDays) * markerSpacing;
        break;
      case 'year':
        // Position based on day of the year (1-365)
        const start = new Date(eventDate.getFullYear(), 0, 0);
        const diff = eventDate - start;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        positionValue = (dayOfYear / 365) * markerSpacing;
        break;
      default:
        // For position mode, use the marker spacing directly
        positionValue = position * markerSpacing;
    }

    return positionValue + timelineOffset;
  };

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${calculatePosition()}px`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
      }}
    >
      <Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: '12px',
          height: '12px',
          backgroundColor: theme.palette.primary.main,
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s',
          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          '&:hover': {
            boxShadow: `0 0 0 4px ${theme.palette.primary.main}33`,
          },
        }}
      />
      <Popper
        open={isHovered}
        anchorEl={anchorEl}
        placement="top"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Box sx={{ p: 1, maxWidth: '400px' }}>
              <TimelineEvent event={event} />
            </Box>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default EventMarker;
