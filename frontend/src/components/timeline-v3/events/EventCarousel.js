import React, { useState, useCallback } from 'react';
import { Box, IconButton, useTheme, Paper, Fade, Popper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineEvent from './TimelineEvent';
import { EVENT_TYPE_COLORS } from './EventTypes';

const EventCarousel = ({
  events,
  currentIndex,
  onChangeIndex,
  onDotClick
}) => {
  const theme = useTheme();
  const currentEvent = events[currentIndex];
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [popperPlacement, setPopperPlacement] = useState('bottom');

  // Get the color based on event type and theme mode
  const getEventTypeColor = () => {
    if (!currentEvent?.type) return theme.palette.primary.main;
    const colors = EVENT_TYPE_COLORS[currentEvent.type];
    return theme.palette.mode === 'dark' ? colors.dark : colors.light;
  };

  const getEventTypeHoverColor = () => {
    if (!currentEvent?.type) return theme.palette.primary.dark;
    const colors = EVENT_TYPE_COLORS[currentEvent.type].hover;
    return theme.palette.mode === 'dark' ? colors.dark : colors.light;
  };

  const handleMouseEnter = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    // Choose placement based on available space
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setPopperPlacement('top');
    } else {
      setPopperPlacement('bottom');
    }
    
    setAnchorEl(event.currentTarget);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setIsHovered(false);
  };

  const handleDotClick = () => {
    if (onDotClick) {
      onDotClick(currentEvent);
    }
  };

  const eventColor = getEventTypeColor();
  const eventHoverColor = getEventTypeHoverColor();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 1 // Reduced margin top
      }}
    >
      <IconButton 
        size="small"
        onClick={() => onChangeIndex(currentIndex > 0 ? currentIndex - 1 : events.length - 1)}
        sx={{ 
          color: eventColor,
          padding: '4px'
        }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleDotClick}
        sx={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: eventColor,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.2)',
            backgroundColor: eventHoverColor,
            boxShadow: `0 0 0 4px ${eventColor}33`
          }
        }}
      />

      <IconButton 
        size="small"
        onClick={() => onChangeIndex(currentIndex < events.length - 1 ? currentIndex + 1 : 0)}
        sx={{ 
          color: eventColor,
          padding: '4px'
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>

      <Popper
        open={isHovered}
        anchorEl={anchorEl}
        placement={popperPlacement}
        transition
        sx={{ zIndex: 1000 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper 
              elevation={4}
              sx={{ 
                p: 1,
                bgcolor: 'background.paper',
                maxWidth: '300px',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <TimelineEvent event={currentEvent} />
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default EventCarousel;
