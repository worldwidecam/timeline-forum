import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  useTheme,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as RemarkIcon,
  Newspaper as NewsIcon,
  PermMedia as MediaIcon,
  Search as SearchIcon,
  ThumbUp as LikeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import EventModal from './EventModal';

const EVENT_TYPES = {
  REMARK: 'remark',
  NEWS: 'news',
  MEDIA: 'media'
};

const EVENT_TYPE_COLORS = {
  [EVENT_TYPES.REMARK]: {
    light: '#2196f3',
    dark: '#1976d2'
  },
  [EVENT_TYPES.NEWS]: {
    light: '#f44336',
    dark: '#e91e63'
  },
  [EVENT_TYPES.MEDIA]: {
    light: '#4caf50',
    dark: '#3e8e41'
  }
};

const EventCard = ({ event, color, onEdit, onDelete, onClick }) => {
  const theme = useTheme();
  
  const getEventTypeIcon = (type) => {
    switch (type) {
      case EVENT_TYPES.REMARK:
        return <RemarkIcon />;
      case EVENT_TYPES.NEWS:
        return <NewsIcon />;
      case EVENT_TYPES.MEDIA:
        return <MediaIcon />;
      default:
        return <RemarkIcon />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full cursor-pointer"
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className={`
          relative overflow-hidden rounded-xl
          ${theme.palette.mode === 'dark' ? 'bg-black/40' : 'bg-white/80'}
          backdrop-blur-md border
          ${theme.palette.mode === 'dark' ? 'border-white/5' : 'border-black/5'}
          shadow-lg
        `}
        whileHover={{
          boxShadow: theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Content Container */}
        <div className="relative p-6">
          {/* Event Type Badge */}
          <div
            className="absolute -top-3 left-6 px-3 py-1 rounded-full flex items-center gap-2 text-white text-sm font-medium"
            style={{ 
              backgroundColor: color,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {getEventTypeIcon(event.type)}
            <span className="capitalize">{event.type}</span>
          </div>

          {/* Main Content */}
          <div className="mt-4">
            <Typography 
              variant="h6" 
              className={`
                font-semibold mb-2
                ${event.type === EVENT_TYPES.NEWS ? 'font-serif' : 'font-sans'}
              `}
            >
              {event.title}
            </Typography>

            {/* Preview Content */}
            {event.type === EVENT_TYPES.NEWS && event.url_image && (
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <motion.img
                  src={event.url_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}

            {event.type === EVENT_TYPES.MEDIA && event.media_url && (
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-black/5">
                {event.media_type === 'video' ? (
                  <video
                    src={event.media_url}
                    className="w-full h-full object-cover"
                  />
                ) : event.media_type === 'audio' ? (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <MediaIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    </motion.div>
                  </div>
                ) : (
                  <img
                    src={event.media_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <Typography 
              variant="body2" 
              color="text.secondary"
              className="line-clamp-2 mb-4"
            >
              {event.description}
            </Typography>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <LikeIcon fontSize="small" />
                  <span className="text-sm">24</span>
                </div>
                <div className="flex items-center gap-1">
                  <RemarkIcon fontSize="small" />
                  <span className="text-sm">12</span>
                </div>
              </div>

              <Typography variant="caption" color="text.secondary">
                {format(new Date(event.event_date), 'MMM d, yyyy')}
              </Typography>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute top-2 right-2 flex gap-1"
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className={`
                ${theme.palette.mode === 'dark' ? 'bg-white/10' : 'bg-black/5'}
                hover:bg-primary-500 hover:text-white
                transition-colors
              `}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              className={`
                ${theme.palette.mode === 'dark' ? 'bg-white/10' : 'bg-black/5'}
                hover:bg-red-500 hover:text-white
                transition-colors
              `}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EventList = ({ events, onEventEdit, onEventDelete }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getEventColor = (type) => {
    const colors = EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS[EVENT_TYPES.REMARK];
    return theme.palette.mode === 'dark' ? colors.dark : colors.light;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <Paper 
      elevation={0}
      className={`
        p-6 mt-6 rounded-2xl
        ${theme.palette.mode === 'dark' ? 'bg-black/20' : 'bg-white/60'}
        backdrop-blur-sm
      `}
    >
      {/* Header */}
      <div className="mb-6">
        <Typography variant="h5" className="font-semibold mb-4">
          Event List
        </Typography>
        
        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap">
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
            className="flex-1"
          />
          <Stack direction="row" spacing={1}>
            {Object.values(EVENT_TYPES).map((type) => (
              <motion.button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  transition-colors duration-200
                  ${selectedType === type
                    ? 'bg-primary-500 text-white'
                    : theme.palette.mode === 'dark'
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-black/5 text-black/70 hover:bg-black/10'
                  }
                `}
              >
                {type}
              </motion.button>
            ))}
          </Stack>
        </div>
      </div>

      {/* Event Cards */}
      <AnimatePresence>
        <motion.div
          className="grid gap-6"
          layout
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              color={getEventColor(event.type)}
              onEdit={onEventEdit}
              onDelete={onEventDelete}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </Paper>
  );
};

export default EventList;
