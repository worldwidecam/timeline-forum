// NOTE: This component requires accurate date/time information for proper functionality.
// There are additional considerations to ensure it works correctly.

import React, { useState } from 'react';
import { Box, Paper, Popper, Fade, Typography, useTheme, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineEvent from './TimelineEvent';
import { EVENT_TYPE_COLORS, EVENT_TYPES } from './EventTypes';
import { EventHoverCard } from './EventHoverCard';
import { 
  differenceInHours, 
  differenceInDays, 
  differenceInMinutes, 
  differenceInMonths, 
  differenceInMilliseconds,
  isSameDay,
  isSameMonth,
  isSameYear
} from 'date-fns';

const EventMarker = ({ 
  event, 
  timelineOffset, 
  markerSpacing,
  viewMode,
  index, 
  totalEvents,
  currentIndex,
  onChangeIndex,
  currentDate = new Date(),
  minMarker,
  maxMarker
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
      let markerPosition = 0; // Position in terms of marker units (for visibility check)
      
      // Calculate position relative to current time (point [0])
      switch (viewMode) {
        case 'day':
          // In day view, each marker represents an hour
          // Calculate the precise time difference in hours between event time and current time
          const isSameDayEvent = isSameDay(eventDate, currentDate);
          
          if (isSameDayEvent) {
            // For events on the same day, calculate direct hour difference with minute precision
            const hourDiff = differenceInHours(eventDate, currentDate);
            const minuteDiff = differenceInMinutes(eventDate, currentDate) % 60;
            const hourFraction = minuteDiff / 60;
            
            // Combine hours and minutes for precise positioning
            markerPosition = hourDiff + hourFraction;
          } else {
            // For events on different days
            const isEventInPast = eventDate < currentDate;
            
            if (isEventInPast) {
              // Calculate total hours difference for past events (negative value)
              const diffMs = differenceInMilliseconds(eventDate, currentDate);
              markerPosition = diffMs / (1000 * 60 * 60); // Convert ms to hours
            } else {
              // Calculate total hours difference for future events (positive value)
              const diffMs = differenceInMilliseconds(eventDate, currentDate);
              markerPosition = diffMs / (1000 * 60 * 60); // Convert ms to hours
            }
          }
          
          // Convert hour difference to position value
          positionValue = markerPosition * markerSpacing;
          
          // For debugging, log the marker position and event time
          console.log(`Event: ${event.title}, Time: ${eventDate.toLocaleTimeString()}, Position: ${markerPosition.toFixed(2)} hours, Current: ${currentDate.toLocaleTimeString()}`);
          break;
          
        case 'week':
          // In week view, each marker represents a day
          // Calculate the day difference between event date and current date with hour precision
          const dayDiffMs = differenceInMilliseconds(eventDate, currentDate);
          const dayDiff = dayDiffMs / (1000 * 60 * 60 * 24); // Convert ms to days
          
          // Convert day difference to marker position
          markerPosition = dayDiff;
          positionValue = dayDiff * markerSpacing;
          
          // For debugging
          console.log(`Event: ${event.title}, Date: ${eventDate.toLocaleDateString()}, Position: ${markerPosition.toFixed(2)} days, Current: ${currentDate.toLocaleDateString()}`);
          break;
          
        case 'month':
          // In month view, each marker represents a day within the month
          if (isSameMonth(eventDate, currentDate) && isSameYear(eventDate, currentDate)) {
            // For events in the same month and year, calculate direct day difference
            const dayDiff = differenceInDays(eventDate, currentDate);
            const hourFraction = (differenceInHours(eventDate, currentDate) % 24) / 24;
            markerPosition = dayDiff + hourFraction;
          } else {
            // For events in different months
            const dayDiffMs = differenceInMilliseconds(eventDate, currentDate);
            markerPosition = dayDiffMs / (1000 * 60 * 60 * 24); // Convert ms to days
          }
          
          // Convert day difference to position value
          positionValue = markerPosition * markerSpacing;
          
          // For debugging
          console.log(`Event: ${event.title}, Date: ${eventDate.toLocaleDateString()}, Position: ${markerPosition.toFixed(2)} days, Current: ${currentDate.toLocaleDateString()}`);
          break;
          
        case 'year':
          // In year view, each marker represents a month
          if (isSameYear(eventDate, currentDate)) {
            // For events in the same year, calculate direct month difference with day precision
            const monthDiff = differenceInMonths(eventDate, currentDate);
            const dayFraction = differenceInDays(eventDate, currentDate) % 30 / 30;
            markerPosition = monthDiff + dayFraction;
          } else {
            // For events in different years
            // Calculate total months difference (including fractional months)
            const monthDiffMs = differenceInMilliseconds(eventDate, currentDate);
            // Average month length in milliseconds (30.44 days)
            const avgMonthMs = 1000 * 60 * 60 * 24 * 30.44;
            markerPosition = monthDiffMs / avgMonthMs;
          }
          
          // Convert month difference to position value
          positionValue = markerPosition * markerSpacing;
          
          // For debugging
          console.log(`Event: ${event.title}, Date: ${eventDate.toLocaleDateString()}, Position: ${markerPosition.toFixed(2)} months, Current: ${currentDate.toLocaleDateString()}`);
          break;
          
        default:
          // For base coordinate view, center below event counter
          return {
            x: 0,
            y: -40 // Position below event counter
          };
      }

      // Check if the position would be visible in the current view
      // We consider the visible range to be from minMarker to maxMarker
      const isVisible = minMarker <= markerPosition && markerPosition <= maxMarker;
      
      // If the marker is outside the visible range and not the current index, don't render it
      if (!isVisible && index !== currentIndex) {
        return null;
      }
      
      return {
        x: Math.round(window.innerWidth/2 + positionValue + timelineOffset),
        y: 20, // Fixed distance from bottom for time-based views
      };
    } else {
      // For position view, use the index to calculate position
      const centerX = window.innerWidth / 2;
      const positionValue = (index - currentIndex) * markerSpacing;
      
      return {
        x: Math.round(centerX + positionValue + timelineOffset),
        y: 20, // Fixed distance from bottom
      };
    }
  };

  const position = calculatePosition();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
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
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setShowHover(true);
    setAnchorEl(e.currentTarget);
  };

  const handleMouseLeaveMarker = () => {
    setShowHover(false);
    setAnchorEl(null);
  };

  const handleClick = () => {
    onChangeIndex(index);
  };

  // If the position is null or undefined, don't render the marker
  if (!position) return null;

  return (
    <>
      {index === currentIndex ? (
        <Box
          sx={{
            position: 'absolute',
            left: `${position.x}px`,
            bottom: `${position.y}px`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transform: 'translateX(-50%)',
            zIndex: 4,
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
            className="active-marker"
            onMouseEnter={handleMouseEnterMarker}
            onMouseLeave={handleMouseLeaveMarker}
            onClick={handleClick}
            sx={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-8px',
                background: `radial-gradient(circle, ${getColor()}30 0%, transparent 70%)`,
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
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
          className={isHovered ? 'pulsing-marker' : ''}
          onMouseEnter={handleMouseEnterMarker}
          onMouseLeave={handleMouseLeaveMarker}
          onClick={handleClick}
          sx={{
            position: 'absolute',
            left: `${position.x}px`,
            bottom: `${position.y}px`,
            transform: 'translateX(-50%)',
            width: '14px',
            height: '14px',
            cursor: 'pointer',
            zIndex: 3,
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
      )}

      <Popper
        open={showHover}
        anchorEl={anchorEl}
        placement="top"
        transition
        sx={{ zIndex: 5 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={3}
              sx={{
                p: 1.5,
                maxWidth: 280,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 16px rgba(0,0,0,0.5)' 
                  : '0 8px 16px rgba(0,0,0,0.1)',
                mb: 1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  border: '8px solid transparent',
                  borderTopColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
                }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5
              }}>
                {event.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.event_date).toLocaleString()}
              </Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default EventMarker;
