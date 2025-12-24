import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Settings,
  Save,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StudyPreferences = ({ preferences, setPreferences }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences || {
    defaultSessionDuration: 2, // hours
    preferredStartTime: new Date().setHours(9, 0, 0, 0),
    preferredEndTime: new Date().setHours(22, 0, 0, 0),
    breakDuration: 15, // minutes
    maxStudyHoursPerDay: 6,
    avoidWeekends: false,
    morningPerson: false,
    eveningPerson: false,
    dailyAvailability: {
      Monday: { available: true, startTime: new Date().setHours(9, 0, 0, 0), endTime: new Date().setHours(22, 0, 0, 0) },
      Tuesday: { available: true, startTime: new Date().setHours(9, 0, 0, 0), endTime: new Date().setHours(22, 0, 0, 0) },
      Wednesday: { available: true, startTime: new Date().setHours(9, 0, 0, 0), endTime: new Date().setHours(22, 0, 0, 0) },
      Thursday: { available: true, startTime: new Date().setHours(9, 0, 0, 0), endTime: new Date().setHours(22, 0, 0, 0) },
      Friday: { available: true, startTime: new Date().setHours(9, 0, 0, 0), endTime: new Date().setHours(22, 0, 0, 0) },
      Saturday: { available: false, startTime: new Date().setHours(10, 0, 0, 0), endTime: new Date().setHours(18, 0, 0, 0) },
      Sunday: { available: false, startTime: new Date().setHours(10, 0, 0, 0), endTime: new Date().setHours(18, 0, 0, 0) },
    },
  });

  const handleOpenDialog = () => {
    setLocalPreferences(preferences || localPreferences);
    setOpenDialog(true);
  };

  const handleSave = () => {
    setPreferences(localPreferences);
    setOpenDialog(false);
  };

  const updateDayAvailability = (day, field, value) => {
    setLocalPreferences({
      ...localPreferences,
      dailyAvailability: {
        ...localPreferences.dailyAvailability,
        [day]: {
          ...localPreferences.dailyAvailability[day],
          [field]: value,
        },
      },
    });
  };

  const setAllWeekdays = (available) => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newAvailability = { ...localPreferences.dailyAvailability };
    weekdays.forEach(day => {
      newAvailability[day] = {
        ...newAvailability[day],
        available,
      };
    });
    setLocalPreferences({
      ...localPreferences,
      dailyAvailability: newAvailability,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.dark' }}>
              <Settings sx={{ verticalAlign: 'middle', mr: 1 }} />
              Study Preferences
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={handleOpenDialog}
              sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            >
              Configure
            </Button>
          </Box>

          {preferences && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Session Duration
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {preferences.defaultSessionDuration} hours
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Max Hours/Day
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {preferences.maxStudyHoursPerDay} hours
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Preferred Time
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {format(new Date(preferences.preferredStartTime), 'h:mm a')} - {format(new Date(preferences.preferredEndTime), 'h:mm a')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Break Duration
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {preferences.breakDuration} minutes
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Available Days
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {daysOfWeek.map(day => (
                    preferences.dailyAvailability[day]?.available && (
                      <Chip
                        key={day}
                        label={day.substring(0, 3)}
                        size="small"
                        sx={{ bgcolor: 'primary.main', color: 'white' }}
                      />
                    )
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {!preferences && (
            <Alert severity="info">
              Click "Configure" to set up your study preferences and availability.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>
          Study Preferences & Availability
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* General Preferences */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark', fontWeight: 600 }}>
                General Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Default Session Duration (hours)"
                    type="number"
                    fullWidth
                    value={localPreferences.defaultSessionDuration}
                    onChange={(e) => setLocalPreferences({
                      ...localPreferences,
                      defaultSessionDuration: parseFloat(e.target.value) || 2,
                    })}
                    inputProps={{ min: 0.5, max: 8, step: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max Study Hours Per Day"
                    type="number"
                    fullWidth
                    value={localPreferences.maxStudyHoursPerDay}
                    onChange={(e) => setLocalPreferences({
                      ...localPreferences,
                      maxStudyHoursPerDay: parseFloat(e.target.value) || 6,
                    })}
                    inputProps={{ min: 1, max: 12, step: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Preferred Start Time"
                    value={new Date(localPreferences.preferredStartTime)}
                    onChange={(date) => setLocalPreferences({
                      ...localPreferences,
                      preferredStartTime: date.getTime(),
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Preferred End Time"
                    value={new Date(localPreferences.preferredEndTime)}
                    onChange={(date) => setLocalPreferences({
                      ...localPreferences,
                      preferredEndTime: date.getTime(),
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Break Duration (minutes)"
                    type="number"
                    fullWidth
                    value={localPreferences.breakDuration}
                    onChange={(e) => setLocalPreferences({
                      ...localPreferences,
                      breakDuration: parseInt(e.target.value) || 15,
                    })}
                    inputProps={{ min: 0, max: 60, step: 5 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localPreferences.avoidWeekends}
                        onChange={(e) => setLocalPreferences({
                          ...localPreferences,
                          avoidWeekends: e.target.checked,
                        })}
                      />
                    }
                    label="Avoid scheduling study sessions on weekends"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localPreferences.morningPerson}
                        onChange={(e) => setLocalPreferences({
                          ...localPreferences,
                          morningPerson: e.target.checked,
                          eveningPerson: e.target.checked ? false : localPreferences.eveningPerson,
                        })}
                      />
                    }
                    label="I'm a morning person"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localPreferences.eveningPerson}
                        onChange={(e) => setLocalPreferences({
                          ...localPreferences,
                          eveningPerson: e.target.checked,
                          morningPerson: e.target.checked ? false : localPreferences.morningPerson,
                        })}
                      />
                    }
                    label="I'm an evening person"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Daily Availability */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 600 }}>
                  Daily Availability
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={() => setAllWeekdays(true)}>
                    Enable Weekdays
                  </Button>
                  <Button size="small" onClick={() => setAllWeekdays(false)}>
                    Disable Weekdays
                  </Button>
                </Box>
              </Box>
              {daysOfWeek.map((day) => {
                const dayPrefs = localPreferences.dailyAvailability[day] || {
                  available: false,
                  startTime: new Date().setHours(9, 0, 0, 0),
                  endTime: new Date().setHours(22, 0, 0, 0),
                };
                return (
                  <Box key={day} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.200', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={dayPrefs.available}
                          onChange={(e) => updateDayAvailability(day, 'available', e.target.checked)}
                        />
                      }
                      label={<Typography variant="subtitle2" fontWeight={600}>{day}</Typography>}
                    />
                    {dayPrefs.available && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 2, ml: 4 }}>
                        <TimePicker
                          label="Start Time"
                          value={new Date(dayPrefs.startTime)}
                          onChange={(date) => updateDayAvailability(day, 'startTime', date.getTime())}
                          slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                        />
                        <TimePicker
                          label="End Time"
                          value={new Date(dayPrefs.endTime)}
                          onChange={(date) => updateDayAvailability(day, 'endTime', date.getTime())}
                          slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                        />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default StudyPreferences;

