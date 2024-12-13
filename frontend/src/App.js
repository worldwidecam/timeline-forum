import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import TimelineList from './components/TimelineList';
import TimelineView from './components/TimelineView';
import CreateTimeline from './components/CreateTimeline';
import CreateEvent from './components/CreateEvent';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<TimelineList />} />
          <Route path="/timeline/:id" element={<TimelineView />} />
          <Route path="/create-timeline" element={<CreateTimeline />} />
          <Route path="/timeline/:id/create-event" element={<CreateEvent />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
