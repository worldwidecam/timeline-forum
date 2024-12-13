import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Timeline Forum
          </Typography>
          <Button color="inherit" component={Link} to="/create-timeline">
            Create Timeline
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
