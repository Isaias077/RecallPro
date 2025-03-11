import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export interface TimerSettingsProps {
  open: boolean;
  settings: {
    work: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  };
  onClose: () => void;
  onSettingChange: (setting: keyof TimerSettingsProps['settings'], value: number | boolean) => void;
}

/**
 * TimerSettings molecule component that provides a dialog for configuring Pomodoro timer settings.
 * This component combines various atoms to create a settings panel.
 */
export const TimerSettings = (props: TimerSettingsProps) => {
  const { open, settings, onClose, onSettingChange } = props;
  
  return (
    <Dialog open={open} onClose={onClose}>
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
            onChange={(_, value) => onSettingChange('work', value as number)}
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
            onChange={(_, value) => onSettingChange('shortBreak', value as number)}
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
            onChange={(_, value) => onSettingChange('longBreak', value as number)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="long-break-interval-label">Intervalo de Descanso Largo</InputLabel>
            <Select
              labelId="long-break-interval-label"
              value={settings.longBreakInterval}
              label="Intervalo de Descanso Largo"
              onChange={(e) => onSettingChange('longBreakInterval', e.target.value as number)}
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
                onClick={() => onSettingChange('autoStartBreaks', !settings.autoStartBreaks)}
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
                onClick={() => onSettingChange('autoStartPomodoros', !settings.autoStartPomodoros)}
              >
                {settings.autoStartPomodoros ? 'Activado' : 'Desactivado'}
              </Button>
            </Typography>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimerSettings;