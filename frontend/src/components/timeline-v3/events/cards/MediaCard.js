import React from 'react';
import {
  Typography,
  IconButton,
  Link,
  useTheme,
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

const MediaCard = ({ event, onEdit, onDelete }) => {
  const theme = useTheme();
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
        <img
          src={event.url}
          alt={event.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    }

    if (isVideo) {
      return (
        <video
          controls
          className="w-full rounded-lg"
          style={{ maxHeight: '200px' }}
        >
          <source src={event.url} type={`video/${event.url.split('.').pop()}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <audio
          controls
          className="w-full mt-4"
        >
          <source src={event.url} type={`audio/${event.url.split('.').pop()}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full cursor-pointer"
      style={{ perspective: '1000px' }}
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
        {/* Type Badge */}
        <div
          className="absolute top-0 left-0 p-3 rounded-tl-xl rounded-br-2xl flex items-center justify-center text-white"
          style={{ 
            backgroundColor: color,
            width: '48px',
            height: '48px',
          }}
        >
          <MediaIcon sx={{ fontSize: 24 }} />
        </div>

        {/* Delete Button */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            color: 'error.main',
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'common.white',
            },
          }}
        >
          <DeleteIcon />
        </IconButton>

        {/* Content */}
        <div className="p-6 pl-16">
          <Typography variant="h6" className="font-semibold mb-2">
            {event.title}
          </Typography>
          
          <Typography className="text-sm opacity-75">
            {event.description}
          </Typography>

          {/* Media Preview */}
          <div className="mt-4">
            {renderMedia()}
          </div>

          {event.url && (
            <Link 
              href={event.url}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm mt-2 opacity-75 hover:opacity-100 inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon sx={{ fontSize: 16 }} />
              View media
            </Link>
          )}

          {/* Metadata */}
          <div className="mt-4 flex items-center justify-between text-sm opacity-50">
            <span>{formatDate(event.event_date || event.date)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MediaCard;
