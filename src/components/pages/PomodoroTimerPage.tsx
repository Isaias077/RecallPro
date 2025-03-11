import React from 'react';
import { Box } from '@mui/material';
import PomodoroTimer from '../pomodoro/PomodoroTimer';
import PageLayout from '../templates/PageLayout';
import Typography from '../atoms/Typography';

/**
 * PomodoroTimerPage component
 * 
 * A page component that provides an interface for using the Pomodoro technique for time management.
 * This page uses the PomodoroTimer organism and is mapped to the /pomodoro route.
 */
const PomodoroTimerPage: React.FC = () => {
  return (
    <PageLayout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pomodoro Timer
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Use the Pomodoro technique to manage your study sessions and breaks effectively.
        </Typography>
        <PomodoroTimer />
      </Box>
    </PageLayout>
  );
};

export default PomodoroTimerPage;