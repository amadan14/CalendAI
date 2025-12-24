import { format, parseISO } from 'date-fns';

/**
 * Generate ICS (iCalendar) file content from calendar data
 * 
 * @param {Object} data - Calendar data
 * @param {Array} data.assignments - Array of assignments
 * @param {Array} data.courses - Array of courses
 * @param {Array} data.studySessions - Array of study sessions
 * @param {String} data.calendarName - Name of the calendar (optional)
 * @returns {String} ICS file content
 */
export const generateICS = (data) => {
  const { assignments, courses, studySessions, calendarName = 'Personal Calendar' } = data;
  const now = new Date();
  const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
  
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Personal Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    `X-WR-CALDESC:Exported from Personal Calendar`,
    `X-WR-TIMEZONE:${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  ];

  // Add assignments as events
  assignments.forEach((assignment, index) => {
    try {
      const dueDate = parseISO(assignment.dueDate);
      if (isNaN(dueDate.getTime())) return;

      // Format date for ICS (YYYYMMDDTHHMMSS)
      const dtStart = format(dueDate, "yyyyMMdd'T'HHmmss");
      const dtEnd = format(new Date(dueDate.getTime() + 60 * 60 * 1000), "yyyyMMdd'T'HHmmss"); // 1 hour duration
      const dtStamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
      const uid = `assignment-${assignment.id || index}-${Date.now()}@personal-calendar`;

      const summary = assignment.title || 'Assignment';
      const description = [
        `Course: ${assignment.course || 'Unknown'}`,
        `Priority: ${assignment.priority || 'medium'}`,
        assignment.description ? `Description: ${assignment.description}` : '',
      ].filter(Boolean).join('\\n');

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${escapeICS(summary)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        `LOCATION:${escapeICS(assignment.course || '')}`,
        `PRIORITY:${getPriorityNumber(assignment.priority)}`,
        `STATUS:CONFIRMED`,
        `CATEGORIES:Assignment`,
        'END:VEVENT'
      );
    } catch (e) {
      console.warn('Error adding assignment to ICS:', assignment, e);
    }
  });

  // Add courses as recurring events
  courses.forEach((course, index) => {
    try {
      if (!course.days || course.days.length === 0) return;
      if (!course.startTime || !course.endTime) return;

      const startTime = parseISO(course.startTime);
      const endTime = parseISO(course.endTime);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return;

      const dtStamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
      const uid = `course-${course.id || index}-${Date.now()}@personal-calendar`;

      // Format time for ICS
      const timeStart = format(startTime, "HHmmss");
      const timeEnd = format(endTime, "HHmmss");

      // Create RRULE for recurring days
      const dayMap = {
        'sunday': 'SU',
        'monday': 'MO',
        'tuesday': 'TU',
        'wednesday': 'WE',
        'thursday': 'TH',
        'friday': 'FR',
        'saturday': 'SA'
      };

      const byDay = course.days
        .map(day => dayMap[day.toLowerCase()])
        .filter(Boolean)
        .join(',');

      if (!byDay) return;

      // Use next occurrence of the first day as DTSTART
      const firstDay = course.days[0].toLowerCase();
      const dayIndex = Object.keys(dayMap).indexOf(firstDay);
      const today = new Date();
      const daysUntil = (dayIndex - today.getDay() + 7) % 7 || 7;
      const nextOccurrence = new Date(today);
      nextOccurrence.setDate(today.getDate() + daysUntil);
      nextOccurrence.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const dtStart = format(nextOccurrence, "yyyyMMdd") + 'T' + timeStart;
      const dtEnd = format(nextOccurrence, "yyyyMMdd") + 'T' + timeEnd;

      const summary = course.name || course.code || 'Course';
      const description = [
        course.code ? `Code: ${course.code}` : '',
        course.instructor ? `Instructor: ${course.instructor}` : '',
        course.location ? `Location: ${course.location}` : '',
        course.credits ? `Credits: ${course.credits}` : '',
      ].filter(Boolean).join('\\n');

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
        `SUMMARY:${escapeICS(summary)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        `LOCATION:${escapeICS(course.location || '')}`,
        `STATUS:CONFIRMED`,
        `CATEGORIES:Course`,
        'END:VEVENT'
      );
    } catch (e) {
      console.warn('Error adding course to ICS:', course, e);
    }
  });

  // Add study sessions as events
  studySessions.forEach((session, index) => {
    try {
      if (!session.startTime) return;

      const startTime = parseISO(session.startTime);
      if (isNaN(startTime.getTime())) return;

      const endTime = session.endTime 
        ? parseISO(session.endTime)
        : new Date(startTime.getTime() + (session.duration || 120) * 60 * 1000);

      if (isNaN(endTime.getTime())) return;

      const dtStart = format(startTime, "yyyyMMdd'T'HHmmss");
      const dtEnd = format(endTime, "yyyyMMdd'T'HHmmss");
      const dtStamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
      const uid = `study-${session.id || index}-${Date.now()}@personal-calendar`;

      const summary = session.assignmentTitle || 'Study Session';
      const description = [
        session.course ? `Course: ${session.course}` : '',
        session.topic ? `Topic: ${session.topic}` : '',
        session.duration ? `Duration: ${session.duration} minutes` : '',
      ].filter(Boolean).join('\\n');

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${escapeICS(summary)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        `STATUS:CONFIRMED`,
        `CATEGORIES:Study Session`,
        'END:VEVENT'
      );
    } catch (e) {
      console.warn('Error adding study session to ICS:', session, e);
    }
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

/**
 * Escape special characters for ICS format
 */
const escapeICS = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

/**
 * Convert priority string to ICS priority number
 * ICS priority: 1 (highest) to 9 (lowest), 0 = undefined
 */
const getPriorityNumber = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return '1';
    case 'medium':
      return '5';
    case 'low':
      return '9';
    default:
      return '5';
  }
};

/**
 * Download ICS file
 */
export const downloadICS = (icsContent, filename = 'calendar.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

