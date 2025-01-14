import React from 'react';
import { Box, Typography } from '@mui/material';

const TimeMarkers = ({ 
  timeMarkers,
  timelineOffset,
  MARKER_SPACING,
  markerStyles,
  theme,
  calculateExactTimePosition,
  currentTime
}) => {
  return (
    <Box sx={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      transform: `translateX(${timelineOffset}px)`,
      transition: 'transform 0.1s ease-out',
      width: `${timeMarkers.length * MARKER_SPACING}px`,
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* Time markers */}
      {timeMarkers.map((marker, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            left: `${marker.position}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateX(-50%)',
            ...(marker.isDay ? {
              bottom: '15px',
              height: '45px',
              justifyContent: 'flex-end'
            } : {
              top: '20%'
            }),
            ...(marker.isDay ? markerStyles.day : 
               marker.isPresent ? markerStyles.currentHour : 
               markerStyles.regular)
          }}
        >
          <Typography 
            className="marker-label"
            variant="caption" 
            sx={{ mb: 1 }}
          >
            {marker.label}
          </Typography>
          <Box className="marker-line" />
        </Box>
      ))}

      {/* Precise Time Marker */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: `${calculateExactTimePosition(currentTime)}px`,
            top: '-35px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateX(-50%)',
            zIndex: 1000
          }}
        >
          <Typography
            sx={{
              color: '#000',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              marginBottom: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            You are here
          </Typography>
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #000'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TimeMarkers;
