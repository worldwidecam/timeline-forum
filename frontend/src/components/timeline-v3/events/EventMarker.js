import React, { useState } from 'react';
import { Box, Paper, Popper, Fade, Typography, useTheme, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineEvent from './TimelineEvent';
import { EVENT_TYPE_COLORS, EVENT_TYPES } from './EventTypes';
import { EventHoverCard } from './EventHoverCard';

const EventMarker = ({ 
  event, 
  timelineOffset, 
  markerSpacing,
  viewMode,
  index, 
  totalEvents,
  currentIndex,
  onChangeIndex,
  currentDate = new Date()
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showHover, setShowHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const calculatePosition = () => {
    // For time-based views, calculate position based on event_date
    if (viewMode !== 'position') {
      const eventDate = new Date(event.event_date);
      let positionValue = 0;

      switch (viewMode) {
        case 'day':
          const minutes = eventDate.getHours() * 60 + eventDate.getMinutes();
          positionValue = (minutes / (24 * 60)) * markerSpacing;
          break;
          
        case 'week':
          const dayOfWeek = eventDate.getDay();
          const minutesInDay = eventDate.getHours() * 60 + eventDate.getMinutes();
          positionValue = ((dayOfWeek * 24 * 60 + minutesInDay) / (7 * 24 * 60)) * markerSpacing;
          break;
          
        case 'month':
          const dayOfMonth = eventDate.getDate();
          const daysInMonth = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 0).getDate();
          positionValue = ((dayOfMonth - 1) / daysInMonth) * markerSpacing;
          break;
          
        case 'year':
          const startOfYear = new Date(eventDate.getFullYear(), 0, 1);
          const dayOfYear = Math.floor((eventDate - startOfYear) / (1000 * 60 * 60 * 24));
          positionValue = (dayOfYear / 365) * markerSpacing;
          break;
      }

      return {
        x: Math.round(positionValue + timelineOffset),
        y: 20 // Fixed distance from bottom for time-based views
      };
    }

    // For base coordinate view, center below event counter
    return {
      x: 0,
      y: -40 // Position below event counter
    };
  };

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setIsHovered(false);
  };

  const getColor = () => {
    const typeColors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS[EVENT_TYPES.REMARK];
    return theme.palette.mode === 'dark' ? typeColors.dark : typeColors.light;
  };

  const getHoverColor = () => {
    const typeColors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS[EVENT_TYPES.REMARK];
    return theme.palette.mode === 'dark' ? typeColors.hover.dark : typeColors.hover.light;
  };

  const handleMouseEnterMarker = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.right + 16,
      y: rect.top - (rect.height / 2)
    });
    setShowHover(true);
  };

  const position = calculatePosition();

  // In base view, only render if this is the current event
  if (viewMode === 'position' && index !== currentIndex) {
    return null;
  }

  return (
    <>
      {viewMode === 'position' ? (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '-60px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <IconButton 
            size="small"
            onClick={() => onChangeIndex(currentIndex > 0 ? currentIndex - 1 : totalEvents - 1)}
            sx={{ 
              color: theme.palette.primary.main,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(33, 150, 243, 0.15)'
                  : 'rgba(33, 150, 243, 0.08)',
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box
            onMouseEnter={handleMouseEnterMarker}
            onMouseLeave={() => setShowHover(false)}
            sx={{
              position: 'relative',
              width: '14px',
              height: '14px',
              cursor: 'pointer',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-4px',
                background: `radial-gradient(circle, ${getColor()}20 0%, transparent 70%)`,
                borderRadius: '50%',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
              },
              '&:hover::before': {
                opacity: 1,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: getColor(),
                borderRadius: '50%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 0 10px ${getColor()}40`,
              },
              '&:hover::after': {
                transform: 'scale(1.2)',
                boxShadow: `
                  0 0 0 2px ${theme.palette.background.paper},
                  0 0 0 4px ${getColor()}40,
                  0 0 12px ${getColor()}60
                `,
              }
            }}
          />

          <IconButton 
            size="small"
            onClick={() => onChangeIndex(currentIndex < totalEvents - 1 ? currentIndex + 1 : 0)}
            sx={{ 
              color: theme.palette.primary.main,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(33, 150, 243, 0.15)'
                  : 'rgba(33, 150, 243, 0.08)',
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      ) : (
        <Box
          onMouseEnter={handleMouseEnterMarker}
          onMouseLeave={() => setShowHover(false)}
          sx={{
            position: 'absolute',
            left: `${position.x}px`,
            bottom: `${position.y}px`,
            transform: 'translateX(-50%)',
            width: '14px',
            height: '14px',
            cursor: 'pointer',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '-4px',
              background: `radial-gradient(circle, ${getColor()}20 0%, transparent 70%)`,
              borderRadius: '50%',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              transform: 'translateX(50%)',
            },
            '&:hover::before': {
              opacity: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: getColor(),
              borderRadius: '50%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 0 10px ${getColor()}40`,
              transform: 'translateX(50%)',
            },
            '&:hover::after': {
              transform: 'translateX(50%) scale(1.2)',
              boxShadow: `
                0 0 0 2px ${theme.palette.background.paper},
                0 0 0 4px ${getColor()}40,
                0 0 12px ${getColor()}60
              `,
            }
          }}
        />
      )}

      <Popper
        open={isHovered}
        anchorEl={anchorEl}
        placement="top"
        transition
        sx={{ zIndex: 1000 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 2,
                maxWidth: 320,
                mt: -1
              }}
            >
              <TimelineEvent event={event} compact />
            </Paper>
          </Fade>
        )}
      </Popper>

      {showHover && (
        <EventHoverCard 
          event={event}
          position={hoverPosition}
        />
      )}
    </>
  );
};

export default EventMarker;
