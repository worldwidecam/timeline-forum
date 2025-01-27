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
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as RemarkIcon,
  Newspaper as NewsIcon,
  PermMedia as MediaIcon,
  Search as SearchIcon,
  ThumbUp as LikeIcon,
  Link as LinkIcon,
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
        return <RemarkIcon sx={{ fontSize: 24 }} />;
      case EVENT_TYPES.NEWS:
        return <NewsIcon sx={{ fontSize: 24 }} />;
      case EVENT_TYPES.MEDIA:
        return <MediaIcon sx={{ fontSize: 24 }} />;
      default:
        return <RemarkIcon sx={{ fontSize: 24 }} />;
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
        {/* Event Type Badge */}
        <div
          className="absolute top-0 left-0 p-3 rounded-tl-xl rounded-br-2xl flex items-center justify-center text-white"
          style={{ 
            backgroundColor: color,
            width: '48px',
            height: '48px',
          }}
        >
          {getEventTypeIcon(event.type)}
        </div>

        {/* Content Container */}
        <div className="relative p-6 pl-16">
          {/* Main Content */}
          <div className="mt-4">
            {event.type === EVENT_TYPES.NEWS ? (
              <div>
                {/* News Title */}
                <Typography 
                  variant="h6" 
                  className="font-serif font-semibold mb-2"
                >
                  {event.title}
                </Typography>

                {/* URL Preview Card */}
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block no-underline mb-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box
                      className={`
                        rounded-lg overflow-hidden border
                        ${theme.palette.mode === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-black/10 hover:border-black/20'}
                        transition-all duration-200
                        hover:scale-[1.02]
                      `}
                    >
                      {event.url_image && (
                        <div className="relative h-48 bg-black/5">
                          <img
                            src={event.url_image}
                            alt={event.url_title || event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <Typography 
                          variant="subtitle1" 
                          className="font-medium mb-1 line-clamp-2"
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {event.url_title || event.title}
                        </Typography>
                        {event.url_description && (
                          <Typography 
                            variant="body2" 
                            className="line-clamp-2 mb-2"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {event.url_description}
                          </Typography>
                        )}
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          alignItems="center"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          <LinkIcon fontSize="small" />
                          <Typography variant="caption">
                            {event.url_source || new URL(event.url).hostname}
                          </Typography>
                        </Stack>
                      </div>
                    </Box>
                  </a>
                )}

                {/* Additional Description */}
                {event.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    className="line-clamp-2"
                  >
                    {event.description}
                  </Typography>
                )}
              </div>
            ) : (
              <>
                <Typography 
                  variant="h6" 
                  className="font-semibold mb-2"
                >
                  {event.title}
                </Typography>

                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  className="line-clamp-2 mb-4"
                >
                  {event.description}
                </Typography>
              </>
            )}
          </div>

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
            {Object.values(EVENT_TYPES).map((type) => {
              const typeColor = EVENT_TYPE_COLORS[type];
              const Icon = type === EVENT_TYPES.REMARK ? RemarkIcon :
                          type === EVENT_TYPES.NEWS ? NewsIcon : MediaIcon;
              
              return (
                <motion.button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    transition-colors duration-200
                    flex items-center gap-2
                  `}
                  style={{
                    backgroundColor: selectedType === type 
                      ? (theme.palette.mode === 'dark' ? typeColor.dark : typeColor.light)
                      : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    color: selectedType === type 
                      ? '#fff'
                      : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                  }}
                >
                  <Icon fontSize="small" />
                  <span className="capitalize">{type}</span>
                </motion.button>
              );
            })}
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
