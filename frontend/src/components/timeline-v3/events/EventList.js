import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Comment as RemarkIcon,
  Newspaper as NewsIcon,
  PermMedia as MediaIcon,
  Delete as DeleteIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_TYPES, EVENT_TYPE_COLORS } from './EventTypes';
import RemarkCard from './cards/RemarkCard';
import NewsCard from './cards/NewsCard';
import MediaCard from './cards/MediaCard';
import EventCounter from './EventCounter';

const EventList = ({ events, onEventEdit, onEventDelete, selectedEventId, onEventSelect }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [sortOrder, setSortOrder] = useState(() => {
    // Load saved preference or default to 'newest'
    return localStorage.getItem('timeline_sort_preference') || 'newest';
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [previousSelectedId, setPreviousSelectedId] = useState(null);
  const eventRefs = useRef({});

  // Save sort preference whenever it changes
  useEffect(() => {
    localStorage.setItem('timeline_sort_preference', sortOrder);
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  }, [sortOrder]);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      onEventDelete(eventToDelete);
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const scrollToEvent = (eventId) => {
    const eventElement = eventRefs.current[eventId];
    console.log('Scrolling to event:', eventId, 'Element:', eventElement); // Debug log
    if (eventElement) {
      eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.error('Event element not found:', eventId); // Debug log
    }
  };

  const handleEventDotClick = (eventId) => {
    scrollToEvent(eventId);
  };

  // Handle selection changes and scrolling
  useEffect(() => {
    if (selectedEventId !== previousSelectedId) {
      // Set a timeout to allow the fade-out animation of the previous selection
      const timeoutId = setTimeout(() => {
        if (selectedEventId && eventRefs.current[selectedEventId]) {
          eventRefs.current[selectedEventId].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 200);

      setPreviousSelectedId(selectedEventId);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedEventId, previousSelectedId]);

  // Centering the focused card
  useEffect(() => {
    if (selectedEventId && eventRefs.current[selectedEventId]) {
      const cardElement = eventRefs.current[selectedEventId];
      const { top, height } = cardElement.getBoundingClientRect();
      const centerOffset = (window.innerHeight / 2) - (height / 2);
      window.scrollTo({
        top: top + window.scrollY - centerOffset,
        behavior: 'smooth'
      });
    }
  }, [selectedEventId]);

  const renderEventCard = (event) => {
    const isSelected = event.id === selectedEventId;
    const wasSelected = event.id === previousSelectedId && event.id !== selectedEventId;
    console.log('Rendering event:', event.type, 'Selected:', isSelected); // Debug log

    const commonProps = {
      key: event.id,
      event,
      onEdit: onEventEdit,
      onDelete: handleDeleteClick,
    };

    const card = (() => {
      switch (event.type?.toLowerCase()) {
        case EVENT_TYPES.NEWS:
          return <NewsCard {...commonProps} />;
        case EVENT_TYPES.MEDIA:
          return <MediaCard {...commonProps} />;
        default:
          return <RemarkCard {...commonProps} />;
      }
    })();

    // Get the appropriate color based on event type
    const getEventColor = () => {
      if (!event.type) return theme.palette.primary.main;
      const colors = EVENT_TYPE_COLORS[event.type];
      return theme.palette.mode === 'dark' ? colors.dark : colors.light;
    };

    return (
      <motion.div
        animate={isSelected ? {
          scale: [1, 1.02, 1],
          boxShadow: [
            "0px 0px 0px 0px rgba(0,0,0,0)",
            `0px 0px 8px 2px ${getEventColor()}`,
            `0px 0px 0px 2px ${getEventColor()}`
          ],
          border: `2px solid ${getEventColor()}`
        } : {
          scale: 1,
          boxShadow: "0px 0px 0px 0px rgba(0,0,0,0)",
          border: "2px solid transparent"
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
          times: [0, 0.6, 1]
        }}
        style={{
          borderRadius: '8px',
          marginBottom: '16px',
          opacity: wasSelected ? 0.7 : 1,
          transition: 'opacity 0.3s ease-out'
        }}
        onClick={() => {
          console.log('Clicked event ID:', event.id);
          if (selectedEventId !== event.id) {
            onEventSelect(event);
            const cardElement = eventRefs.current[event.id];
            if (cardElement) {
              const { top, height } = cardElement.getBoundingClientRect();
              const centerOffset = (window.innerHeight / 2) - (height / 2);
              window.scrollTo({
                top: top + window.scrollY - centerOffset,
                behavior: 'smooth'
              });
            } else {
              console.warn('No reference found for event ID:', event.id);
            }
          }
        }}
      >
        {card}
      </motion.div>
    );
  };

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || event.type.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <Stack spacing={2} sx={{ px: 3 }}>
      {/* Search and Sort Controls */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            label="Sort By"
            startAdornment={
              <InputAdornment position="start">
                <SortIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Filter Options */}
      <Paper 
        sx={{ 
          p: 1,
          bgcolor: theme => theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.6)' 
            : 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)'
        }}
        elevation={0}
      >
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Button
            variant={selectedType === null ? "contained" : "outlined"}
            size="small"
            onClick={() => setSelectedType(null)}
            sx={{
              minWidth: '80px',
              bgcolor: selectedType === null ? theme.palette.primary.main : 'transparent',
              '&:hover': {
                bgcolor: selectedType === null 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover
              }
            }}
          >
            All
          </Button>
          {Object.entries(EVENT_TYPES).map(([key, type]) => (
            <Button
              key={type}
              variant={selectedType === type ? "contained" : "outlined"}
              size="small"
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              startIcon={
                type === EVENT_TYPES.REMARK ? <RemarkIcon /> :
                type === EVENT_TYPES.NEWS ? <NewsIcon /> :
                <MediaIcon />
              }
              sx={{
                minWidth: '100px',
                bgcolor: selectedType === type ? EVENT_TYPE_COLORS[type].light : 'transparent',
                color: selectedType === type ? 'white' : EVENT_TYPE_COLORS[type].light,
                borderColor: EVENT_TYPE_COLORS[type].light,
                '&:hover': {
                  bgcolor: selectedType === type 
                    ? EVENT_TYPE_COLORS[type].light
                    : `${EVENT_TYPE_COLORS[type].light}22`,
                  borderColor: EVENT_TYPE_COLORS[type].light
                }
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Event List */}
      <AnimatePresence mode="sync">
        {filteredAndSortedEvents.map((event) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            ref={el => {
              eventRefs.current[event.id] = el;
            }}
          >
            {renderEventCard(event)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{eventToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default EventList;
