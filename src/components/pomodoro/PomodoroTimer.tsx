import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

type TimerSettings = {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
};

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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <Box display="flex" justifyContent="center" mb={2}>
          <Stack direction="row" spacing={1}>
            <Button
              variant={mode === 'work' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('work')}
            >
              Trabajo
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('shortBreak')}
              color="secondary"
            >
              Descanso Corto
            </Button>
            <Button
              variant={mode === 'longBreak' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('longBreak')}
              color="secondary"
            >
              Descanso Largo
            </Button>
          </Stack>
        </Box>
        <br />
        <br />
        <Box position="relative" display="flex" justifyContent="center" alignItems="center" my={4}>
          <CircularProgress
            variant="determinate"
            value={calculateProgress()}
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
<br /><br />
        <Box display="flex" justifyContent="center" gap={2} mb={3}>
          <Button
            variant="contained"
            color={mode === 'work' ? 'primary' : 'secondary'}
            startIcon={isActive ? <PauseIcon /> : <PlayIcon />}
            onClick={handleStartPause}
            size="large"
          >
            {isActive ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            size="large"
            style={{color: "#1D1C1A"}}
          >
            Reiniciar
          </Button>
        </Box>

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

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={handleCloseSettings}>
        <DialogTitle>Configuración del Temporizador</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, pt: 1 }}>
            <Typography gutterBottom>Duración del Trabajo (minutos)</Typography>
            <Slider
              value={settings.work}
              min={1}
              max={60}
              step={1}
              marks={[{ value: 25, label: '25' }]}
              valueLabelDisplay="auto"
              sx={{color: "#1D1C1A"}}
              onChange={(_, value) => handleSettingChange('work', value as number)}
            />

            <Typography gutterBottom>Duración del Descanso Corto (minutos)</Typography>
            <Slider
              value={settings.shortBreak}
              min={1}
              max={15}
              step={1}
              marks={[{ value: 5, label: '5' }]}
              valueLabelDisplay="auto"
              sx={{color: "#1D1C1A"}}
              onChange={(_, value) => handleSettingChange('shortBreak', value as number)}
            />

            <Typography gutterBottom>Duración del Descanso Largo (minutos)</Typography>
            <Slider
              value={settings.longBreak}
              min={5}
              max={30}
              step={1}
              marks={[{ value: 15, label: '15' }]}
              valueLabelDisplay="auto"
              sx={{color: "#1D1C1A"}}
              onChange={(_, value) => handleSettingChange('longBreak', value as number)}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="long-break-interval-label">Intervalo de Descanso Largo</InputLabel>
              <Select
                labelId="long-break-interval-label"
                value={settings.longBreakInterval}
                label="Intervalo de Descanso Largo"
                onChange={(e) => handleSettingChange('longBreakInterval', e.target.value as number)}
              >
                {[2, 3, 4, 5, 6].map((value) => (
                  <MenuItem key={value} value={value}>
                    Cada {value} pomodoros
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <Typography component="div" display="flex" justifyContent="space-between" alignItems="center">
                Inicio Automático de Descansos
                <Button
                  variant={settings.autoStartBreaks ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => handleSettingChange('autoStartBreaks', !settings.autoStartBreaks)}
                >
                  {settings.autoStartBreaks ? 'Activado' : 'Desactivado'}
                </Button>
              </Typography>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <Typography component="div" display="flex" justifyContent="space-between" alignItems="center">
                Inicio Automático de Pomodoros
                <Button
                  variant={settings.autoStartPomodoros ? 'contained' : 'outlined'}
                  sx={{color: "#1D1C1A"}}
                  size="small"
                  onClick={() => handleSettingChange('autoStartPomodoros', !settings.autoStartPomodoros)}
                >
                  {settings.autoStartPomodoros ? 'Activado' : 'Desactivado'}
                </Button>
              </Typography>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
