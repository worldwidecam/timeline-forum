import React, { useState, useCallback } from 'react';
import { Box, IconButton, useTheme, Paper, Fade, Popper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TimelineEvent from './TimelineEvent';

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
          color: theme.palette.primary.main,
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
          backgroundColor: theme.palette.primary.main,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.2)',
            backgroundColor: theme.palette.primary.dark,
            boxShadow: `0 0 0 4px ${theme.palette.primary.main}33`
          }
        }}
      />

      <IconButton 
        size="small"
        onClick={() => onChangeIndex(currentIndex < events.length - 1 ? currentIndex + 1 : 0)}
        sx={{ 
          color: theme.palette.primary.main,
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
        modifiers={[
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              boundary: window
            }
          },
          {
            name: 'flip',
            enabled: true,
            options: {
              fallbackPlacements: ['top', 'bottom', 'right', 'left']
            }
          }
        ]}
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
                [popperPlacement === 'top' ? 'mb' : 'mt']: 1
              }}
            >
              <TimelineEvent event={currentEvent} compact />
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default EventCarousel;
