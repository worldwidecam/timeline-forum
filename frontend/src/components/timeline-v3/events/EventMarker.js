// NOTE: This component requires accurate date/time information for proper functionality.
// There are additional considerations to ensure it works correctly.

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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFreshCurrentDate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  const calculatePosition = () => {
    // For time-based views, calculate position based on event_date
    if (viewMode !== 'position') {
      const eventDate = new Date(event.event_date);
      let positionValue = 0;
      let markerPosition = 0; // Position in terms of marker units (for visibility check)
      
      // Calculate position relative to current time (point [0])
      switch (viewMode) {
        case 'day':
          // Calculate the day difference first (to handle different dates)
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
          
          // Convert to days
          const dayDiff = dayDiffMs / (1000 * 60 * 60 * 24);
          
          // Now handle the hour and minute within the day
          const eventHour = eventDate.getHours();
          const eventMinute = eventDate.getMinutes();
          const currentHour = freshCurrentDate.getHours();
          const currentMinute = freshCurrentDate.getMinutes();
          
          // For today's events (dayDiff === 0), handle specially
          if (dayDiff === 0) {
            // For events happening today
            if (eventHour === currentHour) {
              // For events in the current hour, position between marker 0 (current hour) and marker 1 (next hour)
              // based on how far into the hour the event is
              const minuteFraction = eventMinute / 60;
              markerPosition = minuteFraction;
              
              console.log(`Current hour event: ${event.title} at ${eventHour}:${eventMinute}`);
              console.log(`Event is ${(minuteFraction * 100).toFixed(1)}% into the hour`);
              console.log(`Positioned at ${markerPosition.toFixed(3)} between current hour (0) and next hour (1)`);
            } else {
              // For events in other hours today
              const hourDiff = eventHour - currentHour;
              const minuteFraction = eventMinute / 60;
              markerPosition = hourDiff + minuteFraction;
              
              console.log(`Today's event: ${event.title} at ${eventHour}:${eventMinute}`);
              console.log(`Hour difference: ${hourDiff}, Minute fraction: ${minuteFraction.toFixed(2)}`);
              console.log(`Positioned at ${markerPosition.toFixed(3)}`);
            }
          } else {
            // For events on different days
            // Calculate hour difference within the day
            const hourDiffInDay = eventHour;
            
            // Calculate minute difference as a fraction of an hour
            const minuteFraction = eventMinute / 60;
            
            // Combine day difference (in hours) with hour and minute difference
            markerPosition = (dayDiff * 24) + hourDiffInDay + minuteFraction;
            
            console.log(`Different day event: ${event.title}, Day diff: ${dayDiff.toFixed(1)}`);
            console.log(`Event time: ${eventHour}:${eventMinute}`);
            console.log(`Positioned at ${markerPosition.toFixed(3)}`);
          }
          
          // Convert marker position to pixel position
          positionValue = markerPosition * markerSpacing;
          break;
          
        case 'week':
          // Calculate the day difference between event date and current date
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
          
          // Convert to days for primary position
          const dayDiffWeek = dayDiffMsWeek / (1000 * 60 * 60 * 24);
          
          // For today's events (dayDiffWeek === 0), we need to handle them specially
          if (dayDiffWeek === 0) {
            // Today's events should be positioned between marker 0 (today) and marker 1 (tomorrow)
            // based on how far into the day the event is
            
            // Calculate what fraction of the day has passed for the event
            const totalMinutesInDay = 24 * 60;
            const eventMinutesIntoDay = eventDate.getHours() * 60 + eventDate.getMinutes();
            const eventFractionOfDay = eventMinutesIntoDay / totalMinutesInDay;
            
            // Position between today (0) and tomorrow (1) based on time of day
            markerPosition = eventFractionOfDay;
            
            console.log(`Today's event: ${event.title} at ${eventDate.getHours()}:${eventDate.getMinutes()}`);
            console.log(`Event is ${(eventFractionOfDay * 100).toFixed(1)}% into the day`);
            console.log(`Positioned at ${markerPosition.toFixed(3)} between today (0) and tomorrow (1)`);
          } else {
            // For non-today events, calculate position based on day difference and time
            const eventHourWeek = eventDate.getHours();
            const eventMinuteWeek = eventDate.getMinutes();
            
            // Calculate what fraction of the day the event represents
            const totalMinutesInDay = 24 * 60;
            const eventMinutesIntoDay = eventHourWeek * 60 + eventMinuteWeek;
            const eventFractionOfDay = eventMinutesIntoDay / totalMinutesInDay;
            
            // Position is day difference (whole number) plus fraction of day
            markerPosition = Math.floor(dayDiffWeek) + eventFractionOfDay;
            
            console.log(`Non-today event: ${event.title}, Day diff: ${dayDiffWeek.toFixed(1)}`);
            console.log(`Event time: ${eventHourWeek}:${eventMinuteWeek} (${(eventFractionOfDay * 100).toFixed(1)}% into day)`);
            console.log(`Positioned at ${markerPosition.toFixed(3)}`);
          }
          
          // Convert marker position to pixel position
          positionValue = markerPosition * markerSpacing;
          
          // Check if the event is within the current week for visibility
          const weekStart = startOfWeek(freshCurrentDate, { weekStartsOn: 0 }); // 0 = Sunday
          const weekEnd = endOfWeek(freshCurrentDate, { weekStartsOn: 0 });
          const isWithinWeek = isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
          
          // For debugging
          console.log(`Event: ${event.title}, Full Date: ${eventDate.toLocaleString()}`);
          console.log(`Current Date: ${freshCurrentDate.toLocaleString()}`);
          console.log(`Is within current week: ${isWithinWeek}`);
          
          // If not within current week and not the current index, mark for not rendering
          if (!isWithinWeek && index !== currentIndex) {
            console.log(`Event ${event.title} is outside current week and not selected - will not render`);
          }
          break;
          
        case 'month':
          // In month view, each marker represents a month
          const eventMonth = eventDate.getMonth();
          const eventYear = eventDate.getFullYear();
          const currentMonth = freshCurrentDate.getMonth();
          const currentYear = freshCurrentDate.getFullYear();
          
          // Calculate total month difference between event date and current date
          const yearDiff = eventYear - currentYear;
          const monthDiff = eventMonth - currentMonth + (yearDiff * 12);
          
          // Calculate day position within the month (as a fraction)
          const eventDay = eventDate.getDate();
          const daysInMonth = new Date(eventYear, eventMonth + 1, 0).getDate(); // Get days in event's month
          const dayFraction = (eventDay - 1) / daysInMonth;
          
          // Position between month markers based on month difference and day fraction
          markerPosition = monthDiff + dayFraction;
          
          // Convert month difference to position value
          positionValue = markerPosition * markerSpacing;
          
          // For debugging
          console.log(`Event: ${event.title}, Date: ${eventDate.toLocaleDateString()}`);
          console.log(`Year: ${eventYear}, Month: ${eventMonth}, Day: ${eventDay}`);
          console.log(`Month diff: ${monthDiff}, Day fraction: ${dayFraction.toFixed(3)}`);
          console.log(`Final position: ${markerPosition.toFixed(3)} months from current date`);
          break;
          
        case 'year':
          // In year view, each marker represents a month
          if (isSameYear(eventDate, freshCurrentDate)) {
            // For events in the same year, calculate direct month difference with day precision
            const monthDiff = differenceInMonths(eventDate, freshCurrentDate);
            const dayFraction = differenceInDays(eventDate, freshCurrentDate) % 30 / 30;
            markerPosition = monthDiff + dayFraction;
          } else {
            // For events in different years
            // Calculate total months difference (including fractional months)
            const monthDiffMs = differenceInMilliseconds(eventDate, freshCurrentDate);
            // Average month length in milliseconds (30.44 days)
            const avgMonthMs = 1000 * 60 * 60 * 24 * 30.44;
            markerPosition = monthDiffMs / avgMonthMs;
          }
          
          // Convert month difference to position value
          positionValue = markerPosition * markerSpacing;
          
          // For debugging
          console.log(`Event: ${event.title}, Date: ${eventDate.toLocaleDateString()}, Position: ${markerPosition.toFixed(2)} months, Current: ${freshCurrentDate.toLocaleDateString()}`);
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
