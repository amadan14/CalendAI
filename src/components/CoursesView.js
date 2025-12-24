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
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { COURSE_COLORS, getCourseColor } from '../utils/colorPalette';

const CoursesView = ({ courses, setCourses }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instructor: '',
    credits: '',
    days: [],
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    color: COURSE_COLORS[0].value, // Default to first color
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        code: course.code || '',
        instructor: course.instructor || '',
        credits: course.credits || '',
        days: course.days || [],
        startTime: course.startTime ? new Date(course.startTime) : new Date(),
        endTime: course.endTime ? new Date(course.endTime) : new Date(),
        location: course.location || '',
        color: course.color || getCourseColor(course.name, [course]),
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        code: '',
        instructor: '',
        credits: '',
        days: [],
        startTime: new Date(),
        endTime: new Date(),
        location: '',
        color: COURSE_COLORS[0].value,
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (formData.name) {
      const course = {
        id: editingCourse?.id || Date.now().toString(),
        ...formData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        createdAt: editingCourse?.createdAt || new Date().toISOString(),
      };

      if (editingCourse) {
        setCourses(courses.map(c => c.id === course.id ? course : c));
      } else {
        setCourses([...courses, course]);
      }
      setOpenDialog(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter(d => d !== day)
        : [...formData.days, day],
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Courses
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Course
          </Button>
        </Box>

        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: course.color || getCourseColor(course.name, courses),
                          border: 1,
                          borderColor: 'grey.300',
                        }}
                      />
                      <Box>
                        <Typography variant="h6" component="h2">
                          {course.name}
                        </Typography>
                        {course.code && (
                          <Typography variant="body2" color="text.secondary">
                            {course.code}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(course)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  {course.instructor && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Instructor:</strong> {course.instructor}
                    </Typography>
                  )}
                  {course.credits && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Credits:</strong> {course.credits}
                    </Typography>
                  )}
                  {course.location && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Location:</strong> {course.location}
                    </Typography>
                  )}
                  {course.days && course.days.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Schedule:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {course.days.map((day) => (
                          <Chip key={day} label={day} size="small" />
                        ))}
                      </Box>
                      {course.startTime && course.endTime && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {new Date(course.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(course.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {courses.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary" align="center">
                    No courses added yet. Click "Add Course" to get started.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Course Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                label="Course Code"
                fullWidth
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., CS 101"
              />
              <TextField
                label="Instructor"
                fullWidth
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
              <TextField
                label="Credits"
                fullWidth
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              />
              <TextField
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 201"
              />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Days of Week
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {daysOfWeek.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      onClick={() => toggleDay(day)}
                      color={formData.days.includes(day) ? 'primary' : 'default'}
                      variant={formData.days.includes(day) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
              <TimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(date) => setFormData({ ...formData, startTime: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(date) => setFormData({ ...formData, endTime: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Course Color
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {COURSE_COLORS.map((color) => (
                    <Box
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: color.value,
                        cursor: 'pointer',
                        border: formData.color === color.value ? 3 : 1,
                        borderColor: formData.color === color.value ? 'primary.main' : 'grey.300',
                        boxShadow: formData.color === color.value ? 2 : 0,
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s',
                        },
                      }}
                      title={color.name}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
              {editingCourse ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CoursesView;

