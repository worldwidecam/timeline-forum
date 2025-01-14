import React from 'react';
import { Box } from '@mui/material';

const TimelineBar = ({ 
  timelineOffset,
  timeMarkers,
  MARKER_SPACING,
  theme
}) => {
  return (
    <Box sx={{
      position: 'absolute',
      left: 0,
      top: '75%',
      height: '2px',
      backgroundColor: theme.palette.primary.main,
      transform: `translateX(${timelineOffset}px)`,
      transition: 'transform 0.1s ease-out',
      width: `${timeMarkers.length * MARKER_SPACING}px` // Dynamic width based on markers
    }} />
  );
};

export default TimelineBar;
