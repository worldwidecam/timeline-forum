import React from 'react';
import { Box, Badge, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';

const EventCounter = ({ count }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
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
  );
};

export default EventCounter;
