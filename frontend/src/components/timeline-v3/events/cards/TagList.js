import React from 'react';
import { Chip, Box, useTheme } from '@mui/material';
import { Label as TagIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const TagList = ({ tags }) => {
  const theme = useTheme();
  if (!tags || tags.length === 0) return null;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 0.75, 
        flexWrap: 'wrap', 
        mt: 2,
      }}
    >
      {tags.map((tag) => {
        // Generate a unique color based on the tag name
        const stringToColor = (str) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
          }
          const hue = Math.abs(hash % 360);
          return `hsl(${hue}, 30%, 50%)`;
        };

        const tagColor = stringToColor(tag.name);

        return (
          <Chip
            key={tag.id}
            icon={
              <TagIcon 
                sx={{ 
                  fontSize: 14,
                  color: theme.palette.mode === 'dark' ? 'inherit' : `${tagColor}`,
                }} 
              />
            }
            label={tag.name}
            size="small"
            sx={{
              height: '24px',
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(tagColor, 0.2)
                : alpha(tagColor, 0.1),
              color: theme.palette.mode === 'dark' 
                ? theme.palette.common.white 
                : tagColor,
              border: 'none',
              borderRadius: '6px',
              transition: theme.transitions.create(
                ['background-color', 'box-shadow', 'transform'],
                { duration: 200 }
              ),
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(tagColor, 0.3)
                  : alpha(tagColor, 0.2),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 8px ${alpha(tagColor, 0.2)}`,
              },
              '& .MuiChip-label': {
                px: 1,
                fontSize: '0.75rem',
                fontWeight: 500,
              },
              '& .MuiChip-icon': {
                mr: 0.5,
                ml: 0.5,
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default TagList;
