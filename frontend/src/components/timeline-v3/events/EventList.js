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
} from '@mui/material';
import {
  Search as SearchIcon,
  Comment as RemarkIcon,
  Newspaper as NewsIcon,
  PermMedia as MediaIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_TYPES, EVENT_TYPE_COLORS } from './EventTypes';
import RemarkCard from './cards/RemarkCard';
import NewsCard from './cards/NewsCard';
import MediaCard from './cards/MediaCard';

const EventList = ({ events, onEventEdit, onEventDelete, selectedEventId, onEventSelect }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [previousSelectedId, setPreviousSelectedId] = useState(null);
  const eventRefs = useRef({});

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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-h-[600px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 px-4">
      {/* Search and Filter */}
      <div className="mb-6">
        <TextField
          fullWidth
          variant="outlined"
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
        />

        {/* Type Filters */}
        <Stack direction="row" spacing={2} className="mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(null)}
          >
            <Paper
              className={`px-4 py-2 cursor-pointer ${
                !selectedType ? 'bg-blue-500 text-white' : ''
              }`}
            >
              All
            </Paper>
          </motion.div>
          {Object.values(EVENT_TYPES).map((type) => (
            <motion.div
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type)}
            >
              <Paper
                className={`px-4 py-2 cursor-pointer ${
                  selectedType === type ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Paper>
            </motion.div>
          ))}
        </Stack>
      </div>

      {/* Event List */}
      <AnimatePresence mode="popLayout">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            ref={el => {
              eventRefs.current[event.id] = el;
              console.log('Assigned ref for event:', event.id, 'Element:', el); // Debug log
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
    </div>
  );
};

export default EventList;
