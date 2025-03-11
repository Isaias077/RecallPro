import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import TimerDisplay from '../atoms/TimerDisplay';
import TimerControls from '../molecules/TimerControls';
import TimerModeSelector from '../molecules/TimerModeSelector';
import TimerSettings from '../molecules/TimerSettings';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

type TimerSettings = {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
};

/**
 * PomodoroTimer organism component that combines atoms and molecules to create a complete Pomodoro timer.
 * This component manages the timer state and integrates all the timer-related components.
 */
export default function PomodoroTimer() {
  // Default timer settings (in minutes)
  const defaultSettings: TimerSettings = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  };

  // State for timer
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.work * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [openSettings, setOpenSettings] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Effect to handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Effect to update timeLeft when mode or settings change
  useEffect(() => {
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  // Handle timer completion
  const handleTimerComplete = () => {
    // Play sound if not muted
    if (!muted) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(error => console.error('Error playing sound:', error));
    }

    // Show notification
    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // Determine next break type
      const isLongBreakDue = newCompletedPomodoros % settings.longBreakInterval === 0;
      const nextMode = isLongBreakDue ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      
      setNotificationMessage('¡Sesión de trabajo completada! Es hora de un descanso.');
      setShowNotification(true);
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } else {
      // Break completed, switch to work mode
      setMode('work');
      setNotificationMessage('¡Descanso completado! ¿Listo para empezar a trabajar?');
      setShowNotification(true);
      
      // Auto-start work if enabled
      if (settings.autoStartPomodoros) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }
  };

  // Calculate progress percentage for circular progress
  const calculateProgress = (): number => {
    const totalSeconds = settings[mode] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Handle start/pause button click
  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  // Handle reset button click
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  };

  // Handle mode change
  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
  };

  // Handle settings dialog open/close
  const handleOpenSettings = () => {
    setOpenSettings(true);
  };

  const handleCloseSettings = () => {
    setOpenSettings(false);
  };

  // Handle settings change
  const handleSettingChange = (setting: keyof TimerSettings, value: number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Temporizador Pomodoro
      </Typography>

      {showNotification && (
        <Alert severity="success" onClose={handleCloseNotification} sx={{ mb: 2 }}>
          {notificationMessage}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <TimerModeSelector mode={mode} onModeChange={handleModeChange} />
        
        <TimerDisplay 
          timeLeft={timeLeft} 
          progress={calculateProgress()} 
          mode={mode} 
        />
        
        <TimerControls 
          isActive={isActive} 
          mode={mode} 
          onStartPause={handleStartPause} 
          onReset={handleReset} 
        />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1">
            Completados: {completedPomodoros} pomodoros
          </Typography>
          <Box>
            <IconButton onClick={handleMuteToggle} sx={{color: "#1D1C1A"}}>
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <IconButton onClick={handleOpenSettings} sx={{color: "#1D1C1A"}}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <TimerSettings 
        open={openSettings} 
        settings={settings} 
        onClose={handleCloseSettings} 
        onSettingChange={handleSettingChange} 
      />
    </Box>
  );
}