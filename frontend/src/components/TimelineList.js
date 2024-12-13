import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';
import axios from 'axios';

function TimelineList() {
  const [timelines, setTimelines] = useState([]);

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/timelines');
        setTimelines(response.data);
      } catch (error) {
        console.error('Error fetching timelines:', error);
      }
    };
    fetchTimelines();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Timelines
        </Typography>
        <Button
          component={Link}
          to="/create-timeline"
          variant="contained"
          color="primary"
        >
          Create Timeline
        </Button>
      </Box>
      <Grid container spacing={3}>
        {timelines.map((timeline) => (
          <Grid item xs={12} sm={6} md={4} key={timeline.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {timeline.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {timeline.description}
                </Typography>
                <Button
                  component={Link}
                  to={`/timeline/${timeline.id}`}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  View Timeline
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default TimelineList;
