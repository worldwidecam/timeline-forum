import React from 'react';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Menu as MenuIcon } from '@mui/icons-material';

// Styled component for the page corner
const PageCorner = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '45px',
  height: '45px',
  background: 'transparent',
  overflow: 'hidden',
  cursor: 'pointer',
  zIndex: 10,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '45px',
    height: '45px',
    background: color || theme.palette.primary.main,
    transformOrigin: '100% 0',
    transition: 'all 0.3s ease',
    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
  },
  '&:hover::before': {
    width: '40px',
    height: '40px',
    transform: 'translateZ(5px)',
  },
  '&:active::before': {
    width: '38px',
    height: '38px',
  }
}));

const PageCornerButton = ({ onClick, tooltip = "Details", color }) => {
  const theme = useTheme();
  
  return (
    <Tooltip title={tooltip} placement="left">
      <PageCorner 
        color={color}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
        }}
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            zIndex: 11,
            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MenuIcon fontSize="small" />
        </motion.div>
      </PageCorner>
    </Tooltip>
  );
};

export default PageCornerButton;
