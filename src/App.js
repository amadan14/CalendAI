import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import CalendarView from './components/CalendarView';
import AssignmentsView from './components/AssignmentsView';
import CoursesView from './components/CoursesView';
import StudyScheduleView from './components/StudyScheduleView';
import AIAgentView from './components/AIAgentView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PomodoroTimer from './components/PomodoroTimer';
import { useLocalStorage } from './hooks/useLocalStorage';

function AppContent() {
  const [assignments, setAssignments] = useLocalStorage('assignments', []);
  const [courses, setCourses] = useLocalStorage('courses', []);
  const [studySessions, setStudySessions] = useLocalStorage('studySessions', []);
  const location = useLocation();
  const navigate = useNavigate();

  const getTabValue = () => {
    const path = location.pathname;
    if (path === '/calendar') return 0;
    if (path === '/assignments') return 1;
    if (path === '/courses') return 2;
    if (path === '/study-schedule') return 3;
    if (path === '/ai-assistant') return 4;
    if (path === '/analytics') return 5;
    if (path === '/pomodoro') return 6;
    return 0;
  };

  const handleTabChange = (event, newValue) => {
    const routes = ['/calendar', '/assignments', '/courses', '/study-schedule', '/ai-assistant', '/analytics', '/pomodoro'];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'white' }}>
            Anika's Personal Calendar
          </Typography>
        </Toolbar>
        <Tabs
          value={getTabValue()}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            borderBottom: 2,
            borderColor: 'primary.light',
            '& .MuiTab-root': {
              fontWeight: 500,
              '&.Mui-selected': {
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab label="Calendar" />
          <Tab label="Assignments" />
          <Tab label="Courses" />
          <Tab label="Study Schedule" />
          <Tab label="AI Assistant" />
          <Tab label="Analytics" />
          <Tab label="Pomodoro" />
        </Tabs>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/calendar" replace />}
          />
            <Route
              path="/calendar"
              element={
                <CalendarView
                  assignments={assignments}
                  courses={courses}
                  studySessions={studySessions}
                  setAssignments={setAssignments}
                  setStudySessions={setStudySessions}
                />
              }
            />
            <Route
              path="/assignments"
              element={
                <AssignmentsView
                  assignments={assignments}
                  setAssignments={setAssignments}
                  courses={courses}
                  setCourses={setCourses}
                  studySessions={studySessions}
                />
              }
            />
          <Route
            path="/courses"
            element={
              <CoursesView
                courses={courses}
                setCourses={setCourses}
              />
            }
          />
          <Route
            path="/study-schedule"
            element={
              <StudyScheduleView
                assignments={assignments}
                courses={courses}
                studySessions={studySessions}
                setStudySessions={setStudySessions}
              />
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <AIAgentView
                assignments={assignments}
                setAssignments={setAssignments}
                courses={courses}
                setCourses={setCourses}
                studySessions={studySessions}
                setStudySessions={setStudySessions}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsDashboard
                assignments={assignments}
                courses={courses}
                studySessions={studySessions}
              />
            }
          />
          <Route
            path="/pomodoro"
            element={<PomodoroTimer />}
          />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

