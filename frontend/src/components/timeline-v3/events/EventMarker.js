// NOTE: This component requires accurate date/time information for proper functionality.
// There are additional considerations to ensure it works correctly.

// FUTURE ENHANCEMENT: Implement a smooth curvature winding line that rests on top of all event marker lines,
// connecting them visually like an audioform soundwave. This would provide a visual continuity
// to the timeline, especially in year view where many events may be displayed.

import React, { useState, useEffect } from 'react';
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
  isSameYear,
  startOfWeek,
  endOfWeek,
  isWithinInterval
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
  minMarker,
  maxMarker
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showHover, setShowHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [freshCurrentDate, setFreshCurrentDate] = useState(new Date());
  const [overlappingFactor, setOverlappingFactor] = useState(1);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFreshCurrentDate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  // Calculate if this event overlaps with others based on position
  useEffect(() => {
    if (viewMode !== 'position' && position) {
      const eventPositions = window.timelineEventPositions || [];
      
      // Update this event's position in the global array
      const existingIndex = eventPositions.findIndex(ep => ep.id === event.id);
      if (existingIndex >= 0) {
        eventPositions[existingIndex] = {
          id: event.id,
          x: position.x,
          viewMode,
          type: event.type
        };
      } else {
        eventPositions.push({
          id: event.id,
          x: position.x,
          viewMode,
          type: event.type
        });
      }
      window.timelineEventPositions = eventPositions;
      
      // Adjust proximity threshold based on view mode
      // Larger views (year, month) need larger thresholds
      let proximityThreshold = 10; // Default
      if (viewMode === 'month') proximityThreshold = 15;
      if (viewMode === 'year') proximityThreshold = 20;
      
      // Find nearby events with more sophisticated collision detection
      const nearbyEvents = eventPositions.filter(ep => 
        ep.id !== event.id && 
        ep.viewMode === viewMode &&
        Math.abs(ep.x - position.x) < proximityThreshold
      );
      
      // Calculate overlapping factor with diminishing returns
      // First few overlaps have more impact, then it tapers off
      const baseGrowth = 1;
      const maxGrowth = 2.5; // Cap the maximum growth
      
      if (nearbyEvents.length === 0) {
        setOverlappingFactor(1);
        setHorizontalOffset(0);
      } else {
        // Logarithmic growth function to prevent excessive height
        const factor = baseGrowth + (Math.log(nearbyEvents.length + 1) / Math.log(5));
        setOverlappingFactor(Math.min(factor, maxGrowth));
        
        // Calculate a subtle horizontal offset based on event ID to prevent perfect alignment
        // This creates a more natural, less rigid appearance when events overlap
        let offsetBase = 0;
        if (event.id && typeof event.id === 'string') {
          offsetBase = (event.id.charCodeAt(0) % 5) - 2; // Range from -2 to 2
        } else if (event.id) {
          // If id exists but is not a string (e.g., a number), convert to string first
          offsetBase = (String(event.id).charCodeAt(0) % 5) - 2;
        } else {
          // Fallback to a random offset if id doesn't exist
          offsetBase = (Math.floor(Math.random() * 5) - 2);
        }
        setHorizontalOffset(nearbyEvents.length > 0 ? offsetBase : 0);
      }
    }
  }, [event.id, event.type, viewMode, position]);

  const calculatePosition = () => {
    if (viewMode !== 'position') {
      const eventDate = new Date(event.event_date);
      let positionValue = 0;
      let markerPosition = 0;
      
      switch (viewMode) {
        case 'day':
          const dayDiffMs = differenceInMilliseconds(
            new Date(
              eventDate.getFullYear(),
              eventDate.getMonth(),
              eventDate.getDate()
            ),
            new Date(
              freshCurrentDate.getFullYear(),
              freshCurrentDate.getMonth(),
              freshCurrentDate.getDate()
            )
          );
          
          const dayDiff = dayDiffMs / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 0) {
            if (eventDate.getHours() === freshCurrentDate.getHours()) {
              const minuteFraction = eventDate.getMinutes() / 60;
              markerPosition = minuteFraction;
            } else {
              const hourDiff = eventDate.getHours() - freshCurrentDate.getHours();
              const minuteFraction = eventDate.getMinutes() / 60;
              markerPosition = hourDiff + minuteFraction;
            }
          } else {
            const hourDiffInDay = eventDate.getHours();
            const minuteFraction = eventDate.getMinutes() / 60;
            markerPosition = (dayDiff * 24) + hourDiffInDay + minuteFraction;
          }
          
          positionValue = markerPosition * markerSpacing;
          break;
          
        case 'week':
          const dayDiffMsWeek = differenceInMilliseconds(
            new Date(
              eventDate.getFullYear(),
              eventDate.getMonth(),
              eventDate.getDate()
            ),
            new Date(
              freshCurrentDate.getFullYear(),
              freshCurrentDate.getMonth(),
              freshCurrentDate.getDate()
            )
          );
          
          const dayDiffWeek = dayDiffMsWeek / (1000 * 60 * 60 * 24);
          
          if (dayDiffWeek === 0) {
            const totalMinutesInDay = 24 * 60;
            const eventMinutesIntoDay = eventDate.getHours() * 60 + eventDate.getMinutes();
            const eventFractionOfDay = eventMinutesIntoDay / totalMinutesInDay;
            
            markerPosition = eventFractionOfDay;
          } else {
            const eventHourWeek = eventDate.getHours();
            const eventMinuteWeek = eventDate.getMinutes();
            
            const totalMinutesInDay = 24 * 60;
            const eventMinutesIntoDay = eventHourWeek * 60 + eventMinuteWeek;
            const eventFractionOfDay = eventMinutesIntoDay / totalMinutesInDay;
            
            markerPosition = Math.floor(dayDiffWeek) + eventFractionOfDay;
          }
          
          positionValue = markerPosition * markerSpacing;
          
          const weekStart = startOfWeek(freshCurrentDate, { weekStartsOn: 0 });
          const weekEnd = endOfWeek(freshCurrentDate, { weekStartsOn: 0 });
          const isWithinWeek = isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
          
          if (!isWithinWeek && index !== currentIndex) {
            return null;
          }
          break;
          
        case 'month':
          const eventYear = eventDate.getFullYear();
          const currentYear = freshCurrentDate.getFullYear();
          const eventMonth = eventDate.getMonth();
          const currentMonth = freshCurrentDate.getMonth();
          const eventDay = eventDate.getDate();
          const daysInMonth = new Date(eventYear, eventMonth + 1, 0).getDate();
          
          const monthYearDiff = eventYear - currentYear;
          const monthDiff = eventMonth - currentMonth + (monthYearDiff * 12);
          
          const monthDayFraction = (eventDay - 1) / daysInMonth;
          
          markerPosition = monthDiff + monthDayFraction;
          
          positionValue = markerPosition * markerSpacing;
          break;
          
        case 'year':
          const yearDiff = eventDate.getFullYear() - freshCurrentDate.getFullYear();
          
          const yearMonthFraction = eventDate.getMonth() / 12;
          const yearDayFraction = (eventDate.getDate() - 1) / new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 0).getDate();
          
          const yearMonthContribution = eventDate.getMonth() / 12;
          const yearDayContribution = yearDayFraction / 12;
          
          markerPosition = yearDiff + yearMonthContribution + yearDayContribution;
          
          positionValue = markerPosition * markerSpacing;
          break;
          
        default:
          return {
            x: 0,
            y: 70,
          };
      }

      const isVisible = minMarker <= markerPosition && markerPosition <= maxMarker;
      
      if (!isVisible && index !== currentIndex) {
        return null;
      }
      
      return {
        x: Math.round(window.innerWidth/2 + positionValue + timelineOffset),
        y: 70,
      };
    } else {
      const centerX = window.innerWidth / 2;
      const positionValue = (index - currentIndex) * markerSpacing;
      
      return {
        x: Math.round(centerX + positionValue + timelineOffset),
        y: 70,
      };
    }
  };

  useEffect(() => {
    const position = calculatePosition();
    setPosition(position);
  }, [viewMode, freshCurrentDate, index, currentIndex, timelineOffset, markerSpacing, minMarker, maxMarker]);

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

  if (!position) return null;

  return (
    <>
      {index === currentIndex && currentIndex !== -1 ? (
        <Box
          sx={{
            position: 'absolute',
            left: `${position.x + horizontalOffset}px`, // Add horizontal offset
            bottom: `${position.y}px`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transform: 'translateX(-50%)',
            zIndex: 1000,
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
              width: `${4 + (overlappingFactor - 1) * 0.5}px`, // Increase width slightly for overlapping events
              height: `${40 * overlappingFactor}px`, // Adjust height based on overlapping factor
              cursor: 'pointer',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-8px',
                background: `radial-gradient(ellipse at center, ${getColor()}30 0%, transparent 70%)`,
                borderRadius: '4px',
                animation: 'pulse 2s infinite',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to top, ${getColor()}99, ${getColor()})`,
                borderRadius: '4px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 0 10px ${getColor()}40`,
              },
              '&:hover::after': {
                transform: 'scaleY(1.1) scaleX(1.5)',
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
          sx={{
            position: 'absolute',
            left: `${position.x + horizontalOffset}px`, // Add horizontal offset
            bottom: `${position.y}px`,
            width: `${3 + (overlappingFactor - 1) * 0.5}px`, // Increase width slightly for overlapping events
            height: `${24 * overlappingFactor}px`, // Adjust height based on overlapping factor
            borderRadius: '2px',
            background: `linear-gradient(to top, ${getColor()}80, ${getColor()})`,
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: `linear-gradient(to top, ${getHoverColor()}90, ${getHoverColor()})`,
              transform: 'translateX(-50%) scaleY(1.2) scaleX(1.3)',
              boxShadow: `0 0 8px ${getColor()}40`,
            },
            zIndex: 1000,
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnterMarker}
          onMouseLeave={handleMouseLeaveMarker}
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
