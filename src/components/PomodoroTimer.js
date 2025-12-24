import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
} from '@mui/icons-material';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5); // minutes
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (sessionType === 'work') {
      setCompletedPomodoros((prev) => prev + 1);
      // Auto-start break
      setSessionType('break');
      setTimeLeft(breakDuration * 60);
      // Play notification sound (optional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: 'Time for a break!',
        });
      }
    } else {
      // Break complete, reset to work
      setSessionType('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? workDuration * 60 : breakDuration * 60);
    setCompletedPomodoros(0);
  };

  const handleWorkDurationChange = (minutes) => {
    setWorkDuration(minutes);
    if (sessionType === 'work' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const handleBreakDurationChange = (minutes) => {
    setBreakDuration(minutes);
    if (sessionType === 'break' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'work'
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Pomodoro Timer
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                  <CircularProgress
                    variant="determinate"
                    value={progress}
                    size={280}
                    thickness={4}
                    sx={{
                      color: sessionType === 'work' ? '#7E698B' : '#828B85',
                      transform: 'rotate(-90deg)',
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h2"
                      component="div"
                      sx={{
                        fontWeight: 600,
                        color: sessionType === 'work' ? '#7E698B' : '#828B85',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatTime(timeLeft)}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        mt: 1,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={isRunning ? <Pause /> : <PlayArrow />}
                    onClick={isRunning ? handlePause : handleStart}
                    sx={{
                      bgcolor: sessionType === 'work' ? '#7E698B' : '#828B85',
                      '&:hover': {
                        bgcolor: sessionType === 'work' ? '#6a5a77' : '#6f7a73',
                      },
                    }}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Stop />}
                    onClick={handleStop}
                  >
                    Stop
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Refresh />}
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Settings
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Work Duration</InputLabel>
                  <Select
                    value={workDuration}
                    label="Work Duration"
                    onChange={(e) => handleWorkDurationChange(e.target.value)}
                    disabled={isRunning}
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={20}>20 minutes</MenuItem>
                    <MenuItem value={25}>25 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Break Duration</InputLabel>
                  <Select
                    value={breakDuration}
                    label="Break Duration"
                    onChange={(e) => handleBreakDurationChange(e.target.value)}
                    disabled={isRunning}
                  >
                    <MenuItem value={3}>3 minutes</MenuItem>
                    <MenuItem value={5}>5 minutes</MenuItem>
                    <MenuItem value={10}>10 minutes</MenuItem>
                    <MenuItem value={15}>15 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Session Stats
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 600, color: '#7E698B', mb: 1 }}>
                  {completedPomodoros}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Completed Pomodoros
                </Typography>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Focus Time
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {Math.floor((completedPomodoros * workDuration) / 60)}h{' '}
                  {(completedPomodoros * workDuration) % 60}m
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                About Pomodoro
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The Pomodoro Technique is a time management method that uses a timer to break work into intervals,
                traditionally 25 minutes in length, separated by short breaks.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>How it works:</strong>
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Work for {workDuration} minutes
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Take a {breakDuration}-minute break
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Repeat and track your progress
                  </Typography>
                </li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PomodoroTimer;

