/**
 * Completion Tracking Utility
 * Tracks assignment completion and actual time spent for adaptive learning
 */

/**
 * Calculate actual time spent on an assignment
 * @param {Object} assignment - Assignment object
 * @param {Array} studySessions - All study sessions
 * @returns {Number} Total time in minutes
 */
export const calculateActualTimeSpent = (assignment, studySessions) => {
  // Find all study sessions related to this assignment
  const relatedSessions = studySessions.filter(session => 
    session.assignmentTitle === assignment.title || 
    (session.course === assignment.course && 
     new Date(session.startTime) >= new Date(assignment.createdAt) &&
     new Date(session.startTime) <= new Date(assignment.dueDate))
  );
  
  // Sum up the duration of all related sessions
  const totalMinutes = relatedSessions.reduce((sum, session) => {
    return sum + (session.duration || 0);
  }, 0);
  
  return totalMinutes;
};

/**
 * Mark assignment as completed
 * @param {Object} assignment - Assignment to mark as completed
 * @param {Array} studySessions - All study sessions
 * @returns {Object} Updated assignment with completion data
 */
export const markAssignmentCompleted = (assignment, studySessions) => {
  const actualTimeSpent = calculateActualTimeSpent(assignment, studySessions);
  
  return {
    ...assignment,
    completed: true,
    completedAt: new Date().toISOString(),
    actualTimeSpent: actualTimeSpent, // in minutes
    estimatedTimeSpent: assignment.estimatedTimeSpent || null,
  };
};

/**
 * Start tracking time for an assignment
 * @param {Object} assignment - Assignment to start tracking
 * @returns {Object} Updated assignment with start time
 */
export const startTrackingAssignment = (assignment) => {
  return {
    ...assignment,
    startedAt: new Date().toISOString(),
    isTracking: true,
  };
};

/**
 * Get completion statistics for a course
 * @param {String} courseName - Course name or code
 * @param {Array} assignments - All assignments
 * @returns {Object} Statistics object
 */
export const getCourseCompletionStats = (courseName, assignments) => {
  const courseAssignments = assignments.filter(a => 
    a.course === courseName || a.course === courseName
  );
  
  const completed = courseAssignments.filter(a => a.completed);
  const avgTimeSpent = completed.length > 0
    ? completed.reduce((sum, a) => sum + (a.actualTimeSpent || 0), 0) / completed.length
    : 0;
  
  return {
    total: courseAssignments.length,
    completed: completed.length,
    completionRate: courseAssignments.length > 0 
      ? (completed.length / courseAssignments.length) * 100 
      : 0,
    avgTimeSpent: avgTimeSpent, // in minutes
  };
};

/**
 * Mark study session as completed
 * @param {Object} session - Study session to mark as completed
 * @returns {Object} Updated session with completion data
 */
export const markSessionCompleted = (session) => {
  return {
    ...session,
    completed: true,
    completedAt: new Date().toISOString(),
  };
};

/**
 * Get assignment completion pattern from study sessions
 * @param {Object} assignment - Assignment object
 * @param {Array} studySessions - All study sessions
 * @returns {Object} Completion pattern data
 */
export const getAssignmentCompletionPattern = (assignment, studySessions) => {
  // Find all sessions related to this assignment
  const relatedSessions = studySessions.filter(s => 
    s.assignmentTitle === assignment.title ||
    (s.course === assignment.course && 
     new Date(s.startTime) >= new Date(assignment.createdAt) &&
     new Date(s.startTime) <= new Date(assignment.dueDate))
  );
  
  const completedSessions = relatedSessions.filter(s => s.completed);
  const totalSessions = relatedSessions.length;
  const completedCount = completedSessions.length;
  
  // Calculate total time from completed sessions
  const totalTimeSpent = completedSessions.reduce((sum, s) => 
    sum + (s.duration || 0), 0
  );
  
  // Calculate average session duration
  const avgSessionDuration = completedSessions.length > 0
    ? totalTimeSpent / completedSessions.length
    : 0;
  
  return {
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    course: assignment.course,
    assignmentType: assignment.assignmentType || 'homework', // Could be extracted from title
    totalSessions: totalSessions,
    completedSessions: completedCount,
    sessionsNeeded: assignment.completed ? completedCount : null, // Only if assignment is done
    totalTimeSpent: totalTimeSpent, // in minutes
    avgSessionDuration: avgSessionDuration, // in minutes
    isCompleted: assignment.completed || false,
  };
};

/**
 * Get completion patterns by assignment type and course for ML training
 * @param {Array} assignments - All assignments
 * @param {Array} studySessions - All study sessions
 * @returns {Array} Pattern data for ML
 */
export const getCompletionPatternsForML = (assignments, studySessions) => {
  const completedAssignments = assignments.filter(a => a.completed);
  
  return completedAssignments.map(assignment => {
    const pattern = getAssignmentCompletionPattern(assignment, studySessions);
    
    // Detect assignment type from title
    const titleLower = assignment.title.toLowerCase();
    let assignmentType = 'other';
    if (titleLower.includes('homework') || titleLower.includes('hw')) {
      assignmentType = 'homework';
    } else if (titleLower.includes('project')) {
      assignmentType = 'project';
    } else if (titleLower.includes('exam') || titleLower.includes('test') || titleLower.includes('final')) {
      assignmentType = 'exam';
    } else if (titleLower.includes('lab')) {
      assignmentType = 'lab_report';
    } else if (titleLower.includes('essay') || titleLower.includes('paper')) {
      assignmentType = 'essay';
    }
    
    return {
      ...pattern,
      assignmentType: assignmentType,
      priority: assignment.priority,
      actualTimeSpent: assignment.actualTimeSpent || pattern.totalTimeSpent,
    };
  });
};

