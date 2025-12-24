import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Event,
  Book,
  CalendarMonth,
  ViewWeek,
  Today,
  Edit,
  Download,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  parseISO,
} from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { generateICS, downloadICS } from '../utils/icsExport';
import { getCourseColor } from '../utils/colorPalette';
import { markAssignmentCompleted } from '../utils/completionTracker';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

const CalendarView = ({ assignments, courses = [], studySessions, setAssignments, setStudySessions }) => {
  const handleExportCalendar = () => {
    const icsContent = generateICS({
      assignments,
      courses,
      studySessions,
      calendarName: 'Personal Calendar',
    });
    const filename = `calendar-export-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    downloadICS(icsContent, filename);
  };
  const [draggedSession, setDraggedSession] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false); // Track if mouse actually moved
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizingSession, setResizingSession] = useState(null);
  const [resizeType, setResizeType] = useState(null); // 'top' or 'bottom'
  const [editingSession, setEditingSession] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editSessionData, setEditSessionData] = useState({
    startTime: new Date(),
    endTime: new Date(),
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDayDetail, setOpenDayDetail] = useState(false);
  const [dayDetailDate, setDayDetailDate] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course: '',
    dueDate: new Date(),
    priority: 'medium',
    description: '',
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForDate = (date) => {
    const dayAssignments = assignments.filter(a =>
      isSameDay(new Date(a.dueDate), date)
    );
    const dayStudySessions = studySessions.filter(s => {
      const sessionDate = s.startTime ? new Date(s.startTime) : new Date(s.date);
      return isSameDay(sessionDate, date);
    });
    return { assignments: dayAssignments, studySessions: dayStudySessions };
  };

  const handleDateClick = (date, showDetail = false) => {
    if (showDetail) {
      setDayDetailDate(date);
      setOpenDayDetail(true);
    } else {
      setSelectedDate(date);
      setNewAssignment({
        ...newAssignment,
        dueDate: date,
      });
      setOpenDialog(true);
    }
  };

  const handleAddAssignment = () => {
    if (newAssignment.title && newAssignment.course) {
      const assignment = {
        id: Date.now().toString(),
        ...newAssignment,
        dueDate: newAssignment.dueDate.toISOString(),
        createdAt: new Date().toISOString(),
      };
      setAssignments([...assignments, assignment]);
      setNewAssignment({
        title: '',
        course: '',
        dueDate: new Date(),
        priority: 'medium',
        description: '',
      });
      setOpenDialog(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#D4A5B0';
      case 'medium': return '#9A9CAB';
      case 'low': return '#828B85';
      default: return '#E3C6CD';
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const navigateDate = (direction) => {
    if (view === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : addDays(currentDate, -1));
    }
  };

  const renderMonthView = () => {
    const startDayOfWeek = monthStart.getDay();
    const emptyDays = Array(startDayOfWeek).fill(null);

    return (
      <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
        <Grid container spacing={0} sx={{ borderBottom: 2, borderColor: 'primary.light' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid item xs key={day} sx={{ p: 2, textAlign: 'center', fontWeight: 600, bgcolor: 'primary.light', color: 'white' }}>
              {day}
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={0}>
          {emptyDays.map((_, index) => (
            <Grid item xs key={`empty-${index}`} sx={{ minHeight: 140, border: 1, borderColor: 'grey.200', bgcolor: 'grey.50' }} />
          ))}
          {daysInMonth.map((day) => {
            const events = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            return (
              <Grid
                item
                xs
                key={day.toISOString()}
                sx={{
                  minHeight: 140,
                  border: 1,
                  borderColor: 'grey.200',
                  p: 1.5,
                  cursor: 'pointer',
                  bgcolor: isToday ? 'secondary.light' : 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isToday ? 'secondary.main' : 'grey.50',
                    transform: 'scale(1.02)',
                  },
                }}
                onClick={(e) => {
                  if (e.detail === 2) {
                    handleDateClick(day, true);
                  } else {
                    handleDateClick(day, false);
                  }
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday ? 700 : 500,
                    mb: 0.5,
                    color: isToday ? 'primary.dark' : 'text.primary',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {events.assignments.slice(0, 3).map((assignment) => (
                    <Chip
                      key={assignment.id}
                      label={assignment.title}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 22,
                        bgcolor: getPriorityColor(assignment.priority),
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                      icon={<Event sx={{ fontSize: '0.9rem !important', color: 'white' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(day, true);
                      }}
                    />
                  ))}
                    {events.studySessions.slice(0, 2).map((session) => {
                      const startTime = session.startTime ? parseISO(session.startTime) : null;
                      const timeLabel = startTime ? format(startTime, 'h:mm a') : '';
                      const sessionColor = getCourseColor(session.course, courses);
                      return (
                        <Chip
                          key={session.id}
                          label={`Study${timeLabel ? ` ${timeLabel}` : ''}: ${session.assignmentTitle?.substring(0, 12)}...`}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: sessionColor,
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': {
                              opacity: 0.9,
                            },
                          }}
                          icon={<Book sx={{ fontSize: '0.9rem !important', color: 'white' }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDateClick(day, true);
                          }}
                        />
                      );
                    })}
                  {(events.assignments.length > 3 || events.studySessions.length > 2) && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      +{events.assignments.length - 3 + events.studySessions.length - 2} more
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  const currentDragTarget = useRef(null);
  const currentDragDate = useRef(null);

  const snapTo15Minutes = (minutes) => {
    return Math.round(minutes / 15) * 15;
  };

  const getTimeFromPosition = useCallback((clientY, containerRect) => {
    // Calculate time based on mouse position
    // Each hour is 60px, so 1px = 1 minute
    const relativeY = clientY - containerRect.top;
    const totalMinutes = Math.max(0, Math.min(1440, relativeY)); // Clamp to 0-1440 minutes (24 hours)
    const hour = Math.floor(totalMinutes / 60);
    const minutes = snapTo15Minutes(totalMinutes % 60);
    return { hour, minutes, totalMinutes };
  }, []);

  const handleMouseDown = (e, session, type = 'drag', targetDate) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store initial mouse position to detect actual movement
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    
    // Prevent any click events from firing on parent elements
    if (type === 'resize-top' || type === 'resize-bottom') {
      setResizingSession(session);
      setResizeType(type === 'resize-top' ? 'top' : 'bottom');
      setIsDragging(true);
      currentDragTarget.current = e.currentTarget.closest('[data-time-container]');
      currentDragDate.current = targetDate;
    } else {
      setDraggedSession(session);
      setIsDragging(true);
      currentDragTarget.current = e.currentTarget.closest('[data-time-container]');
      currentDragDate.current = targetDate;
    }
    
    // Mark that we're starting a drag to prevent click handlers
    e.currentTarget.setAttribute('data-dragging', 'true');
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || (!draggedSession && !resizingSession)) return;
    if (!currentDragTarget.current || !currentDragDate.current) return;
    
    // Check if mouse has moved significantly (more than 5px) to consider it a drag
    const deltaX = Math.abs(e.clientX - dragStartPos.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.y);
    if (deltaX > 5 || deltaY > 5) {
      setHasDragged(true);
    }
    
    const containerRect = currentDragTarget.current.getBoundingClientRect();
    const { hour, minutes, totalMinutes } = getTimeFromPosition(e.clientY, containerRect);
    const targetDate = currentDragDate.current;
    
    if (resizingSession && resizeType) {
      // Resizing - adjust start or end time
      const session = resizingSession;
      const startTime = parseISO(session.startTime);
      const currentDuration = session.duration || 120;
      
      let newStartTime, newEndTime, newDuration;
      
      if (resizeType === 'bottom') {
        // Resizing bottom - change end time
        newStartTime = new Date(startTime);
        const newEndMinutes = totalMinutes;
        newEndTime = new Date(targetDate);
        newEndTime.setHours(Math.floor(newEndMinutes / 60), newEndMinutes % 60, 0, 0);
        
        if (newEndTime <= newStartTime) {
          newEndTime = new Date(newStartTime.getTime() + 15 * 60000); // Minimum 15 minutes
        }
        newDuration = Math.round((newEndTime - newStartTime) / 60000);
      } else {
        // Resizing top - change start time
        const newStartMinutes = totalMinutes;
        newStartTime = new Date(targetDate);
        newStartTime.setHours(Math.floor(newStartMinutes / 60), newStartMinutes % 60, 0, 0);
        
        const oldEndTime = new Date(startTime.getTime() + currentDuration * 60000);
        if (newStartTime >= oldEndTime) {
          newStartTime = new Date(oldEndTime.getTime() - 15 * 60000); // Minimum 15 minutes
        }
        newEndTime = oldEndTime;
        newDuration = Math.round((newEndTime - newStartTime) / 60000);
      }
      
      setStudySessions(prev => prev.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            date: newStartTime.toISOString().split('T')[0],
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
            duration: newDuration,
          };
        }
        return s;
      }));
    } else if (draggedSession) {
      // Dragging - move entire session
      const newStartTime = new Date(targetDate);
      newStartTime.setHours(hour, minutes, 0, 0);
      
      const duration = draggedSession.duration || 120;
      const newEndTime = new Date(newStartTime.getTime() + duration * 60000);
      
      setStudySessions(prev => prev.map(session => {
        if (session.id === draggedSession.id) {
          return {
            ...session,
            date: newStartTime.toISOString().split('T')[0],
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
          };
        }
        return session;
      }));
    }
  }, [isDragging, draggedSession, resizingSession, resizeType, setStudySessions, getTimeFromPosition, dragStartPos]);

  const handleMouseUp = useCallback((e) => {
    // Remove dragging attribute from all elements
    document.querySelectorAll('[data-dragging]').forEach(el => {
      el.removeAttribute('data-dragging');
    });
    
    // If we actually dragged, prevent click events for a short time
    if (hasDragged) {
      // Set a flag to prevent click events temporarily
      document.body.setAttribute('data-just-dragged', 'true');
      setTimeout(() => {
        document.body.removeAttribute('data-just-dragged');
      }, 100);
    }
    
    setIsDragging(false);
    setDraggedSession(null);
    setResizingSession(null);
    setResizeType(null);
    setHasDragged(false);
    currentDragTarget.current = null;
    currentDragDate.current = null;
  }, [hasDragged]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = resizingSession ? 'ns-resize' : 'move';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, resizingSession, handleMouseMove, handleMouseUp]);

  const handleEditSession = (session) => {
    setEditingSession(session);
    const startTime = session.startTime ? parseISO(session.startTime) : new Date(session.date);
    const endTime = session.endTime ? parseISO(session.endTime) : new Date(startTime.getTime() + (session.duration || 120) * 60000);
    setEditSessionData({
      startTime,
      endTime,
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingSession || !setStudySessions) return;

    const updatedSessions = studySessions.map(session => {
      if (session.id === editingSession.id) {
        return {
          ...session,
          date: editSessionData.startTime.toISOString().split('T')[0],
          startTime: editSessionData.startTime.toISOString(),
          endTime: editSessionData.endTime.toISOString(),
          duration: (editSessionData.endTime - editSessionData.startTime) / 60000, // in minutes
        };
      }
      return session;
    });

    setStudySessions(updatedSessions);
    setOpenEditDialog(false);
    setEditingSession(null);
  };

  const handleToggleAssignmentCompleted = (assignment) => {
    if (assignment.completed) {
      // Unmark as completed
      const { completed, completedAt, actualTimeSpent, ...rest } = assignment;
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? rest : a
      ));
    } else {
      // Mark as completed
      const updatedAssignment = markAssignmentCompleted(assignment, studySessions || []);
      
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? updatedAssignment : a
      ));
    }
  };

  const getSessionPosition = (session) => {
    if (!session.startTime) return null;
    const startTime = parseISO(session.startTime);
    const hour = startTime.getHours();
    const minutes = startTime.getMinutes();
    const top = (hour * 60 + minutes) * (60 / 60); // 60px per hour
    const duration = session.duration || (session.hours ? session.hours * 60 : 120);
    const height = (duration / 60) * 60; // 60px per hour
    return { top, height, hour, minutes };
  };

  const renderWeekView = () => {
    return (
      <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
        <Grid container spacing={0} sx={{ borderBottom: 2, borderColor: 'primary.light' }}>
          <Grid item xs={2} sx={{ p: 2, textAlign: 'center', fontWeight: 600, bgcolor: 'primary.light', color: 'white' }}>
            Time
          </Grid>
          {daysInWeek.map((day) => (
            <Grid item xs key={day.toISOString()} sx={{ p: 2, textAlign: 'center', fontWeight: 600, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="body2">{format(day, 'EEE')}</Typography>
              <Typography variant="h6">{format(day, 'd')}</Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={0}>
          <Grid item xs={2} sx={{ borderRight: 1, borderColor: 'grey.200' }}>
            {Array.from({ length: 24 }, (_, i) => (
              <Box key={i} sx={{ height: 60, borderBottom: 1, borderColor: 'grey.200', p: 1, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </Typography>
              </Box>
            ))}
          </Grid>
          {daysInWeek.map((day) => {
            const events = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const daySessions = events.studySessions.filter(s => {
              if (!s.startTime) return false;
              const sessionDate = parseISO(s.startTime);
              return isSameDay(sessionDate, day);
            });
            
            return (
              <Grid
                item
                xs
                key={day.toISOString()}
                data-time-container
                sx={{
                  borderRight: 1,
                  borderColor: 'grey.200',
                  bgcolor: isToday ? 'secondary.light' : 'background.paper',
                  position: 'relative',
                }}
                onMouseMove={(e) => {
                  if (isDragging) {
                    handleMouseMove(e);
                  }
                }}
                onClick={(e) => {
                  // Don't trigger if clicking on a session or resize handle
                  if (e.target.closest('[data-session-box]') || e.target.closest('[data-resize-handle]')) {
                    return;
                  }
                  // Don't trigger if we just finished dragging
                  if (document.body.hasAttribute('data-just-dragged') || isDragging) {
                    return;
                  }
                  handleDateClick(day, true);
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                    <Box 
                    key={i} 
                    sx={{ 
                      height: 60, 
                      borderBottom: 1, 
                      borderColor: 'grey.200', 
                      position: 'relative',
                    }}
                  >
                    {events.assignments
                      .filter(a => {
                        const date = parseISO(a.dueDate);
                        return date.getHours() === i;
                      })
                      .map((assignment) => (
                        <Chip
                          key={assignment.id}
                          label={assignment.title}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            right: 4,
                            fontSize: '0.65rem',
                            height: 20,
                            bgcolor: getPriorityColor(assignment.priority),
                            color: 'white',
                            zIndex: 1,
                          }}
                        />
                      ))}
                  </Box>
                ))}
                {/* Study Sessions positioned by time */}
                {daySessions.map((session) => {
                  const pos = getSessionPosition(session);
                  if (!pos) return null;
                  const isDragged = draggedSession?.id === session.id;
                  const isResized = resizingSession?.id === session.id;
                  return (
                    <Box
                      key={session.id}
                      data-session-box
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, session, 'drag', day);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        position: 'absolute',
                        top: `${pos.top}px`,
                        left: 4,
                        right: 4,
                        height: `${pos.height}px`,
                        bgcolor: getCourseColor(session.course, courses),
                        opacity: isDragged || isResized ? 0.85 : 1,
                        color: 'white',
                        borderRadius: 1,
                        p: 0.5,
                        cursor: 'move',
                        zIndex: isDragged || isResized ? 10 : 2,
                        boxShadow: isDragged || isResized ? 6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: isDragging ? 'none' : 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                          opacity: 0.9,
                        },
                      }}
                    >
                      {/* Resize handle at top */}
                      <Box
                        data-resize-handle
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, session, 'resize-top', day);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '8px',
                          cursor: 'ns-resize',
                          zIndex: 1,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mt: 0.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            {session.assignmentTitle?.substring(0, 20)}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.9 }}>
                            {format(parseISO(session.startTime), 'h:mm')} - {session.endTime && format(parseISO(session.endTime), 'h:mm a')}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSession(session);
                          }}
                          sx={{
                            color: 'white',
                            p: 0.25,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.2)',
                            },
                          }}
                        >
                          <Edit sx={{ fontSize: '0.75rem' }} />
                        </IconButton>
                      </Box>
                      {/* Resize handle at bottom */}
                      <Box
                        data-resize-handle
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, session, 'resize-bottom', day);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '8px',
                          cursor: 'ns-resize',
                          zIndex: 1,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    const isToday = isSameDay(currentDate, new Date());
    const daySessions = events.studySessions.filter(s => {
      if (!s.startTime) return false;
      const sessionDate = parseISO(s.startTime);
      return isSameDay(sessionDate, currentDate);
    });

    return (
      <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 2, borderColor: 'primary.light', bgcolor: isToday ? 'secondary.light' : 'background.paper' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          {isToday && (
            <Chip label="Today" size="small" sx={{ bgcolor: 'primary.main', color: 'white' }} />
          )}
        </Box>

        <Grid container spacing={0}>
          <Grid item xs={2} sx={{ borderRight: 1, borderColor: 'grey.200' }}>
            {Array.from({ length: 24 }, (_, i) => (
              <Box key={i} sx={{ height: 60, borderBottom: 1, borderColor: 'grey.200', p: 1, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </Typography>
              </Box>
            ))}
          </Grid>
          <Grid
            item
            xs={10}
            data-time-container
            sx={{
              position: 'relative',
              minHeight: 1440, // 24 hours * 60px
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                handleMouseMove(e);
              }
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  height: 60,
                  borderBottom: 1,
                  borderColor: 'grey.200',
                  position: 'relative',
                }}
              >
                {/* Assignments */}
                {events.assignments
                  .filter(a => {
                    const date = parseISO(a.dueDate);
                    return date.getHours() === i;
                  })
                  .map((assignment) => (
                    <Chip
                      key={assignment.id}
                      label={assignment.title}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        right: 4,
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: getPriorityColor(assignment.priority),
                        color: 'white',
                        zIndex: 1,
                      }}
                    />
                  ))}
              </Box>
            ))}
            
            {/* Study Sessions positioned by time */}
            {daySessions.map((session) => {
              const pos = getSessionPosition(session);
              if (!pos) return null;
              const isDragged = draggedSession?.id === session.id;
              const isResized = resizingSession?.id === session.id;
              return (
                <Box
                  key={session.id}
                  data-session-box
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, session, 'drag', currentDate);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{
                    position: 'absolute',
                    top: `${pos.top}px`,
                    left: 8,
                    right: 8,
                    height: `${pos.height}px`,
                    bgcolor: getCourseColor(session.course, courses),
                    opacity: isDragged || isResized ? 0.85 : 1,
                    color: 'white',
                    borderRadius: 1,
                    p: 1,
                    cursor: 'move',
                    zIndex: isDragged || isResized ? 10 : 2,
                    boxShadow: isDragged || isResized ? 6 : 2,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: isDragging ? 'none' : 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      opacity: 0.9,
                    },
                  }}
                >
                  {/* Resize handle at top */}
                  <Box
                    data-resize-handle
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, session, 'resize-top', currentDate);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '8px',
                      cursor: 'ns-resize',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {session.assignmentTitle}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSession(session);
                      }}
                      sx={{
                        color: 'white',
                        p: 0.25,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                    >
                      <Edit sx={{ fontSize: '0.875rem' }} />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                    {format(parseISO(session.startTime), 'h:mm a')} - {session.endTime && format(parseISO(session.endTime), 'h:mm a')}
                  </Typography>
                  {session.course && (
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', mt: 0.5 }}>
                      {session.course}
                    </Typography>
                  )}
                  {/* Resize handle at bottom */}
                  <Box
                    data-resize-handle
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, session, 'resize-bottom', currentDate);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '8px',
                      cursor: 'ns-resize',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderDayDetailDialog = () => {
    if (!dayDetailDate) return null;
    const events = getEventsForDate(dayDetailDate);

    return (
      <Dialog
        open={openDayDetail}
        onClose={() => setOpenDayDetail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {format(dayDetailDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {events.assignments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark', fontWeight: 600 }}>
                Assignments ({events.assignments.length})
              </Typography>
              <List>
                {events.assignments.map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem
                      sx={{
                        bgcolor: getPriorityColor(assignment.priority),
                        color: 'white',
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAssignmentCompleted(assignment);
                          }}
                          sx={{
                            color: assignment.completed ? '#828B85' : 'rgba(255,255,255,0.7)',
                            '&:hover': {
                              color: 'white',
                            },
                          }}
                        >
                          {assignment.completed ? (
                            <CheckCircle />
                          ) : (
                            <RadioButtonUnchecked />
                          )}
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText
                        primary={assignment.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                              {assignment.course}
                            </Typography>
                            {assignment.description && (
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                {assignment.description}
                              </Typography>
                            )}
                            <Chip
                              label={assignment.priority}
                              size="small"
                              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < events.assignments.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {events.studySessions.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark', fontWeight: 600 }}>
                Study Sessions ({events.studySessions.length})
              </Typography>
              <List>
                {events.studySessions.map((session, index) => (
                  <React.Fragment key={session.id}>
                    <ListItem
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Book sx={{ color: 'white' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={session.assignmentTitle}
                        secondary={
                          <Box>
                            {session.startTime && session.endTime ? (
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                {format(parseISO(session.startTime), 'h:mm a')} - {format(parseISO(session.endTime), 'h:mm a')}
                              </Typography>
                            ) : (
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                {session.hours ? `${session.hours} hours` : '2 hours'}
                              </Typography>
                            )}
                            {session.duration && (
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Duration: {(session.duration / 60).toFixed(1)} hours
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < events.studySessions.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {events.assignments.length === 0 && events.studySessions.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No events scheduled for this day
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDayDetail(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setOpenDayDetail(false);
              setSelectedDate(dayDetailDate);
              setNewAssignment({
                ...newAssignment,
                dueDate: dayDetailDate,
              });
              setOpenDialog(true);
            }}
          >
            Add Assignment
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigateDate('prev')} sx={{ color: 'primary.main' }}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.dark', minWidth: 200, textAlign: 'center' }}>
              {view === 'month' && format(currentDate, 'MMMM yyyy')}
              {view === 'week' && `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
              {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
            </Typography>
            <IconButton onClick={() => navigateDate('next')} sx={{ color: 'primary.main' }}>
              <ChevronRight />
            </IconButton>
            <Button
              variant="outlined"
              onClick={() => setCurrentDate(new Date())}
              sx={{ ml: 1, borderColor: 'primary.main', color: 'primary.main' }}
            >
              Today
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportCalendar}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.light',
                  color: 'white',
                },
              }}
            >
              Export to ICS
            </Button>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              aria-label="view selection"
              sx={{
                '& .MuiToggleButton-root': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="month" aria-label="month view">
                <CalendarMonth sx={{ mr: 1 }} />
                Month
              </ToggleButton>
              <ToggleButton value="week" aria-label="week view">
                <ViewWeek sx={{ mr: 1 }} />
                Week
              </ToggleButton>
              <ToggleButton value="day" aria-label="day view">
                <Today sx={{ mr: 1 }} />
                Day
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedDate(new Date());
                setOpenDialog(true);
              }}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Add Assignment
            </Button>
          </Box>
        </Box>

        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}

        {renderDayDetailDialog()}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>
            Add New Assignment
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Assignment Title"
                fullWidth
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={newAssignment.course}
                  label="Course"
                  onChange={(e) => setNewAssignment({ ...newAssignment, course: e.target.value })}
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
                value={newAssignment.dueDate}
                onChange={(date) => setNewAssignment({ ...newAssignment, dueDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newAssignment.priority}
                  label="Priority"
                  onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value })}
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
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddAssignment}
              variant="contained"
              disabled={!newAssignment.title || !newAssignment.course}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Study Session Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>
            Edit Study Session
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {editingSession && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Assignment: <strong>{editingSession.assignmentTitle}</strong>
                </Typography>
                {editingSession.course && (
                  <Typography variant="body2" color="text.secondary">
                    Course: <strong>{editingSession.course}</strong>
                  </Typography>
                )}
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Date"
                value={editSessionData.startTime}
                onChange={(date) => {
                  if (date) {
                    const duration = editSessionData.endTime.getTime() - editSessionData.startTime.getTime();
                    setEditSessionData({
                      startTime: date,
                      endTime: new Date(date.getTime() + duration),
                    });
                  }
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="Start Time"
                value={editSessionData.startTime}
                onChange={(date) => {
                  if (date) {
                    // Snap to 15-minute intervals
                    const minutes = date.getMinutes();
                    const snappedMinutes = snapTo15Minutes(minutes);
                    date.setMinutes(snappedMinutes, 0, 0);
                    
                    const duration = editSessionData.endTime.getTime() - editSessionData.startTime.getTime();
                    setEditSessionData({
                      startTime: date,
                      endTime: new Date(date.getTime() + duration),
                    });
                  }
                }}
                slotProps={{ 
                  textField: { fullWidth: true },
                  minutesStep: 15,
                }}
              />
              <TimePicker
                label="End Time"
                value={editSessionData.endTime}
                onChange={(date) => {
                  if (date) {
                    // Snap to 15-minute intervals
                    const minutes = date.getMinutes();
                    const snappedMinutes = snapTo15Minutes(minutes);
                    date.setMinutes(snappedMinutes, 0, 0);
                    
                    // Ensure end time is after start time
                    if (date > editSessionData.startTime) {
                      setEditSessionData({
                        ...editSessionData,
                        endTime: date,
                      });
                    }
                  }
                }}
                slotProps={{ 
                  textField: { fullWidth: true },
                  minutesStep: 15,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarView;
