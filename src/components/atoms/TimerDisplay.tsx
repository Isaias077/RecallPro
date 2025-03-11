import { Typography, Box, CircularProgress } from '@mui/material';
import { forwardRef } from 'react';

export interface TimerDisplayProps {
  timeLeft: number;
  progress: number;
  mode: 'work' | 'shortBreak' | 'longBreak';
}

/**
 * TimerDisplay atom component that shows the countdown timer with a circular progress indicator.
 * This is an atomic component that serves as a building block for the Pomodoro timer.
 */
export const TimerDisplay = forwardRef<HTMLDivElement, TimerDisplayProps>((props, ref) => {
  const { timeLeft, progress, mode } = props;
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box 
      position="relative" 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      my={4}
      ref={ref}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={200}
        thickness={4}
        sx={{
          color: mode === 'work' ? '#08A0E0' : 'secondary.main',
          position: 'absolute',
        }}
      />
      <Typography variant="h2" component="div">
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
});

TimerDisplay.displayName = 'TimerDisplay';

export default TimerDisplay;