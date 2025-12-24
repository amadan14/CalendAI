import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  AutoAwesome,
  Book,
  CalendarToday,
  DeleteSweep,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';
import StudyPreferences from './StudyPreferences';
import { generateIntelligentSchedule } from '../utils/studyScheduler';
import { markSessionCompleted, getAssignmentCompletionPattern } from '../utils/completionTracker';

const StudyScheduleView = ({ assignments, courses, studySessions, setStudySessions }) => {
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [preferences, setPreferences] = useLocalStorage('studyPreferences', null);

  const handleToggleSessionCompleted = (session) => {
    if (session.completed) {
      // Unmark as completed
      const { completed, completedAt, ...rest } = session;
      setStudySessions(studySessions.map(s => 
        s.id === session.id ? rest : s
      ));
    } else {
      // Mark as completed
      const updatedSession = markSessionCompleted(session);
      setStudySessions(studySessions.map(s => 
        s.id === session.id ? updatedSession : s
      ));
      
      // Check if all sessions for this assignment are complete, auto-complete assignment
      const relatedSessions = studySessions.filter(s => 
        s.assignmentTitle === session.assignmentTitle && s.course === session.course
      );
      const allCompleted = relatedSessions.every(s => 
        s.id === session.id ? true : s.completed
      );
      
      if (allCompleted && relatedSessions.length > 0) {
        // Find the assignment
        const assignment = assignments.find(a => 
          a.title === session.assignmentTitle || a.course === session.course
        );
        if (assignment && !assignment.completed) {
          // Optionally auto-complete the assignment
          // This could be a user preference
        }
      }
    }
  };

  const generateStudySchedule = () => {
    if (!preferences) {
      alert('Please configure your study preferences first!');
      return;
    }

    const upcomingAssignments = assignments
      .filter(a => {
        const dueDate = parseISO(a.dueDate);
        return dueDate >= new Date();
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (upcomingAssignments.length === 0) {
      alert('No upcoming assignments to schedule study time for.');
      return;
    }

    const newSessions = generateIntelligentSchedule(upcomingAssignments, courses, preferences);

    if (newSessions.length === 0) {
      alert('Could not generate a schedule. Please check your availability preferences.');
      return;
    }

    setStudySessions(newSessions);
    setScheduleGenerated(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#D4A5B0';
      case 'medium': return '#9A9CAB';
      case 'low': return '#828B85';
      default: return '#E3C6CD';
    }
  };

  const handleClearAll = () => {
    setOpenClearDialog(true);
  };

  const confirmClearAll = () => {
    setStudySessions([]);
    setScheduleGenerated(false);
    setOpenClearDialog(false);
  };

  const upcomingAssignments = assignments
    .filter(a => parseISO(a.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Group study sessions by date
  const sessionsByDate = {};
  studySessions.forEach(session => {
    const dateKey = format(parseISO(session.date || session.startTime), 'yyyy-MM-dd');
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });

  const sortedDates = Object.keys(sessionsByDate).sort();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
          Study Schedule
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {studySessions.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweep />}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={generateStudySchedule}
            disabled={upcomingAssignments.length === 0 || !preferences}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Generate Study Schedule
          </Button>
        </Box>
      </Box>

      {!preferences && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please configure your study preferences before generating a schedule. This helps the system schedule study time around your classes and availability.
        </Alert>
      )}

      {upcomingAssignments.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No upcoming assignments found. Add assignments to generate a study schedule.
        </Alert>
      )}

      {scheduleGenerated && studySessions.length > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Study schedule generated! You have {studySessions.length} study sessions scheduled with specific times.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StudyPreferences preferences={preferences} setPreferences={setPreferences} />
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
                <Book sx={{ verticalAlign: 'middle', mr: 1 }} />
                Upcoming Assignments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {upcomingAssignments.slice(0, 5).map((assignment) => {
                  const dueDate = parseISO(assignment.dueDate);
                  const daysUntilDue = differenceInDays(dueDate, new Date());
                  return (
                    <Paper key={assignment.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {assignment.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.course}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption">
                          Due: {format(dueDate, 'MMM d')}
                        </Typography>
                        <Chip
                          label={assignment.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(assignment.priority),
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {daysUntilDue} days remaining
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
                <CalendarToday sx={{ verticalAlign: 'middle', mr: 1 }} />
                Study Schedule
              </Typography>
              {sortedDates.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.light' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Time</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assignment</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Course</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedDates.map(dateKey => {
                        const sessions = sessionsByDate[dateKey].sort((a, b) => {
                          const timeA = a.startTime ? new Date(a.startTime) : new Date(a.date);
                          const timeB = b.startTime ? new Date(b.startTime) : new Date(b.date);
                          return timeA - timeB;
                        });
                        return sessions.map((session, index) => {
                          const startTime = session.startTime ? parseISO(session.startTime) : parseISO(session.date);
                          const endTime = session.endTime ? parseISO(session.endTime) : null;
                          const duration = session.duration 
                            ? `${(session.duration / 60).toFixed(1)} hrs`
                            : session.hours 
                            ? `${session.hours} hrs`
                            : '2 hrs';
                          
                          return (
                            <TableRow key={session.id} hover>
                              {index === 0 && (
                                <TableCell rowSpan={sessions.length} sx={{ fontWeight: 500 }}>
                                  {format(parseISO(session.date || session.startTime), 'EEEE, MMM d, yyyy')}
                                </TableCell>
                              )}
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleSessionCompleted(session)}
                                    title={session.completed ? "Mark as incomplete" : "Mark as completed"}
                                    sx={{
                                      color: session.completed ? '#828B85' : 'grey.400',
                                      '&:hover': {
                                        color: session.completed ? '#828B85' : '#828B85',
                                      },
                                    }}
                                  >
                                    {session.completed ? (
                                      <CheckCircle fontSize="small" />
                                    ) : (
                                      <RadioButtonUnchecked fontSize="small" />
                                    )}
                                  </IconButton>
                                  {endTime ? (
                                    <Typography variant="body2" fontWeight={500}>
                                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      {format(startTime, 'h:mm a')}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {session.assignmentTitle}
                                </Typography>
                              </TableCell>
                              <TableCell>{session.course}</TableCell>
                              <TableCell>{duration}</TableCell>
                              <TableCell>
                                <Chip
                                  label={session.priority}
                                  size="small"
                                  sx={{
                                    bgcolor: getPriorityColor(session.priority),
                                    color: 'white',
                                    fontWeight: 500,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No study sessions scheduled.
                  </Typography>
                  {!preferences ? (
                    <Typography variant="body2" color="text.secondary">
                      Configure your study preferences and click "Generate Study Schedule" to create one.
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Click "Generate Study Schedule" to create a personalized study plan.
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          Clear All Study Sessions?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all {studySessions.length} study session{studySessions.length !== 1 ? 's' : ''}? This action cannot be undone.
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
  );
};

export default StudyScheduleView;
