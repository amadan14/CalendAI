import { parseISO, format, addDays, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from 'date-fns';

/**
 * Parse natural language requests and convert them to actionable commands
 * 
 * This uses a rule-based parser by default. To use GPT instead:
 * 1. Install: npm install openai
 * 2. Set REACT_APP_OPENAI_API_KEY in .env file
 * 3. Change the import in AIAgentView.js to use parseWithLLM from aiAgentLLM.js
 */
export const parseNaturalLanguageRequest = async (request, context) => {
  const { assignments, courses, studySessions } = context;
  const lowerRequest = request.toLowerCase();
  const actions = [];

  // Add assignment patterns
  if (lowerRequest.includes('add') || lowerRequest.includes('create') || lowerRequest.includes('new')) {
    if (lowerRequest.includes('assignment') || lowerRequest.includes('homework') || lowerRequest.includes('project') || lowerRequest.includes('exam') || lowerRequest.includes('quiz')) {
      const assignment = parseAssignmentRequest(request, courses);
      if (assignment) {
        actions.push({
          type: 'add_assignment',
          data: assignment,
          description: `add assignment "${assignment.title}"`,
          details: `Due: ${format(parseISO(assignment.dueDate), 'MMM d, yyyy')} | Course: ${assignment.course}`,
          requiresConfirmation: true,
        });
      }
    }
  }

  // Update assignment patterns
  if (lowerRequest.includes('update') || lowerRequest.includes('change') || lowerRequest.includes('modify')) {
    if (lowerRequest.includes('assignment') || lowerRequest.includes('due date')) {
      const update = parseAssignmentUpdate(request, assignments);
      if (update) {
        actions.push({
          type: 'update_assignment',
          data: update,
          description: `update assignment "${update.title}"`,
          details: Object.keys(update.updates).map(k => `${k}: ${update.updates[k]}`).join(', '),
          requiresConfirmation: true,
        });
      }
    }
  }

  // Delete assignment patterns
  if (lowerRequest.includes('delete') || lowerRequest.includes('remove') || lowerRequest.includes('cancel')) {
    if (lowerRequest.includes('assignment')) {
      const assignment = findAssignmentByName(request, assignments);
      if (assignment) {
        actions.push({
          type: 'delete_assignment',
          data: { id: assignment.id },
          description: `delete assignment "${assignment.title}"`,
          requiresConfirmation: true,
        });
      }
    }
  }

  // Add course patterns
  if (lowerRequest.includes('add course') || lowerRequest.includes('new course')) {
    const course = parseCourseRequest(request);
    if (course) {
      actions.push({
        type: 'add_course',
        data: course,
        description: `add course "${course.name}"`,
        requiresConfirmation: true,
      });
    }
  }

  // Update study session patterns
  if (lowerRequest.includes('move') || lowerRequest.includes('reschedule') || lowerRequest.includes('change time')) {
    if (lowerRequest.includes('study')) {
      const update = parseStudySessionUpdate(request, studySessions);
      if (update) {
        actions.push({
          type: 'update_study_session',
          data: update,
          description: `reschedule study session`,
          details: `New time: ${format(parseISO(update.updates.startTime), 'MMM d, h:mm a')}`,
          requiresConfirmation: true,
        });
      }
    }
  }

  // Query patterns - expanded to include "how busy", "how many", etc.
  if (lowerRequest.includes('show') || lowerRequest.includes('list') || lowerRequest.includes('what') || 
      lowerRequest.includes('when') || lowerRequest.includes('how busy') || lowerRequest.includes('how many') ||
      lowerRequest.includes('how much') || lowerRequest.includes('tell me')) {
    const queryResult = handleQuery(request, { assignments, courses, studySessions });
    if (queryResult) {
      actions.push({
        type: 'query',
        data: queryResult,
        description: queryResult.description,
        requiresConfirmation: false,
      });
    }
  }

  return actions;
};

const parseAssignmentRequest = (request, courses) => {
  // Extract assignment title
  const titleMatch = request.match(/(?:add|create|new)\s+(?:a|an|the)?\s*(?:assignment|homework|project|exam|quiz)?\s*(?:called|named|titled)?\s*['"]?([^'"]+)['"]?/i);
  const title = titleMatch ? titleMatch[1].trim() : extractTitle(request);

  // Extract due date
  const dueDate = parseDateFromRequest(request);

  // Extract course
  const course = extractCourseFromRequest(request, courses);

  // Extract priority
  const priority = extractPriority(request);

  if (!title || !dueDate || !course) {
    return null;
  }

  return {
    title,
    course,
    dueDate: dueDate.toISOString(),
    priority,
    description: '',
  };
};

const parseDateFromRequest = (request) => {
  const lower = request.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Relative dates
  if (lower.includes('today')) return today;
  if (lower.includes('tomorrow')) return addDays(today, 1);
  if (lower.includes('next week')) return addDays(today, 7);
  if (lower.includes('next monday')) {
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    return addDays(today, daysUntilMonday);
  }
  if (lower.includes('next friday')) {
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    return addDays(today, daysUntilFriday);
  }

  // Day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lower.includes(days[i])) {
      const daysUntil = (i - today.getDay() + 7) % 7 || 7;
      return addDays(today, daysUntil);
    }
  }

  // Specific dates (MM/DD, MMM DD, etc.)
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
  ];

  for (const pattern of datePatterns) {
    const match = request.match(pattern);
    if (match) {
      // Simple date parsing - in production, use a proper date library
      const date = new Date(match[0]);
      if (!isNaN(date.getTime())) {
        date.setHours(23, 59, 59, 999);
        return date;
      }
    }
  }

  // Default to a week from now if no date found
  return addDays(today, 7);
};

const extractCourseFromRequest = (request, courses) => {
  // Try to find course name in request
  for (const course of courses) {
    if (request.toLowerCase().includes(course.name.toLowerCase()) || 
        request.toLowerCase().includes(course.code.toLowerCase())) {
      return course.name;
    }
  }

  // Extract course code pattern (e.g., "CS 101", "MATH 201")
  const courseMatch = request.match(/([A-Z]{2,4}\s?\d{3,4})/i);
  if (courseMatch) {
    return courseMatch[1];
  }

  // Default to first course or "Unknown Course"
  return courses.length > 0 ? courses[0].name : 'Unknown Course';
};

const extractTitle = (request) => {
  // Try to extract title from various patterns
  const patterns = [
    /(?:called|named|titled)\s+['"]?([^'"]+)['"]?/i,
    /(?:assignment|homework|project|exam|quiz)\s+(?:for|on|about)?\s*['"]?([^'"]+)['"]?/i,
  ];

  for (const pattern of patterns) {
    const match = request.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: use a generic title
  if (request.toLowerCase().includes('homework')) return 'Homework';
  if (request.toLowerCase().includes('project')) return 'Project';
  if (request.toLowerCase().includes('exam')) return 'Exam';
  if (request.toLowerCase().includes('quiz')) return 'Quiz';
  
  return 'Assignment';
};

const extractPriority = (request) => {
  const lower = request.toLowerCase();
  if (lower.includes('high') || lower.includes('urgent') || lower.includes('important')) return 'high';
  if (lower.includes('low') || lower.includes('not important')) return 'low';
  return 'medium';
};

const parseAssignmentUpdate = (request, assignments) => {
  const assignment = findAssignmentByName(request, assignments);
  if (!assignment) return null;

  const updates = {};
  const newDueDate = parseDateFromRequest(request);
  if (newDueDate && !isSameDay(parseISO(assignment.dueDate), newDueDate)) {
    updates.dueDate = newDueDate.toISOString();
  }

  const newPriority = extractPriority(request);
  if (newPriority && newPriority !== assignment.priority) {
    updates.priority = newPriority;
  }

  if (Object.keys(updates).length === 0) return null;

  return {
    id: assignment.id,
    title: assignment.title,
    updates,
  };
};

const findAssignmentByName = (request, assignments) => {
  const lower = request.toLowerCase();
  for (const assignment of assignments) {
    if (lower.includes(assignment.title.toLowerCase()) || 
        lower.includes(assignment.course.toLowerCase())) {
      return assignment;
    }
  }
  return assignments[0]; // Fallback to first assignment
};

const parseCourseRequest = (request) => {
  const courseMatch = request.match(/([A-Z]{2,4}\s?\d{3,4})/i);
  if (!courseMatch) return null;

  return {
    name: courseMatch[1],
    code: courseMatch[1],
  };
};

const parseStudySessionUpdate = (request, studySessions) => {
  const session = studySessions[0]; // Simplified - find by assignment name in production
  if (!session) return null;

  const newDate = parseDateFromRequest(request);
  const newTime = parseTimeFromRequest(request);
  
  if (!newDate && !newTime) return null;

  const startTime = new Date(newDate || parseISO(session.startTime));
  if (newTime) {
    startTime.setHours(newTime.hours, newTime.minutes, 0, 0);
  }

  const duration = session.duration || 120;
  const endTime = new Date(startTime.getTime() + duration * 60000);

  return {
    id: session.id,
    updates: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      date: startTime.toISOString().split('T')[0],
    },
  };
};

const parseTimeFromRequest = (request) => {
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
  ];

  for (const pattern of timePatterns) {
    const match = request.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const period = match[3]?.toLowerCase() || match[2]?.toLowerCase();

      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      return { hours, minutes };
    }
  }

  return null;
};

const handleQuery = (request, context) => {
  const { assignments, courses, studySessions } = context;
  const lower = request.toLowerCase();

  try {
    // Query for "schedule" - comprehensive schedule view
    if (lower.includes('schedule') && (lower.includes('next week') || lower.includes('this week') || lower.includes('week'))) {
      const timeFrame = lower.includes('next week') ? 'next week' : lower.includes('this week') ? 'this week' : 'upcoming';
      const today = new Date();
      const weekStart = timeFrame === 'next week' 
        ? addDays(startOfWeek(today, { weekStartsOn: 0 }), 7)
        : startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = timeFrame === 'next week'
        ? addDays(endOfWeek(today, { weekStartsOn: 0 }), 7)
        : endOfWeek(today, { weekStartsOn: 0 });
      
      const weekAssignments = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
        } catch (e) {
          return false;
        }
      }).sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate));

      const weekSessions = studySessions.filter(s => {
        try {
          if (!s.startTime) return false;
          const startTime = parseISO(s.startTime);
          if (isNaN(startTime.getTime())) return false;
          return isWithinInterval(startTime, { start: weekStart, end: weekEnd });
        } catch (e) {
          return false;
        }
      }).sort((a, b) => parseISO(a.startTime) - parseISO(b.startTime));

      const totalHours = weekSessions.reduce((sum, s) => sum + (s.duration || 120) / 60, 0);

      let details = `📅 ${timeFrame === 'next week' ? 'Next Week' : 'This Week'}'s Schedule\n\n`;
      
      if (weekAssignments.length > 0) {
        details += `📝 Assignments (${weekAssignments.length}):\n`;
        details += weekAssignments.map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `  • ${a.title} (${a.course}) - Due: ${format(dueDate, 'MMM d, yyyy')} - Priority: ${a.priority}`;
          } catch (e) {
            return `  • ${a.title} (${a.course}) - Priority: ${a.priority}`;
          }
        }).join('\n');
      } else {
        details += `📝 Assignments: None scheduled\n`;
      }
      
      if (weekSessions.length > 0) {
        if (weekAssignments.length > 0) details += '\n\n';
        details += `📚 Study Sessions (${weekSessions.length}, ${totalHours.toFixed(1)} hours total):\n`;
        details += weekSessions.map(s => {
          try {
            const startTime = parseISO(s.startTime);
            const endTime = s.endTime ? parseISO(s.endTime) : new Date(startTime.getTime() + (s.duration || 120) * 60 * 1000);
            return `  • ${s.assignmentTitle} - ${format(startTime, 'MMM d, h:mm a')} to ${format(endTime, 'h:mm a')}${s.topic ? ` - ${s.topic}` : ''}`;
          } catch (e) {
            return `  • ${s.assignmentTitle} - ${s.date || s.startTime}`;
          }
        }).join('\n');
      } else {
        if (weekAssignments.length > 0) details += '\n\n';
        details += `📚 Study Sessions: None scheduled\n`;
      }
      
      if (weekAssignments.length === 0 && weekSessions.length === 0) {
        details = `📅 ${timeFrame === 'next week' ? 'Next Week' : 'This Week'}'s Schedule\n\nYou have a free week! No assignments or study sessions scheduled.`;
      }

      return {
        description: `${timeFrame === 'next week' ? 'Next week' : 'This week'}'s schedule: ${weekAssignments.length} assignment(s), ${weekSessions.length} study session(s)`,
        details: details,
      };
    }

    // Query for "how busy" - comprehensive schedule summary
    if (lower.includes('how busy') || lower.includes('busy')) {
      const timeFrame = lower.includes('next week') ? 'next week' : lower.includes('this week') ? 'this week' : 'upcoming';
      const today = new Date();
      const weekStart = timeFrame === 'next week' 
        ? addDays(startOfWeek(today, { weekStartsOn: 0 }), 7)
        : startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = timeFrame === 'next week'
        ? addDays(endOfWeek(today, { weekStartsOn: 0 }), 7)
        : endOfWeek(today, { weekStartsOn: 0 });
      
      const weekAssignments = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
        } catch (e) {
          return false;
        }
      });

      const weekSessions = studySessions.filter(s => {
        try {
          if (!s.startTime) return false;
          const startTime = parseISO(s.startTime);
          if (isNaN(startTime.getTime())) return false;
          return isWithinInterval(startTime, { start: weekStart, end: weekEnd });
        } catch (e) {
          return false;
        }
      });

      const totalHours = weekSessions.reduce((sum, s) => sum + (s.duration || 120) / 60, 0);

      let details = '';
      if (weekAssignments.length > 0) {
        details += `${weekAssignments.length} assignment(s) due:\n`;
        details += weekAssignments.map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `  • ${a.title} (${a.course}) - ${format(dueDate, 'MMM d')}`;
          } catch (e) {
            return `  • ${a.title} (${a.course})`;
          }
        }).join('\n');
      }
      if (weekSessions.length > 0) {
        if (details) details += '\n\n';
        details += `${weekSessions.length} study session(s) scheduled (${totalHours.toFixed(1)} hours total)`;
      }
      if (weekAssignments.length === 0 && weekSessions.length === 0) {
        details = 'You have a free week! No assignments or study sessions scheduled.';
      }

      return {
        description: `${timeFrame === 'next week' ? 'Next week' : 'This week'} you have: ${weekAssignments.length} assignment(s) due, ${weekSessions.length} study session(s) scheduled`,
        details: details || 'No scheduled items.',
      };
    }

    // Query for "how many assignments" - specific count
    if (lower.includes('how many') && lower.includes('assignment')) {
      const timeFrame = lower.includes('next week') ? 'next week' : lower.includes('this week') ? 'this week' : 'all';
      
      let targetAssignments = [];
      if (timeFrame === 'next week' || timeFrame === 'this week') {
        const today = new Date();
        const weekStart = timeFrame === 'next week' 
          ? addDays(startOfWeek(today, { weekStartsOn: 0 }), 7)
          : startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = timeFrame === 'next week'
          ? addDays(endOfWeek(today, { weekStartsOn: 0 }), 7)
          : endOfWeek(today, { weekStartsOn: 0 });
        
        targetAssignments = assignments.filter(a => {
          try {
            if (!a.dueDate) return false;
            const dueDate = parseISO(a.dueDate);
            if (isNaN(dueDate.getTime())) return false;
            return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
          } catch (e) {
            return false;
          }
        });
      } else {
        targetAssignments = assignments.filter(a => {
          try {
            if (!a.dueDate) return false;
            const dueDate = parseISO(a.dueDate);
            return !isNaN(dueDate.getTime()) && dueDate >= new Date();
          } catch (e) {
            return false;
          }
        });
      }

      let details = '';
      if (targetAssignments.length > 0) {
        details = targetAssignments.map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `• ${a.title} (${a.course}) - ${format(dueDate, 'MMM d, yyyy')}`;
          } catch (e) {
            return `• ${a.title} (${a.course})`;
          }
        }).join('\n');
      } else {
        details = `No assignments ${timeFrame === 'all' ? 'upcoming' : `due ${timeFrame}`}.`;
      }

      return {
        description: `You have ${targetAssignments.length} assignment(s) ${timeFrame === 'all' ? 'upcoming' : `due ${timeFrame}`}`,
        details: details,
      };
    }

    // Query for assignments due next week
    if (lower.includes('assignment') && lower.includes('next week')) {
      const today = new Date();
      const weekStart = addDays(startOfWeek(today, { weekStartsOn: 0 }), 7);
      const weekEnd = addDays(endOfWeek(today, { weekStartsOn: 0 }), 7);
      
      const weekAssignments = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
        } catch (e) {
          console.warn('Error parsing assignment due date:', a, e);
          return false;
        }
      });

      if (weekAssignments.length === 0) {
        return {
          description: `You have no assignments due next week.`,
          details: 'Great job staying ahead!',
        };
      }

      return {
        description: `You have ${weekAssignments.length} assignment(s) due next week`,
        details: weekAssignments.map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `• ${a.title} (${a.course}) - ${format(dueDate, 'MMM d')}`;
          } catch (e) {
            return `• ${a.title} (${a.course}) - ${a.dueDate}`;
          }
        }).join('\n'),
      };
    }

    // Query for assignments due this week
    if (lower.includes('assignment') && (lower.includes('this week') || lower.includes('due this week') || lower.includes('upcoming'))) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
      
      const weekAssignments = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
        } catch (e) {
          console.warn('Error parsing assignment due date:', a, e);
          return false;
        }
      });

      if (weekAssignments.length === 0) {
        return {
          description: `You have no assignments due this week.`,
          details: 'Great job staying ahead!',
        };
      }

      return {
        description: `You have ${weekAssignments.length} assignment(s) due this week`,
        details: weekAssignments.map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `• ${a.title} (${a.course}) - ${format(dueDate, 'MMM d')}`;
          } catch (e) {
            return `• ${a.title} (${a.course}) - ${a.dueDate}`;
          }
        }).join('\n'),
      };
    }

    // Query for all assignments
    if ((lower.includes('assignment') || lower.includes('homework')) && (lower.includes('all') || lower.includes('list') || lower.includes('show'))) {
      const upcoming = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          return !isNaN(dueDate.getTime()) && dueDate >= new Date();
        } catch (e) {
          return false;
        }
      }).sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate));

      const past = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          return !isNaN(dueDate.getTime()) && dueDate < new Date();
        } catch (e) {
          return false;
        }
      });

      let details = '';
      if (upcoming.length > 0) {
        details += 'Upcoming:\n' + upcoming.map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `• ${a.title} (${a.course}) - ${format(dueDate, 'MMM d, yyyy')}`;
          } catch (e) {
            return `• ${a.title} (${a.course}) - ${a.dueDate}`;
          }
        }).join('\n');
      }
      if (past.length > 0) {
        if (details) details += '\n\n';
        details += 'Past:\n' + past.slice(0, 10).map(a => {
          try {
            const dueDate = parseISO(a.dueDate);
            return `• ${a.title} (${a.course}) - ${format(dueDate, 'MMM d, yyyy')}`;
          } catch (e) {
            return `• ${a.title} (${a.course}) - ${a.dueDate}`;
          }
        }).join('\n');
      }

      return {
        description: `You have ${assignments.length} assignment(s) total (${upcoming.length} upcoming, ${past.length} past)`,
        details: details || 'No assignments found.',
      };
    }

    // Query for study sessions
    if (lower.includes('study session')) {
      const upcomingSessions = studySessions.filter(s => {
        try {
          if (!s.startTime) return false;
          const startTime = parseISO(s.startTime);
          return !isNaN(startTime.getTime()) && startTime >= new Date();
        } catch (e) {
          return false;
        }
      }).sort((a, b) => parseISO(a.startTime) - parseISO(b.startTime));

      return {
        description: `You have ${studySessions.length} study session(s) scheduled (${upcomingSessions.length} upcoming)`,
        details: upcomingSessions.slice(0, 10).map(s => {
          try {
            const startTime = parseISO(s.startTime);
            return `• ${s.assignmentTitle} - ${format(startTime, 'MMM d, h:mm a')}`;
          } catch (e) {
            return `• ${s.assignmentTitle} - ${s.startTime || s.date}`;
          }
        }).join('\n') || 'No upcoming study sessions.',
      };
    }

    // Query for next assignment
    if (lower.includes('next assignment') || lower.includes('when is') || lower.includes('what is due')) {
      const upcoming = assignments.filter(a => {
        try {
          if (!a.dueDate) return false;
          const dueDate = parseISO(a.dueDate);
          return !isNaN(dueDate.getTime()) && dueDate >= new Date();
        } catch (e) {
          return false;
        }
      }).sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate));

      if (upcoming.length > 0) {
        const next = upcoming[0];
        try {
          const dueDate = parseISO(next.dueDate);
          return {
            description: `Your next assignment is due on ${format(dueDate, 'MMMM d, yyyy')}`,
            details: `${next.title} (${next.course}) - Priority: ${next.priority}`,
          };
        } catch (e) {
          return {
            description: `Your next assignment is ${next.title}`,
            details: `${next.title} (${next.course}) - Due: ${next.dueDate}`,
          };
        }
      }

      return {
        description: 'You have no upcoming assignments!',
        details: 'Great job staying on top of your work!',
      };
    }
  } catch (error) {
    console.error('Error in handleQuery:', error);
    return null;
  }

  return null;
};

