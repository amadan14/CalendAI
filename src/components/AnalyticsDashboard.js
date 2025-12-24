import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  AccessTime,
  Book,
  CalendarToday,
} from '@mui/icons-material';
import { format, parseISO, differenceInHours, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { getCourseColor } from '../utils/colorPalette';

const AnalyticsDashboard = ({ assignments, courses, studySessions }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    
    // Study time analytics
    const totalStudyHours = studySessions.reduce((sum, session) => {
      const duration = session.duration || 120; // minutes
      return sum + (duration / 60);
    }, 0);
    
    const thisWeekSessions = studySessions.filter(session => {
      if (!session.startTime) return false;
      const sessionDate = parseISO(session.startTime);
      return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    });
    
    const thisWeekHours = thisWeekSessions.reduce((sum, session) => {
      const duration = session.duration || 120;
      return sum + (duration / 60);
    }, 0);
    
    // Assignment analytics
    const upcomingAssignments = assignments.filter(a => {
      const dueDate = parseISO(a.dueDate);
      return dueDate >= now;
    });
    
    const overdueAssignments = assignments.filter(a => {
      const dueDate = parseISO(a.dueDate);
      return dueDate < now;
    });
    
    const completedAssignments = assignments.length - upcomingAssignments.length - overdueAssignments.length;
    const completionRate = assignments.length > 0 
      ? (completedAssignments / assignments.length) * 100 
      : 0;
    
    // Course workload
    const courseWorkload = courses.map(course => {
      const courseAssignments = assignments.filter(a => 
        a.course === course.name || a.course === course.code
      );
      const courseSessions = studySessions.filter(s => 
        s.course === course.name || s.course === course.code
      );
      const courseHours = courseSessions.reduce((sum, session) => {
        const duration = session.duration || 120;
        return sum + (duration / 60);
      }, 0);
      
      return {
        course: course.name,
        code: course.code,
        assignments: courseAssignments.length,
        studyHours: courseHours,
        color: course.color || getCourseColor(course.name, courses),
      };
    }).sort((a, b) => b.studyHours - a.studyHours);
    
    // Priority distribution
    const priorityCounts = {
      high: assignments.filter(a => a.priority === 'high').length,
      medium: assignments.filter(a => a.priority === 'medium').length,
      low: assignments.filter(a => a.priority === 'low').length,
    };
    
    // Average study session duration
    const avgSessionDuration = studySessions.length > 0
      ? studySessions.reduce((sum, s) => sum + (s.duration || 120), 0) / studySessions.length
      : 0;
    
    return {
      totalStudyHours,
      thisWeekHours,
      upcomingAssignments: upcomingAssignments.length,
      overdueAssignments: overdueAssignments.length,
      completedAssignments,
      completionRate,
      courseWorkload,
      priorityCounts,
      avgSessionDuration: avgSessionDuration / 60, // Convert to hours
      totalAssignments: assignments.length,
    };
  }, [assignments, courses, studySessions]);

  const StatCard = ({ icon, title, value, subtitle, color = '#7E698B' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTime />}
            title="Total Study Hours"
            value={analytics.totalStudyHours.toFixed(1)}
            subtitle={`${analytics.thisWeekHours.toFixed(1)} hours this week`}
            color="#7E698B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Book />}
            title="Upcoming Assignments"
            value={analytics.upcomingAssignments}
            subtitle={`${analytics.overdueAssignments} overdue`}
            color={analytics.overdueAssignments > 0 ? '#D4A5B0' : '#828B85'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Completion Rate"
            value={`${analytics.completionRate.toFixed(0)}%`}
            subtitle={`${analytics.completedAssignments} of ${analytics.totalAssignments} completed`}
            color="#9A9CAB"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarToday />}
            title="Avg Session"
            value={`${analytics.avgSessionDuration.toFixed(1)}h`}
            subtitle={`${studySessions.length} total sessions`}
            color="#E3C6CD"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Course Workload
              </Typography>
              {analytics.courseWorkload.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {analytics.courseWorkload.map((course) => (
                    <Box key={course.course}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: course.color,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {course.course}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {course.studyHours.toFixed(1)}h
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(course.studyHours / Math.max(...analytics.courseWorkload.map(c => c.studyHours), 1)) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: `${course.color}20`,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: course.color,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {course.assignments} assignments
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No course data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Priority Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      High Priority
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.priorityCounts.high}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(analytics.priorityCounts.high / Math.max(analytics.totalAssignments, 1)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: '#D4A5B020',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#D4A5B0',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Medium Priority
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.priorityCounts.medium}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(analytics.priorityCounts.medium / Math.max(analytics.totalAssignments, 1)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: '#9A9CAB20',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#9A9CAB',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Low Priority
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.priorityCounts.low}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(analytics.priorityCounts.low / Math.max(analytics.totalAssignments, 1)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: '#828B8520',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#828B85',
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;

