import React from 'react';
import { Box, Badge, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EventCarousel from './EventCarousel';

const EventCounter = ({ 
  count, 
  events = [], 
  currentIndex = 0, 
  onChangeIndex,
  onDotClick,
  viewMode 
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Event Counter
        </Typography>
        <Badge
          badgeContent={count}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.9rem',
              height: '24px',
              minWidth: '24px',
              borderRadius: '12px'
            }
          }}
        >
          <EventIcon color="action" />
        </Badge>
      </Box>

      {viewMode === 'position' && events.length > 0 && (
        <EventCarousel
          events={events}
          currentIndex={currentIndex}
          onChangeIndex={onChangeIndex}
          onDotClick={onDotClick}
        />
      )}
    </Box>
  );
};

export default EventCounter;
