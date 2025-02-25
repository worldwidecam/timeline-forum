import React from 'react';
import { Paper, Typography, Box, IconButton, Chip, Link, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow, format } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';

const TimelineEvent = ({ event, position = 'left', onDelete }) => {
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(event);
    setDeleteDialogOpen(false);
  };

  const formatEventDate = (date) => {
    try {
      return format(new Date(date), 'PPP p'); // e.g., "April 29, 1945 at 3:30 PM"
    } catch (e) {
      return 'Date unknown';
    }
  };

  const formatCreatedDate = (date) => {
    try {
      return format(new Date(date), 'PPP p'); // Use the same format as event date
    } catch (e) {
      return 'Date unknown';
    }
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 0,
          mb: 3,
          maxWidth: '600px',
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[6],
          },
          [theme.breakpoints.up('md')]: {
            ml: position === 'left' ? 0 : 'auto',
            mr: position === 'right' ? 0 : 'auto',
          },
        }}
      >
        {/* Delete Button */}
        <IconButton
          onClick={handleDeleteClick}
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

        {/* Media Section */}
        {event.media_url && (
          <Box sx={{ width: '100%', position: 'relative' }}>
            {event.media_type === 'image' ? (
              <Box
                component="img"
                src={event.media_url}
                alt={event.title}
                sx={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                }}
              />
            ) : event.media_type === 'audio' ? (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.grey[100],
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <AudiotrackIcon color="primary" />
                <audio controls style={{ width: '100%' }}>
                  <source src={event.media_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            ) : null}
          </Box>
        )}

        {/* Content Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2
          }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                lineHeight: 1.3,
                mb: 1
              }}
            >
              {event.title}
            </Typography>
            
            {/* Event Date Chip - Moved next to title */}
            <Chip
              icon={<EventIcon />}
              label={formatEventDate(event.event_date)}
              size="small"
              color="primary"
              sx={{ alignSelf: 'flex-start', mb: 1 }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Chip
              icon={<PersonIcon />}
              label={`Created by User ${event.created_by}`}
              size="small"
              variant="outlined"
            />
            {event.created_at && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`Published On ${formatCreatedDate(event.created_at)}`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            {event.description}
          </Typography>

          {/* URL Preview Section */}
          {event.url && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme.palette.grey[50],
                borderRadius: 1,
                border: `1px solid ${theme.palette.grey[200]}`,
              }}
            >
              <Link
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ display: 'block' }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {event.url_image && (
                    <Box
                      component="img"
                      src={event.url_image}
                      alt={event.url_title || 'Link preview'}
                      sx={{
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <LinkIcon fontSize="small" color="action" />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                      >
                        {event.url_title || 'Visit Link'}
                      </Typography>
                    </Box>
                    {event.url_description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.url_description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Link>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{event.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TimelineEvent;
