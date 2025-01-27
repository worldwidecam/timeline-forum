import React, { useState } from 'react';
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
import { EVENT_TYPES } from './EventTypes';
import RemarkCard from './cards/RemarkCard';
import NewsCard from './cards/NewsCard';
import MediaCard from './cards/MediaCard';

const EventList = ({ events, onEventEdit, onEventDelete }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderEventCard = (event) => {
    console.log('Rendering event:', event.type); // Debug log
    const commonProps = {
      key: event.id,
      event,
      onEdit: onEventEdit,
      onDelete: handleDeleteClick,
    };

    switch (event.type?.toLowerCase()) {
      case EVENT_TYPES.NEWS:
        return <NewsCard {...commonProps} />;
      case EVENT_TYPES.MEDIA:
        return <MediaCard {...commonProps} />;
      default:
        return <RemarkCard {...commonProps} />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
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
