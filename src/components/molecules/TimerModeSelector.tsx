import { Stack, Button } from '@mui/material';

export interface TimerModeSelectorProps {
  mode: 'work' | 'shortBreak' | 'longBreak';
  onModeChange: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
}

/**
 * TimerModeSelector molecule component that provides buttons to switch between timer modes.
 * This component combines Button atoms to create a mode selection panel.
 */
export const TimerModeSelector = (props: TimerModeSelectorProps) => {
  const { mode, onModeChange } = props;
  
  return (
    <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
      <Button
        variant={mode === 'work' ? 'contained' : 'outlined'}
        onClick={() => onModeChange('work')}
      >
        Trabajo
      </Button>
      <Button
        variant={mode === 'shortBreak' ? 'contained' : 'outlined'}
        onClick={() => onModeChange('shortBreak')}
        color="secondary"
      >
        Descanso Corto
      </Button>
      <Button
        variant={mode === 'longBreak' ? 'contained' : 'outlined'}
        onClick={() => onModeChange('longBreak')}
        color="secondary"
      >
        Descanso Largo
      </Button>
    </Stack>
  );
};

export default TimerModeSelector;