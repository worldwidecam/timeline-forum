import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';

function TimelineView() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [timelineInfo, setTimelineInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/timeline/${id}/events`);
        const sortedEvents = response.data.sort((a, b) => 
          new Date(a.event_date) - new Date(b.event_date)
        );
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [id]);

  const calculatePosition = (date) => {
    if (events.length === 0) return 0;
    
    const firstDate = new Date(events[0].event_date);
    const lastDate = new Date(events[events.length - 1].event_date);
    const currentDate = new Date(date);
    
    const totalTimespan = lastDate - firstDate;
    const currentTimespan = currentDate - firstDate;
    
    return (currentTimespan / totalTimespan) * 100;
  };

  const generateYearMarkers = () => {
    if (events.length === 0) return [];
    
    const firstDate = new Date(events[0].event_date);
    const lastDate = new Date(events[events.length - 1].event_date);
    const firstYear = firstDate.getFullYear();
    const lastYear = lastDate.getFullYear();
    const years = [];
    
    for (let year = firstYear; year <= lastYear; year++) {
      const position = calculatePosition(new Date(year, 0, 1));
      years.push({ year, position });
    }
    
    return years;
  };

  const handleEventClick = (event) => {
    setSelectedEvent(selectedEvent?.id === event.id ? null : event);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4">
                {timelineInfo?.name || 'Timeline View'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/timeline/${id}/create-event`}
              >
                Create Event
              </Button>
            </Box>

            <Box sx={{ 
              position: 'relative',
              width: '100%',
              minHeight: '500px',
              overflowX: 'auto',
              overflowY: 'visible',
              padding: '40px 60px'
            }}>
              {/* Main Timeline Line */}
              <Box sx={{
                position: 'relative',
                width: '100%',
                height: '2px',
                backgroundColor: 'grey.500',
                marginY: '100px'
              }}>
                {/* Start Point */}
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  top: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'grey.800'
                }} />
                
                {/* End Point */}
                <Box sx={{
                  position: 'absolute',
                  right: 0,
                  top: '-6px',
                  width: '14px',
                  height: '14px',
                  backgroundColor: 'grey.800',
                  transform: 'rotate(45deg)'
                }} />

                {/* Year Markers */}
                {generateYearMarkers().map(({ year, position }) => (
                  <Box
                    key={year}
                    sx={{
                      position: 'absolute',
                      left: `${position}%`,
                      top: '-20px',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{
                      width: '1px',
                      height: '10px',
                      backgroundColor: 'grey.500',
                      marginBottom: '5px'
                    }} />
                    <Typography variant="caption" color="textSecondary">
                      {year}
                    </Typography>
                  </Box>
                ))}

                {/* Events */}
                {events.map((event) => {
                  const position = calculatePosition(event.event_date);
                  return (
                    <Box
                      key={event.id}
                      sx={{
                        position: 'absolute',
                        left: `${position}%`,
                        cursor: 'pointer'
                      }}
                    >
                      {/* Diagonal Line */}
                      <Box sx={{
                        position: 'absolute',
                        left: 0,
                        top: '-80px',
                        width: '1px',
                        height: '160px',
                        backgroundColor: 'primary.main',
                        transform: 'rotate(-30deg)',
                        transformOrigin: 'bottom'
                      }} />
                      
                      {/* Event Card */}
                      <Paper
                        elevation={selectedEvent?.id === event.id ? 8 : 2}
                        sx={{
                          position: 'absolute',
                          top: '-120px',
                          left: '20px',
                          p: 2,
                          minWidth: '200px',
                          maxWidth: '300px',
                          transform: 'translateX(-50%)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(-50%) scale(1.05)',
                            elevation: 6,
                            zIndex: 10
                          },
                          zIndex: selectedEvent?.id === event.id ? 2 : 1,
                          backgroundColor: 'background.paper'
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <Typography variant="h6" component="h3" gutterBottom>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {format(new Date(event.event_date), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          {event.content}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
              </Box>

              {/* Timeline Labels */}
              <Typography 
                variant="body2" 
                sx={{ 
                  position: 'absolute', 
                  left: '10px', 
                  bottom: '20px',
                  fontStyle: 'italic'
                }}
              >
                Beginning
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  position: 'absolute', 
                  right: '10px', 
                  bottom: '20px',
                  fontStyle: 'italic'
                }}
              >
                Present day
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default TimelineView;
