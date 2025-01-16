import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, useTheme, Button, Fade, Stack, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import TimelineBackground from './TimelineBackground';
import TimelineBar from './TimelineBar';
import TimeMarkers from './TimeMarkers';
import HoverMarker from './HoverMarker';

function TimelineV3() {
  const { id } = useParams();
  const { user } = useAuth();
  const theme = useTheme();

  const getCurrentDateTime = () => {
    return new Date();
  };

  const getExactTimePosition = () => {
    const now = getCurrentDateTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate position between current hour and next hour
    // For example, 7:30 PM would be 0.5 between position 0 and 1
    return currentMinute / 60;
  };

  // Core state
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [markers, setMarkers] = useState(Array.from({ length: 11 }, (_, i) => i - 5)); // Creates [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
  const [hoverPosition, setHoverPosition] = useState(getExactTimePosition());
  const [viewMode, setViewMode] = useState('day');

  // Navigation functions
  const handleLeft = () => {
    const minMarker = Math.min(...markers);
    setMarkers([...markers, minMarker - 1]);
    setTimelineOffset(timelineOffset + 100);
  };

  const handleRight = () => {
    const maxMarker = Math.max(...markers);
    setMarkers([...markers, maxMarker + 1]);
    setTimelineOffset(timelineOffset - 100);
  };

  const handleRecenter = () => {
    setTimelineOffset(0);
  };

  // Marker styles
  const markerStyles = {
    reference: {
      '& .marker-line': {
        height: '20px',
        width: '2px',
        backgroundColor: theme.palette.primary.main
      }
    },
    regular: {
      '& .marker-line': {
        height: '10px',
        width: '1px',
        backgroundColor: theme.palette.text.secondary
      }
    }
  };

  // Update hover position every minute
  useEffect(() => {
    if (viewMode === 'day') {
      const interval = setInterval(() => {
        setHoverPosition(getExactTimePosition());
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'auto',
      bgcolor: theme.palette.mode === 'light' ? 'background.default' : '#000',
      overflowX: 'hidden'
    }}>
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" component="div" sx={{ color: theme.palette.primary.main }}>
                # Timeline V3
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                Coordinate View
              </Typography>
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                Reference point is position 0
              </Typography>
              <Fade in={timelineOffset !== 0}>
                <Button
                  onClick={handleRecenter}
                  variant="contained"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    boxShadow: 2
                  }}
                >
                  Back to Present
                </Button>
              </Fade>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant={viewMode === 'day' ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode(viewMode === 'day' ? 'position' : 'day')}
            >
              Day
            </Button>
            <Button
              variant="outlined"
              size="small"
            >
              Week
            </Button>
            <Button
              variant="outlined"
              size="small"
            >
              Month
            </Button>
            <Button
              variant="outlined"
              size="small"
            >
              Year
            </Button>
          </Stack>
        </Stack>
        
        <Box 
          sx={{
            width: '100%',
            height: '300px',
            bgcolor: theme.palette.mode === 'light' ? 'background.paper' : '#2c1b47',
            borderRadius: 2,
            boxShadow: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <TimelineBackground />
          <TimelineBar
            timelineOffset={timelineOffset}
            markerSpacing={100}
            minMarker={Math.min(...markers)}
            maxMarker={Math.max(...markers)}
            theme={theme}
          />
          <TimeMarkers 
            timelineOffset={timelineOffset}
            markerSpacing={100}
            markerStyles={markerStyles}
            markers={markers}
            viewMode={viewMode}
            theme={theme}
          />
          <HoverMarker 
            position={viewMode === 'day' ? getExactTimePosition() : hoverPosition}
            timelineOffset={timelineOffset}
            markerSpacing={100}
            viewMode={viewMode}
            theme={theme}
          />
          <Button
            onClick={handleLeft}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: 100,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            LEFT
          </Button>
          <Button
            onClick={handleRight}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: 100,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            RIGHT
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default TimelineV3;
