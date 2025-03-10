import { Box, Typography, Paper, Chip, Stack, Tooltip } from '@mui/material';
import { useStreak } from '../../contexts/StreakContext';
import {
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  AcUnit as FreezeIcon,
} from '@mui/icons-material';

export default function StreakDisplay() {
  const { currentStreak, longestStreak, streakFreezes, achievements } = useStreak();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#fff',
        border: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Stack spacing={2}>
        {/* Streak Counter */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <FireIcon
              sx={{
                mr: 1,
                color: currentStreak > 0 ? '#ff4d4d' : '#grey',
                animation: currentStreak > 0 ? 'flame 1.5s ease infinite' : 'none',
              }}
            />
            <Typography variant="h6" component="span">
              {currentStreak} Day{currentStreak !== 1 ? 's' : ''} Streak
            </Typography>
          </Box>
          <Tooltip title="Streak Freezes Available">
            <Chip
              icon={<FreezeIcon />}
              label={`${streakFreezes} Freeze${streakFreezes !== 1 ? 's' : ''}`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        </Box>

        {/* Longest Streak */}
        <Box display="flex" alignItems="center">
          <TrophyIcon sx={{ mr: 1, color: '#ffd700' }} />
          <Typography variant="body2" color="text.secondary">
            Longest Streak: {longestStreak} Day{longestStreak !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Achievements */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Logros
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {achievements
              .filter((achievement) => achievement.unlocked)
              .map((achievement) => (
                <Tooltip
                  key={achievement.id}
                  title={achievement.description}
                  arrow
                >
                  <Chip
                    label={achievement.name}
                    color="success"
                    variant="filled"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Tooltip>
              ))}
          </Stack>
        </Box>
      </Stack>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes flame {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Paper>
  );
}