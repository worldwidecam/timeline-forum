import React from 'react';
import { Chip, Box } from '@mui/material';
import { Label as TagIcon } from '@mui/icons-material';

const TagList = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          icon={<TagIcon sx={{ fontSize: 16 }} />}
          label={tag.name}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: '4px',
            height: '24px',
            '& .MuiChip-label': {
              px: 1,
              fontSize: '0.75rem',
            },
          }}
        />
      ))}
    </Box>
  );
};

export default TagList;
