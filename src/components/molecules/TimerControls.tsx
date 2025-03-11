import { Box } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import Button from '../atoms/Button';

export interface TimerControlsProps {
  isActive: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
  onStartPause: () => void;
  onReset: () => void;
}

/**
 * TimerControls molecule component that provides buttons to control the Pomodoro timer.
 * This component combines Button atoms to create a control panel for the timer.
 */
export const TimerControls = (props: TimerControlsProps) => {
  const { isActive, mode, onStartPause, onReset } = props;
  
  return (
    <Box display="flex" justifyContent="center" gap={2} mb={3}>
      <Button
        variant="contained"
        color={mode === 'work' ? 'primary' : 'secondary'}
        startIcon={isActive ? <PauseIcon /> : <PlayIcon />}
        onClick={onStartPause}
        size="large"
      >
        {isActive ? 'Pausar' : 'Iniciar'}
      </Button>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onReset}
        size="large"
        style={{color: "#1D1C1A"}}
      >
        Reiniciar
      </Button>
    </Box>
  );
};

export default TimerControls;