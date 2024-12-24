import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogContent,
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import EventDisplay from './EventDisplay';
import TimelinePosts from './TimelinePosts';
import { useAuth } from '../contexts/AuthContext';

function TimelineView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [timelineInfo, setTimelineInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRows, setEventRows] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    if (timelineRef.current) {
      setStartX(e.pageX - timelineRef.current.offsetLeft);
      setScrollLeft(timelineRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    if (timelineRef.current) {
      const x = e.pageX - timelineRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      timelineRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchTimelineInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/timeline/${id}`);
        setTimelineInfo(response.data);
      } catch (error) {
        console.error('Error fetching timeline info:', error);
      }
    };

    fetchTimelineInfo();
  }, [id]);

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

  useEffect(() => {
    // Calculate rows for events to prevent overlapping
    const calculateEventRows = () => {
      const rows = {};
      const timeBuffer = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      
      sortedEvents.forEach((event) => {
        const eventDate = new Date(event.event_date).getTime();
        let row = 0;
        
        // Find the first row where this event won't overlap with others
        while (true) {
          const eventsInRow = Object.entries(rows).filter(([, r]) => r === row);
          const hasOverlap = eventsInRow.some(([id]) => {
            const otherEvent = events.find(e => e.id.toString() === id);
            const otherDate = new Date(otherEvent.event_date).getTime();
            return Math.abs(eventDate - otherDate) < timeBuffer;
          });
          
          if (!hasOverlap) {
            rows[event.id] = row;
            break;
          }
          row++;
        }
      });
      
      setEventRows(rows);
    };

    calculateEventRows();
  }, [events]);

  const getTimelineBoundaries = () => {
    if (events.length === 0) return { start: new Date(), end: new Date() };
    
    const dates = events.map(event => new Date(event.event_date));
    const start = new Date(Math.min(...dates));
    const end = new Date(Math.max(...dates));
    const timeSpan = end - start;
    
    // Add padding before the start date based on the timeline's span
    if (timeSpan < 24 * 60 * 60 * 1000) {
      // For same-day timeline, start at beginning of the hour before first event
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() - 1);
      end.setMinutes(59, 59, 999);
    } else if (timeSpan < 7 * 24 * 60 * 60 * 1000) {
      // For week timeline, start at beginning of the day
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (timeSpan < 365 * 24 * 60 * 60 * 1000) {
      // For year timeline, start at beginning of the month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      // For multi-year timeline, start at beginning of the year
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
  };

  const calculatePosition = (date) => {
    const { start, end } = getTimelineBoundaries();
    const totalTimespan = end - start;
    const currentTimespan = new Date(date) - start;
    // Align with the marker spacing
    return 3 + ((currentTimespan / totalTimespan) * 94);
  };

  const generateTimeMarkers = () => {
    const { start, end } = getTimelineBoundaries();
    const timeSpan = end - start;
    const markers = [];
    const numDividers = 8;
    const availableSpace = 94; // 94% of space for content
    const spacing = availableSpace / (numDividers + 1); // Equal divisions including end point

    // Different formatting based on time span
    const isWithinDay = timeSpan <= 24 * 60 * 60 * 1000;
    const isWithinWeek = timeSpan <= 7 * 24 * 60 * 60 * 1000;
    const isWithinYear = timeSpan <= 365 * 24 * 60 * 60 * 1000;

    for (let i = 1; i <= numDividers; i++) {
      const position = 3 + (spacing * i); // Start at 3% and space equally
      const timestamp = new Date(start.getTime() + (timeSpan * (i / (numDividers + 1))));
      
      let label;
      if (isWithinDay) {
        const roundedTime = new Date(timestamp);
        roundedTime.setMinutes(0, 0, 0);
        label = format(roundedTime, 'ha');
      } else if (isWithinWeek) {
        label = format(timestamp, 'EEE ha');
      } else if (isWithinYear) {
        label = format(timestamp, 'MMM d');
      } else {
        label = format(timestamp, 'MMM yyyy');
      }

      markers.push({ position, label });
    }

    return markers;
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
    setSelectedEvent(event);
  };

  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
  };

  const handleEditEvent = (event) => {
    // Navigate to edit page
    navigate(`/timeline/${id}/event/${event.id}/edit`);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`http://localhost:5000/api/event/${eventId}`);
      // Refresh events
      const response = await axios.get(`http://localhost:5000/api/timeline/${id}/events`);
      setEvents(response.data);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', 
      backgroundColor: '#000' 
    }}>
      <Box sx={{ 
        width: '100%',
        position: 'relative',
        backgroundColor: '#2c1b47',
        color: '#fff',
        minHeight: 'fit-content',
        paddingBottom: '20px', 
        overflowX: 'hidden' 
      }}>
        <Container maxWidth={false} sx={{ 
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: '100vw', 
          overflowX: 'hidden' 
        }}>
          <Box my={4}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  <Box component="span" sx={{ 
                    fontWeight: 'bold',
                    color: '#ce93d8',
                    mr: 1
                  }}>
                    #
                  </Box>
                  {timelineInfo?.name || 'Loading...'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Timeline View
                </Typography>
              </Box>
              {user ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/timeline/${id}/event/create`)}
                >
                  Create Event
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                  sx={{ color: '#fff' }}
                >
                  Login to Create Event
                </Button>
              )}
            </Box>

            {/* Timeline Container */}
            <Box 
              ref={timelineRef}
              className="timeline-scroll-container"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              sx={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                position: 'relative',
                height: '400px', // Reduced from default height
                mt: 2,
                mb: 2,
                cursor: isDragging ? 'grabbing' : 'grab',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(156, 39, 176, 0.5)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(156, 39, 176, 0.7)',
                  }
                }
              }}
            >
              {/* Timeline Content */}
              <Box sx={{
                position: 'relative',
                minWidth: events.length > 0 ? `max(1200px, 100%)` : '100%', 
                padding: '40px 200px',
                minHeight: '200px',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Calculate maximum height needed for events */}
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  height: `${Math.max(...Object.values(eventRows)) * 120 + 400}px`, 
                }}>
                  {/* Timeline Labels */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'absolute', 
                      left: '0px',
                      top: '5px',
                      fontStyle: 'italic',
                      color: '#ce93d8',
                      fontSize: '0.8rem'
                    }}
                  >
                    Earliest Event
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'absolute', 
                      right: '0px',
                      top: '5px',
                      fontStyle: 'italic',
                      color: '#ce93d8',
                      fontSize: '0.8rem'
                    }}
                  >
                    Latest Event
                  </Typography>
                  {/* Main Timeline Line */}
                  <Box sx={{
                    position: 'absolute',
                    top: '40px',
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #9c27b0 0%, #ce93d8 100%)',
                    borderRadius: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}>
                    {/* Left endpoint circle */}
                    <Box sx={{
                      position: 'absolute',
                      left: '-6px', 
                      top: '-4px', 
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#9c27b0',
                      boxShadow: '0 0 0 2px #2c1b47, 0 0 0 4px #9c27b0',
                    }} />
                    {/* Right endpoint arrow */}
                    <Box sx={{
                      position: 'absolute',
                      right: '-16px',
                      top: '-6px',
                      width: '0',
                      height: '0',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderLeft: '12px solid #ce93d8',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        right: '4px',
                        top: '-12px',
                        borderTop: '12px solid transparent',
                        borderBottom: '12px solid transparent',
                        borderLeft: '16px solid #2c1b47',
                        zIndex: -1
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: '2px',
                        top: '-10px',
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: '14px solid #ce93d8',
                        zIndex: -1
                      }
                    }} />
                    {/* Timeline Dividers with Labels */}
                    {generateTimeMarkers().map((marker, index) => (
                      <Box
                        key={`divider-${index}`}
                        sx={{
                          position: 'absolute',
                          left: `${marker.position}%`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          transform: 'translateX(-50%)',
                          opacity: events.length >= 2 ? 1 : 0,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            position: 'absolute',
                            top: '-25px',
                            fontStyle: 'italic',
                            color: '#ce93d8',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {marker.label}
                        </Typography>
                        <Box
                          sx={{
                            width: '2px',
                            height: '28px',
                            backgroundColor: 'rgba(206, 147, 216, 0.4)',
                            position: 'absolute',
                            top: '-12px'
                          }}
                        />
                      </Box>
                    ))}
                    {/* Year Markers */}
                    {generateYearMarkers().map(({ year, position }) => (
                      <Box
                        key={year}
                        sx={{
                          position: 'absolute',
                          left: `${position}%`,
                          top: '-25px',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{
                          width: '2px',
                          height: '12px',
                          backgroundColor: '#ce93d8', 
                          marginBottom: '5px'
                        }} />
                        <Typography variant="caption" sx={{ 
                          fontWeight: 'bold',
                          color: '#fff' 
                        }}>
                          {year}
                        </Typography>
                      </Box>
                    ))}

                    {/* Events */}
                    {events.map((event) => {
                      const position = calculatePosition(event.event_date);
                      const rowIndex = eventRows[event.id] || 0;
                      const verticalOffset = rowIndex * 120;

                      return (
                        <Box
                          key={event.id}
                          data-event-id={event.id}
                          sx={{
                            position: 'absolute',
                            left: `${position}%`,
                            top: `${20 + verticalOffset}px`,
                            transform: 'translateX(-50%)',
                            '&:hover': {
                              '& .event-dot-container': {
                                '& .dot': {
                                  transform: 'scale(1.5)',
                                },
                              },
                              '& .event-card': {
                                transform: 'translateX(-50%) scale(1.02)',
                                boxShadow: '0 4px 20px rgba(156, 39, 176, 0.25)',
                                borderColor: '#9c27b0'
                              }
                            }
                          }}
                        >
                          {/* Vertical Connection Line */}
                          <Box sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '1px',
                            height: `${40 + verticalOffset}px`,
                            backgroundColor: 'rgba(156, 39, 176, 0.4)',
                            zIndex: 1
                          }} />
                          
                          {/* Event Dot with larger clickable area */}
                          <Box
                            className="event-dot-container"
                            onClick={() => handleEventClick(event)}
                            sx={{
                              position: 'absolute',
                              top: `-${verticalOffset + 6}px`,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '24px', // Larger clickable area
                              height: '24px', // Larger clickable area
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 2,
                              '&:hover': {
                                '& .dot': {
                                  transform: 'scale(1.5)',
                                }
                              }
                            }}
                          >
                            {/* Actual visible dot */}
                            <Box
                              className="dot"
                              sx={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#ce93d8',
                                border: '2px solid #2c1b47',
                                boxShadow: '0 0 0 2px #ce93d8',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          </Box>
                          
                          {/* Event Card */}
                          <Paper
                            className="event-card"
                            elevation={selectedEvent?.id === event.id ? 8 : 1}
                            sx={{
                              position: 'absolute',
                              top: '50px',
                              left: '50%',
                              transform: selectedEvent?.id === event.id 
                                ? 'translateX(-50%) scale(1.05)' 
                                : 'translateX(-50%)',
                              width: selectedEvent?.id === event.id ? '300px' : '180px',
                              height: selectedEvent?.id === event.id ? 'auto' : '70px',
                              overflow: 'visible',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              zIndex: selectedEvent?.id === event.id ? 10 : 1,
                              backgroundColor: '#2c1b47',
                              border: '1px solid #ce93d8',
                              color: '#fff',
                              '&:hover': {
                                elevation: 4,
                                transform: 'translateX(-50%) scale(1.02)',
                                zIndex: 5
                              }
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <Box sx={{ 
                              p: 1.5,
                              background: selectedEvent?.id === event.id 
                                ? 'linear-gradient(45deg, rgba(156, 39, 176, 0.05), rgba(206, 147, 216, 0.05))'
                                : 'none'
                            }}>
                              {event.image_url && selectedEvent?.id === event.id && (
                                <Box
                                  component="img"
                                  src={event.image_url}
                                  alt={event.title}
                                  sx={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    marginBottom: 1
                                  }}
                                />
                              )}
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: selectedEvent?.id === event.id ? 'normal' : 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.2'
                                }}
                              >
                                {event.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ 
                                  display: 'block', 
                                  marginBottom: selectedEvent?.id === event.id ? 1 : 0,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {format(new Date(event.event_date), 'MMM d, yyyy')}
                              </Typography>
                              {selectedEvent?.id === event.id && (
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontSize: '0.875rem',
                                      lineHeight: '1.4'
                                    }}
                                  >
                                    {event.content}
                                  </Typography>
                                  {event.url && (
                                    <Button
                                      variant="text"
                                      color="primary"
                                      href={event.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ 
                                        mt: 1,
                                        fontSize: '0.875rem',
                                        textTransform: 'none'
                                      }}
                                    >
                                      Visit Link →
                                    </Button>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Box>
                      );
                    })}
                  </Box>

                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ backgroundColor: '#121212', py: 4 }}>
        <Container maxWidth="lg">
          <TimelinePosts timelineId={id} />
        </Container>
      </Box>
      {/* Event Dialog */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={handleCloseEventDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedEvent && (
            <EventDisplay
              event={selectedEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              currentUserId={1} // TODO: Replace with actual logged-in user ID
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Black space section */}
      <Box sx={{ 
        flex: 1,
        backgroundColor: '#000',
        width: '100%',
        minHeight: '50vh' 
      }} />
    </Box>
  );
}

export default TimelineView;
