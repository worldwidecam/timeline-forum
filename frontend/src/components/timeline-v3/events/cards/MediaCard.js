import React, { useState } from 'react';
import {
  Typography,
  IconButton,
  Link,
  useTheme,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Movie as MediaIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { EVENT_TYPES, EVENT_TYPE_COLORS } from '../EventTypes';
import TagList from './TagList';
import EventPopup from '../EventPopup';

const MediaCard = ({ event, onEdit, onDelete }) => {
  const theme = useTheme();
  const [popupOpen, setPopupOpen] = useState(false);
  const typeColors = EVENT_TYPE_COLORS[EVENT_TYPES.MEDIA];
  const color = theme.palette.mode === 'dark' ? typeColors.dark : typeColors.light;

  const formatDate = (dateStr) => {
    try {
      const date = dateStr ? parseISO(dateStr) : new Date();
      return format(date, 'PPp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const renderMedia = () => {
    if (!event.url) return null;

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(event.url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(event.url);
    const isAudio = /\.(mp3|wav|ogg)$/i.test(event.url);

    if (isImage) {
      return (
        <Box 
          sx={{ 
            width: '100%',
            height: '250px',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2,
          }}
        >
          <img
            src={event.url}
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      );
    }

    if (isVideo) {
      return (
        <Box 
          sx={{ 
            width: '100%',
            height: '250px',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2,
          }}
        >
          <video
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src={event.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }

    if (isAudio) {
      return (
        <Box 
          sx={{ 
            width: '100%',
            mb: 2,
            p: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
          }}
        >
          <audio
            controls
            style={{ width: '100%' }}
          >
            <source src={event.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </Box>
      );
    }

    return null;
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setPopupOpen(true)}
      >
        <motion.div
          className={`
            relative overflow-hidden rounded-xl p-4
            ${theme.palette.mode === 'dark' ? 'bg-black/40' : 'bg-white/80'}
            backdrop-blur-md border
            ${theme.palette.mode === 'dark' ? 'border-white/5' : 'border-black/5'}
            shadow-lg
          `}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            <MediaIcon sx={{ color, mt: 0.5 }} />
            <Typography variant="h6" component="div" sx={{ flex: 1, fontWeight: 'bold' }}>
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(event); }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(event); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Media Preview */}
          {renderMedia()}

          {/* Brief Description */}
          {event.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {event.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto' }}>
            <TagList tags={event.tags} />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'block', 
                textAlign: 'right', 
                mt: 1,
                fontSize: '0.7rem',  // Smaller date for media card
              }}
            >
              {formatDate(event.date)}
            </Typography>
          </Box>
        </motion.div>
      </motion.div>

      <EventPopup 
        event={event}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
};

export default MediaCard;
