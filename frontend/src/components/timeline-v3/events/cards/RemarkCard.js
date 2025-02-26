import React, { useState } from 'react';
import {
  Typography,
  IconButton,
  Link,
  useTheme,
  Box,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as RemarkIcon,
  Link as LinkIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { EVENT_TYPES, EVENT_TYPE_COLORS } from '../EventTypes';
import TagList from './TagList';
import EventPopup from '../EventPopup';

const RemarkCard = ({ event, onEdit, onDelete }) => {
  const theme = useTheme();
  const [popupOpen, setPopupOpen] = useState(false);
  const typeColors = EVENT_TYPE_COLORS[EVENT_TYPES.REMARK];
  const color = theme.palette.mode === 'dark' ? typeColors.dark : typeColors.light;

  const formatDate = (dateStr) => {
    try {
      const date = dateStr ? parseISO(dateStr) : new Date();
      // Format with "Published on" prefix, without seconds
      // The backend now handles timezone adjustment
      return `Published on ${format(date, 'PPp')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatEventDate = (dateStr) => {
    try {
      const date = dateStr ? parseISO(dateStr) : new Date();
      // Format event date without "Published on" prefix
      // The backend now handles timezone adjustment
      return format(date, 'PPp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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
            <RemarkIcon sx={{ color, mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {event.title}
              </Typography>
              {event.event_date && (
                <Chip
                  icon={<EventIcon />}
                  label={formatEventDate(event.event_date)}
                  size="small"
                  color="primary"
                  sx={{ mb: 1 }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(event); }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(event); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Description with larger space */}
          <Box sx={{ mb: 2, maxHeight: '150px', overflow: 'hidden' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {event.description}
            </Typography>
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <TagList tags={event.tags} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.75rem' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(event.created_at)}
              </Typography>
            </Box>
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

export default RemarkCard;
