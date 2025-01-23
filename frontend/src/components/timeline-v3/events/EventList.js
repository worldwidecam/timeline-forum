import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Event as EventIcon, Link as LinkIcon } from '@mui/icons-material';

const EventList = ({ events }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        mt: 3,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <EventIcon color="primary" />
        <Typography variant="h6" component="div">
          Event List
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ ml: 'auto' }}
        >
          {events.length} events
        </Typography>
      </Box>
      
      <List
        sx={{
          maxHeight: '400px',
          overflow: 'auto',
          bgcolor: 'background.default',
          p: 0
        }}
      >
        {events.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography color="text.secondary" align="center">
                  No events created yet
                </Typography>
              }
            />
          </ListItem>
        ) : (
          events.map((event, index) => (
            <React.Fragment key={event.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" component="div">
                      {event.title}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {event.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div">
                        Created: {formatDate(event.created_at)}
                      </Typography>
                    </React.Fragment>
                  }
                />
                {event.url && (
                  <Tooltip title="View Reference">
                    <IconButton 
                      size="small" 
                      onClick={() => window.open(event.url, '_blank')}
                      sx={{ ml: 1 }}
                    >
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
};

export default EventList;
