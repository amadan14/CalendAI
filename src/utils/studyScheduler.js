import { parseISO, format, addDays, differenceInDays, isSameDay, getDay, setHours, setMinutes, addMinutes, isAfter, isBefore } from 'date-fns';

const dayNameToNumber = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0,
};

const numberToDayName = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/**
 * Get course schedule blocks for a given date
 */
export const getCourseBlocksForDate = (date, courses) => {
  const dayName = numberToDayName[getDay(date)];
  const blocks = [];

  courses.forEach(course => {
    if (course.days && course.days.includes(dayName) && course.startTime && course.endTime) {
      const courseStart = new Date(course.startTime);
      const courseEnd = new Date(course.endTime);
      
      const blockStart = new Date(date);
      blockStart.setHours(courseStart.getHours(), courseStart.getMinutes(), 0, 0);
      
      const blockEnd = new Date(date);
      blockEnd.setHours(courseEnd.getHours(), courseEnd.getMinutes(), 0, 0);
      
      blocks.push({
        start: blockStart,
        end: blockEnd,
        course: course.name,
      });
    }
  });

  return blocks.sort((a, b) => a.start - b.start);
};

/**
 * Get available time slots for a given date based on preferences and course schedule
 */
export const getAvailableTimeSlots = (date, preferences, courses) => {
  const dayName = numberToDayName[getDay(date)];
  const dayPrefs = preferences?.dailyAvailability?.[dayName];
  
  if (!dayPrefs || !dayPrefs.available) {
    return [];
  }

  const courseBlocks = getCourseBlocksForDate(date, courses);
  
  // Get user's preferred time window for this day
  const dayStart = new Date(dayPrefs.startTime);
  const dayEnd = new Date(dayPrefs.endTime);
  
  const dateStart = new Date(date);
  dateStart.setHours(dayStart.getHours(), dayStart.getMinutes(), 0, 0);
  
  const dateEnd = new Date(date);
  dateEnd.setHours(dayEnd.getHours(), dayEnd.getMinutes(), 0, 0);

  // Adjust for morning/evening preferences
  if (preferences?.morningPerson) {
    // Prefer earlier times - shift window earlier
    const hoursToShift = 2;
    const newStartHour = Math.max(6, dateStart.getHours() - hoursToShift);
    dateStart.setHours(newStartHour, dateStart.getMinutes(), 0, 0);
    const newEndHour = Math.min(18, dateEnd.getHours() - hoursToShift);
    dateEnd.setHours(newEndHour, dateEnd.getMinutes(), 0, 0);
  } else if (preferences?.eveningPerson) {
    // Prefer later times - shift window later
    const hoursToShift = 2;
    const newStartHour = Math.min(22, dateStart.getHours() + hoursToShift);
    dateStart.setHours(newStartHour, dateStart.getMinutes(), 0, 0);
    const newEndHour = Math.min(23, dateEnd.getHours() + hoursToShift);
    dateEnd.setHours(newEndHour, dateEnd.getMinutes(), 0, 0);
  }

  // Find available slots by removing course blocks
  const slots = [];
  let currentTime = new Date(dateStart);
  const sessionDuration = (preferences?.defaultSessionDuration || 2) * 60; // minutes
  const breakDuration = preferences?.breakDuration || 15; // minutes

  while (currentTime < dateEnd) {
    const slotEnd = new Date(currentTime.getTime() + sessionDuration * 60000);
    
    // Check if this slot conflicts with any course
    const conflicts = courseBlocks.some(block => {
      return (currentTime >= block.start && currentTime < block.end) ||
             (slotEnd > block.start && slotEnd <= block.end) ||
             (currentTime <= block.start && slotEnd >= block.end);
    });

    // Check if slot fits within the day
    if (!conflicts && slotEnd <= dateEnd) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        duration: sessionDuration,
      });
    }

    // Move to next potential slot (with break)
    currentTime = new Date(currentTime.getTime() + (sessionDuration + breakDuration) * 60000);
  }

  return slots;
};

/**
 * Intelligent study schedule generator
 */
export const generateIntelligentSchedule = (assignments, courses, preferences) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAssignments = assignments
    .filter(a => {
      const dueDate = parseISO(a.dueDate);
      dueDate.setHours(23, 59, 59, 999);
      return dueDate >= today;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (upcomingAssignments.length === 0) {
    return [];
  }

  const sessions = [];
  const maxHoursPerDay = preferences?.maxStudyHoursPerDay || 6;
  const sessionDuration = (preferences?.defaultSessionDuration || 2) * 60; // minutes

  // Track daily study hours
  const dailyHours = {};

  upcomingAssignments.forEach((assignment) => {
    const dueDate = parseISO(assignment.dueDate);
    dueDate.setHours(23, 59, 59, 999);
    const daysUntilDue = differenceInDays(dueDate, today);
    
    // Determine total study hours needed based on priority
    let totalStudyHours = 0;
    switch (assignment.priority) {
      case 'high':
        totalStudyHours = Math.max(8, Math.min(daysUntilDue * 1.5, 20));
        break;
      case 'medium':
        totalStudyHours = Math.max(5, Math.min(daysUntilDue * 1, 12));
        break;
      case 'low':
        totalStudyHours = Math.max(3, Math.min(daysUntilDue * 0.5, 8));
        break;
      default:
        totalStudyHours = Math.max(5, Math.min(daysUntilDue * 1, 10));
    }

    // Calculate how many sessions needed
    const sessionsNeeded = Math.ceil((totalStudyHours * 60) / sessionDuration);
    
    // Determine study window (start 2 weeks before or as early as possible)
    const studyStartDate = daysUntilDue > 14 
      ? addDays(dueDate, -14)
      : today;
    
    // Get all potential dates
    const potentialDates = [];
    for (let i = 0; i < daysUntilDue && i < 14; i++) {
      const candidateDate = addDays(studyStartDate, i);
      if (candidateDate < dueDate && candidateDate >= today) {
        const dayName = numberToDayName[getDay(candidateDate)];
        const dayPrefs = preferences?.dailyAvailability?.[dayName];
        
        // Skip if day is not available or weekend avoidance is enabled
        if (preferences?.avoidWeekends) {
          const isWeekend = getDay(candidateDate) === 0 || getDay(candidateDate) === 6;
          if (isWeekend && daysUntilDue > 7) continue;
        }
        
        if (dayPrefs?.available) {
          potentialDates.push(candidateDate);
        }
      }
    }

    // Distribute sessions across available dates
    // Prioritize dates closer to due date for high priority, spread out for others
    const sortedDates = assignment.priority === 'high'
      ? [...potentialDates].reverse() // Start closer to due date
      : potentialDates; // Spread out from start

    let sessionsScheduled = 0;
    for (const date of sortedDates) {
      if (sessionsScheduled >= sessionsNeeded) break;
      
      const dateKey = format(date, 'yyyy-MM-dd');
      const currentDayHours = dailyHours[dateKey] || 0;
      const hoursToAdd = sessionDuration / 60;
      
      // Check if we can fit more study time this day
      if (currentDayHours + hoursToAdd <= maxHoursPerDay) {
        const availableSlots = getAvailableTimeSlots(date, preferences, courses);
        
        // Find the best slot (prefer earlier slots for morning person, later for evening)
        let bestSlot = null;
        if (preferences?.morningPerson) {
          bestSlot = availableSlots[0]; // First available slot
        } else if (preferences?.eveningPerson) {
          bestSlot = availableSlots[availableSlots.length - 1]; // Last available slot
        } else {
          // Prefer slots around preferred time
          const preferredTime = new Date(preferences?.preferredStartTime || new Date().setHours(10, 0));
          bestSlot = availableSlots.reduce((best, slot) => {
            const bestDiff = Math.abs(best.start.getTime() - preferredTime.getTime());
            const slotDiff = Math.abs(slot.start.getTime() - preferredTime.getTime());
            return slotDiff < bestDiff ? slot : best;
          }, availableSlots[0] || null);
        }

        if (bestSlot) {
          sessions.push({
            id: `${assignment.id}-${sessionsScheduled}-${dateKey}`,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            course: assignment.course,
            date: date.toISOString(),
            startTime: bestSlot.start.toISOString(),
            endTime: bestSlot.end.toISOString(),
            duration: sessionDuration,
            priority: assignment.priority,
          });
          
          dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hoursToAdd;
          sessionsScheduled++;
        }
      }
    }

    // If we couldn't schedule all sessions, try to fit them in remaining days
    if (sessionsScheduled < sessionsNeeded) {
      const remainingSessions = sessionsNeeded - sessionsScheduled;
      for (let i = 0; i < remainingSessions && i < potentialDates.length * 2; i++) {
        // Try to find any available slot
        for (const date of potentialDates) {
          const dateKey = format(date, 'yyyy-MM-dd');
          const currentDayHours = dailyHours[dateKey] || 0;
          const hoursToAdd = sessionDuration / 60;
          
          if (currentDayHours + hoursToAdd <= maxHoursPerDay * 1.5) { // Allow slight overflow
            const availableSlots = getAvailableTimeSlots(date, preferences, courses);
            if (availableSlots.length > 0) {
              const slot = availableSlots[0];
              sessions.push({
                id: `${assignment.id}-overflow-${i}-${dateKey}`,
                assignmentId: assignment.id,
                assignmentTitle: assignment.title,
                course: assignment.course,
                date: date.toISOString(),
                startTime: slot.start.toISOString(),
                endTime: slot.end.toISOString(),
                duration: sessionDuration,
                priority: assignment.priority,
              });
              
              dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hoursToAdd;
              break;
            }
          }
        }
      }
    }
  });

  // Sort by date and time
  sessions.sort((a, b) => {
    const dateCompare = new Date(a.startTime) - new Date(b.startTime);
    return dateCompare !== 0 ? dateCompare : new Date(a.startTime) - new Date(b.startTime);
  });

  return sessions;
};

