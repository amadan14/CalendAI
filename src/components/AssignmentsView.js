import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Upload,
  DeleteSweep,
  Download,
} from '@mui/icons-material';
import { format, parseISO, isPast, isToday, isFuture } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { importCanvasCalendar } from '../utils/canvasImport';
import { downloadTrainingData } from '../utils/dataExport';
import { markAssignmentCompleted, calculateActualTimeSpent } from '../utils/completionTracker';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

const AssignmentsView = ({ assignments, setAssignments, courses, setCourses, studySessions }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    dueDate: new Date(),
    priority: 'medium',
    description: '',
  });

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        course: assignment.course,
        dueDate: parseISO(assignment.dueDate),
        priority: assignment.priority,
        description: assignment.description || '',
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        course: '',
        dueDate: new Date(),
        priority: 'medium',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (formData.title && formData.course) {
      const assignment = {
        id: editingAssignment?.id || Date.now().toString(),
        ...formData,
        dueDate: formData.dueDate.toISOString(),
        createdAt: editingAssignment?.createdAt || new Date().toISOString(),
      };

      if (editingAssignment) {
        setAssignments(assignments.map(a => a.id === assignment.id ? assignment : a));
      } else {
        setAssignments([...assignments, assignment]);
      }
      setOpenDialog(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  const handleMarkCompleted = (assignment) => {
    const actualTimeSpent = calculateActualTimeSpent(assignment, studySessions || []);
    const updatedAssignment = markAssignmentCompleted(assignment, studySessions || []);
    
    // Show confirmation with time spent
    const hours = Math.floor(actualTimeSpent / 60);
    const minutes = actualTimeSpent % 60;
    const timeString = hours > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`
      : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    if (window.confirm(
      `Mark "${assignment.title}" as completed?\n\n` +
      `Time spent: ${timeString}\n` +
      `This data will be used to improve future predictions.`
    )) {
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? updatedAssignment : a
      ));
    }
  };

  const handleToggleCompleted = (assignment) => {
    if (assignment.completed) {
      // Unmark as completed
      const { completed, completedAt, actualTimeSpent, ...rest } = assignment;
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? rest : a
      ));
    } else {
      handleMarkCompleted(assignment);
    }
  };

  const handleClearAll = () => {
    setOpenClearDialog(true);
  };

  const confirmClearAll = () => {
    setAssignments([]);
    setOpenClearDialog(false);
  };

  const handleCanvasImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const { assignments: importedAssignments, courses: importedCourses } = await importCanvasCalendar(file);
          const assignmentsWithIds = importedAssignments.map((assignment, index) => ({
            ...assignment,
            id: `imported-${Date.now()}-${index}`,
            createdAt: new Date().toISOString(),
          }));
          
          // Add new courses that don't already exist
          const existingCourseNames = new Set(courses.map(c => c.name));
          const newCourses = importedCourses.filter(c => !existingCourseNames.has(c.name));
          
          if (newCourses.length > 0) {
            setCourses([...courses, ...newCourses]);
          }
          
          setAssignments([...assignments, ...assignmentsWithIds]);
          alert(`Successfully imported ${importedAssignments.length} assignments and ${newCourses.length} new courses from ${file.name}`);
        } catch (error) {
          alert(`Error importing file: ${error.message}`);
        }
      }
    };
    input.click();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#D4A5B0';
      case 'medium': return '#9A9CAB';
      case 'low': return '#828B85';
      default: return '#E3C6CD';
    }
  };

  const getDateStatus = (dueDate) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return { text: 'Overdue', color: 'error' };
    if (isToday(date)) return { text: 'Due Today', color: 'warning' };
    if (isFuture(date)) return { text: 'Upcoming', color: 'success' };
    return { text: 'Due Today', color: 'warning' };
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const upcomingAssignments = sortedAssignments.filter(a => isFuture(parseISO(a.dueDate)) || isToday(parseISO(a.dueDate)));
  const pastAssignments = sortedAssignments.filter(a => isPast(parseISO(a.dueDate)) && !isToday(parseISO(a.dueDate)));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Assignments
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Assignment
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={handleCanvasImport}
            >
              Import from Canvas
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => downloadTrainingData({ assignments, courses, studySessions: studySessions || [] })}
            >
              Export for ML
            </Button>
            {assignments.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweep />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Assignments ({upcomingAssignments.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingAssignments.map((assignment) => {
                        const status = getDateStatus(assignment.dueDate);
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>{assignment.course}</TableCell>
                            <TableCell>
                              <Box>
                                {format(parseISO(assignment.dueDate), 'MMM d, yyyy')}
                                <Chip
                                  label={status.text}
                                  size="small"
                                  color={status.color}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={assignment.priority}
                                size="small"
                                sx={{
                                  bgcolor: getPriorityColor(assignment.priority),
                                  color: 'white',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleCompleted(assignment)}
                                title={assignment.completed ? "Mark as incomplete" : "Mark as completed"}
                                sx={{
                                  color: assignment.completed ? '#828B85' : 'grey.400',
                                  '&:hover': {
                                    color: assignment.completed ? '#828B85' : '#828B85',
                                  },
                                }}
                              >
                                {assignment.completed ? (
                                  <CheckCircle fontSize="small" />
                                ) : (
                                  <RadioButtonUnchecked fontSize="small" />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(assignment)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(assignment.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Past Assignments ({pastAssignments.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell>{assignment.course}</TableCell>
                          <TableCell>
                            {format(parseISO(assignment.dueDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={assignment.priority}
                              size="small"
                              sx={{
                                bgcolor: getPriorityColor(assignment.priority),
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleCompleted(assignment)}
                              title={assignment.completed ? "Mark as incomplete" : "Mark as completed"}
                              sx={{
                                color: assignment.completed ? '#828B85' : 'grey.400',
                                '&:hover': {
                                  color: assignment.completed ? '#828B85' : '#828B85',
                                },
                              }}
                            >
                              {assignment.completed ? (
                                <CheckCircle fontSize="small" />
                              ) : (
                                <RadioButtonUnchecked fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(assignment)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(assignment.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Assignment Title"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.course}
                  label="Course"
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  required
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.name}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) => setFormData({ ...formData, dueDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={!formData.title || !formData.course}>
              {editingAssignment ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear All Confirmation Dialog */}
        <Dialog
          open={openClearDialog}
          onClose={() => setOpenClearDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
            Clear All Assignments?
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete all {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenClearDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmClearAll}
              variant="contained"
              color="error"
              startIcon={<DeleteSweep />}
            >
              Clear All
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AssignmentsView;

