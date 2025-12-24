/**
 * Canvas Import Utility
 * Handles importing calendar data from Canvas LMS
 * Supports ICS (iCalendar) format and CSV format
 */

export const parseICSFile = (fileContent) => {
  // Basic ICS parser - in production, use a library like ical.js
  const assignments = [];
  const coursesSet = new Set();
  const lines = fileContent.split('\n');
  let currentEvent = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (inEvent && currentEvent.summary && currentEvent.dtstart) {
        const courseName = extractCourseFromSummary(currentEvent.summary);
        coursesSet.add(courseName);
        assignments.push({
          title: currentEvent.summary,
          description: currentEvent.description || '',
          dueDate: parseICSDate(currentEvent.dtend || currentEvent.dtstart),
          course: courseName,
          priority: 'medium',
        });
      }
      inEvent = false;
      currentEvent = {};
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8).trim();
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12).trim();
      } else if (line.includes('DTSTART')) {
        // Handle both DTSTART: and DTSTART;VALUE=DATE: formats
        const datePart = line.split(':').pop().trim();
        currentEvent.dtstart = datePart;
      } else if (line.includes('DTEND')) {
        // Handle both DTEND: and DTEND;VALUE=DATE: formats
        const datePart = line.split(':').pop().trim();
        currentEvent.dtend = datePart;
      }
    }
  }

  const courses = Array.from(coursesSet).map(courseName => ({
    id: `canvas-${courseName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    name: courseName,
    code: courseName,
    createdAt: new Date().toISOString(),
  }));

  return { assignments, courses };
};

export const parseCSVFile = (fileContent) => {
  const assignments = [];
  const coursesSet = new Set();
  const lines = fileContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const assignment = {};
    
    headers.forEach((header, index) => {
      assignment[header.toLowerCase()] = values[index] || '';
    });

    if (assignment.title || assignment.summary || assignment.name) {
      const courseName = assignment.course || assignment.class || extractCourseFromSummary(assignment.title || assignment.summary || assignment.name);
      if (courseName && courseName !== 'Unknown Course') {
        coursesSet.add(courseName);
      }
      assignments.push({
        title: assignment.title || assignment.summary || assignment.name,
        description: assignment.description || '',
        dueDate: parseDate(assignment.duedate || assignment.due_date || assignment.date),
        course: courseName,
        priority: 'medium',
      });
    }
  }

  const courses = Array.from(coursesSet).map(courseName => ({
    id: `canvas-${courseName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    name: courseName,
    code: courseName,
    createdAt: new Date().toISOString(),
  }));

  return { assignments, courses };
};

const parseICSDate = (dateString) => {
  // ICS dates are in format: YYYYMMDDTHHMMSS or YYYYMMDD
  if (dateString.length >= 8) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toISOString();
  }
  return new Date().toISOString();
};

const parseDate = (dateString) => {
  if (!dateString) return new Date().toISOString();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const extractCourseFromSummary = (summary) => {
  // Try to extract course name from assignment title
  // Common patterns: "CS 101: Assignment 1" or "[MATH 201] Homework"
  const match = summary.match(/([A-Z]{2,4}\s?\d{3,4})/);
  return match ? match[1] : 'Unknown Course';
};

export const importCanvasCalendar = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let result = { assignments: [], courses: [] };
        
        if (file.name.endsWith('.ics')) {
          result = parseICSFile(content);
        } else if (file.name.endsWith('.csv')) {
          result = parseCSVFile(content);
        } else {
          reject(new Error('Unsupported file format. Please use .ics or .csv files.'));
          return;
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

