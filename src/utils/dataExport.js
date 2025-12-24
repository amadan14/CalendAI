/**
 * Data Export Utility
 * 
 * Exports calendar data in JSON format for ML training
 * This data can be used to train machine learning models
 */

/**
 * Export all calendar data for ML training
 * Includes completion data for adaptive learning
 * 
 * @param {Object} data - Calendar data
 * @param {Array} data.assignments - Assignments array
 * @param {Array} data.courses - Courses array
 * @param {Array} data.studySessions - Study sessions array
 * @returns {String} JSON string of exported data
 */
export const exportTrainingData = (data) => {
  const { assignments, courses, studySessions } = data;
  
  // Enrich assignments with completion data for ML training
  const enrichedAssignments = (assignments || []).map(assignment => {
    const enriched = { ...assignment };
    
    // Add completion status
    enriched.isCompleted = assignment.completed || false;
    
    // Add actual time spent (for completed assignments)
    if (assignment.completed && assignment.actualTimeSpent) {
      enriched.actualTimeSpentMinutes = assignment.actualTimeSpent;
      enriched.actualTimeSpentHours = assignment.actualTimeSpent / 60;
    }
    
    // Add estimated vs actual comparison
    if (assignment.completed && assignment.actualTimeSpent && assignment.estimatedTimeSpent) {
      enriched.timeAccuracy = assignment.actualTimeSpent / assignment.estimatedTimeSpent;
    }
    
    // Add completion date
    if (assignment.completedAt) {
      enriched.completedAt = assignment.completedAt;
    }
    
    return enriched;
  });
  
  // Enrich study sessions with completion data and link to assignments
  const enrichedSessions = (studySessions || []).map(session => {
    const enriched = { ...session };
    
    // Add completion status
    enriched.isCompleted = session.completed || false;
    
    // Link to assignment if found
    const relatedAssignment = assignments.find(a => 
      a.title === session.assignmentTitle || 
      (a.course === session.course && 
       new Date(session.startTime) >= new Date(a.createdAt))
    );
    
    if (relatedAssignment) {
      enriched.assignmentId = relatedAssignment.id;
      enriched.assignmentCompleted = relatedAssignment.completed || false;
      enriched.assignmentType = relatedAssignment.assignmentType || 'homework';
    }
    
    // Add completion date
    if (session.completedAt) {
      enriched.completedAt = session.completedAt;
    }
    
    return enriched;
  });
  
  // Calculate completion patterns per assignment type and course
  const completionPatterns = [];
  const completedAssignments = assignments.filter(a => a.completed);
  
  completedAssignments.forEach(assignment => {
    const relatedSessions = studySessions.filter(s => 
      s.assignmentTitle === assignment.title ||
      (s.course === assignment.course && 
       new Date(s.startTime) >= new Date(assignment.createdAt))
    );
    
    const completedSessions = relatedSessions.filter(s => s.completed);
    
    // Detect assignment type
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
    
    if (completedSessions.length > 0) {
      completionPatterns.push({
        assignmentType: assignmentType,
        course: assignment.course,
        sessionsNeeded: completedSessions.length,
        totalSessions: relatedSessions.length,
        totalTimeSpent: completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        avgSessionDuration: completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length,
        actualTimeSpent: assignment.actualTimeSpent || null,
      });
    }
  });
  
  // Add metadata about completion rates
  const completedCount = enrichedAssignments.filter(a => a.isCompleted).length;
  const avgActualTime = enrichedAssignments
    .filter(a => a.actualTimeSpentMinutes)
    .reduce((sum, a) => sum + a.actualTimeSpentMinutes, 0) / 
    Math.max(completedCount, 1);
  
  // Add metadata
  const completedSessionsCount = enrichedSessions.filter(s => s.isCompleted).length;
  const avgSessionDuration = enrichedSessions.length > 0
    ? enrichedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / enrichedSessions.length
    : 0;
  
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.1', // Updated version to include session completion patterns
    assignments: enrichedAssignments,
    courses: courses || [],
    studySessions: enrichedSessions,
    completionPatterns: completionPatterns, // New: patterns for ML learning
    metadata: {
      totalAssignments: assignments?.length || 0,
      totalCourses: courses?.length || 0,
      totalStudySessions: studySessions?.length || 0,
      completedAssignments: completedCount,
      completedStudySessions: completedSessionsCount,
      completionRate: assignments?.length > 0 
        ? (completedCount / assignments.length) * 100 
        : 0,
      sessionCompletionRate: studySessions?.length > 0
        ? (completedSessionsCount / studySessions.length) * 100
        : 0,
      avgActualTimeSpent: avgActualTime, // in minutes
      avgSessionDuration: avgSessionDuration, // in minutes
      completionPatternsCount: completionPatterns.length,
    }
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Download training data as JSON file
 * 
 * @param {Object} data - Calendar data
 * @param {String} filename - Optional filename (default: training-data-YYYY-MM-DD.json)
 */
export const downloadTrainingData = (data, filename = null) => {
  const jsonContent = exportTrainingData(data);
  
  if (!filename) {
    const date = new Date().toISOString().split('T')[0];
    filename = `training-data-${date}.json`;
  }
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

