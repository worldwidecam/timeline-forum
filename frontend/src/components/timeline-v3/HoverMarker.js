import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const HoverMarker = ({ 
  position,
  timelineOffset,
  markerSpacing,
  viewMode
}) => {
  const theme = useTheme();

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getCurrentDay = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = now.toLocaleString('default', { month: 'short' });
    const date = now.getDate();
    return `${days[now.getDay()]}, ${month} ${date}`;
  };

  const getLabel = () => {
    if (viewMode === 'day') {
      return getCurrentTime();
    }
    if (viewMode === 'week') {
      return getCurrentDay();
    }
    return 'You are Here';
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${window.innerWidth/2 + (position * markerSpacing)}px`,
        top: '50%',
        transform: `translateX(${timelineOffset}px) translateX(-50%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.1s ease-out',
        zIndex: 0, // Lower z-index so it stays behind buttons
        pointerEvents: 'none'
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Lobster Two',
          fontSize: '1rem',
          color: theme.palette.primary.main,
          marginBottom: '4px',
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(33, 150, 243, 0.1)'
            : 'rgba(33, 150, 243, 0.05)',
          border: `1px solid ${theme.palette.primary.main}`,
          opacity: 0.9,
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(33, 150, 243, 0.2)'
              : 'rgba(33, 150, 243, 0.1)',
            transform: 'scale(1.05)',
            opacity: 1
          }
        }}
      >
        {getLabel()}
      </Typography>
      <Box
        sx={{
          width: '2px',
          height: '40px',
          backgroundColor: theme.palette.primary.main,
          opacity: 0.8,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-1px',
            right: '-1px',
            bottom: 0,
            background: theme.palette.primary.main,
            opacity: 0.4,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scaleX(1)',
            },
            '50%': {
              transform: 'scaleX(3)',
            },
          },
          '&:hover::after': {
            animation: 'none',
            opacity: 0.6,
            transform: 'scaleX(3)',
          }
        }}
      />
    </Box>
  );
};

export default HoverMarker;
