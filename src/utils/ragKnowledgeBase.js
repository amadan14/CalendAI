/**
 * RAG Knowledge Base for Calendar Assistant
 * Contains example requests and responses to help the LLM understand calendar tasks
 */

/**
 * RAG Knowledge Base - Training Examples for Calendar Assistant
 * 
 * These examples help the LLM understand:
 * - How to parse calendar requests
 * - What actions are available
 * - How to format responses
 * - Common patterns and variations
 */

export const calendarExamples = [
  {
    request: "Add a math homework due next Friday",
    response: {
      type: "add_assignment",
      data: {
        title: "Math Homework",
        course: "MATH 201",
        dueDate: "2024-12-27T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add assignment 'Math Homework'",
      requiresConfirmation: true
    },
    explanation: "User wants to add a homework assignment. Extract course from context or request, parse 'next Friday' as date."
  },
  {
    request: "Create a physics lab report due December 25th",
    response: {
      type: "add_assignment",
      data: {
        title: "Physics Lab Report",
        course: "PHYS 150",
        dueDate: "2024-12-25T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add assignment 'Physics Lab Report'",
      requiresConfirmation: true
    },
    explanation: "User wants to create a lab report. Parse specific date 'December 25th'."
  },
  {
    request: "Add CS 101 programming project due tomorrow high priority",
    response: {
      type: "add_assignment",
      data: {
        title: "Programming Project",
        course: "CS 101",
        dueDate: "2024-12-21T23:59:59.999Z",
        priority: "high",
        description: ""
      },
      description: "add assignment 'Programming Project'",
      requiresConfirmation: true
    },
    explanation: "User specifies course code, assignment type, relative date, and priority level."
  },
  {
    request: "Show me all assignments due this week",
    response: {
      type: "query",
      data: {
        description: "You have 3 assignment(s) due this week",
        details: "• Math Homework (MATH 201) - Dec 20\n• Physics Lab (PHYS 150) - Dec 22\n• CS Project (CS 101) - Dec 23"
      },
      description: "list assignments due this week",
      requiresConfirmation: false
    },
    explanation: "User wants to query/view assignments. Return list of assignments in the specified time period."
  },
  {
    request: "Move my CS 101 study session to tomorrow at 2pm",
    response: {
      type: "update_study_session",
      data: {
        id: "session-id-123",
        updates: {
          startTime: "2024-12-21T14:00:00.000Z",
          endTime: "2024-12-21T16:00:00.000Z",
          date: "2024-12-21"
        }
      },
      description: "reschedule study session",
      requiresConfirmation: true
    },
    explanation: "User wants to reschedule a study session. Find session by course/assignment, parse new date and time."
  },
  {
    request: "Update the physics assignment due date to January 5th",
    response: {
      type: "update_assignment",
      data: {
        id: "assignment-id-456",
        title: "Physics Lab Report",
        updates: {
          dueDate: "2025-01-05T23:59:59.999Z"
        }
      },
      description: "update assignment 'Physics Lab Report'",
      requiresConfirmation: true
    },
    explanation: "User wants to update an existing assignment. Find by course/title, update the due date."
  },
  {
    request: "Delete the math homework assignment",
    response: {
      type: "delete_assignment",
      data: {
        id: "assignment-id-789"
      },
      description: "delete assignment 'Math Homework'",
      requiresConfirmation: true
    },
    explanation: "User wants to delete an assignment. Find by title/course and delete."
  },
  {
    request: "What study sessions do I have scheduled?",
    response: {
      type: "query",
      data: {
        description: "You have 5 study session(s) scheduled",
        details: "• CS 101 Project - Dec 21, 2:00 PM\n• Math Homework - Dec 22, 10:00 AM\n• Physics Lab - Dec 23, 3:00 PM"
      },
      description: "list study sessions",
      requiresConfirmation: false
    },
    explanation: "User wants to query study sessions. Return list of all scheduled sessions with times."
  },
  {
    request: "Add course ENG 101 with instructor Smith",
    response: {
      type: "add_course",
      data: {
        name: "ENG 101",
        code: "ENG 101",
        instructor: "Smith",
        credits: "",
        days: [],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        location: ""
      },
      description: "add course 'ENG 101'",
      requiresConfirmation: true
    },
    explanation: "User wants to add a new course. Extract course code, name, and any additional details like instructor."
  },
  {
    request: "Change the CS project to high priority",
    response: {
      type: "update_assignment",
      data: {
        id: "assignment-id-123",
        title: "CS Project",
        updates: {
          priority: "high"
        }
      },
      description: "update assignment 'CS Project'",
      requiresConfirmation: true
    },
    explanation: "User wants to update assignment priority. Find assignment and update priority field."
  },
  {
    request: "Reschedule my study session for tomorrow afternoon",
    response: {
      type: "update_study_session",
      data: {
        id: "session-id-456",
        updates: {
          startTime: "2024-12-21T14:00:00.000Z",
          endTime: "2024-12-21T16:00:00.000Z",
          date: "2024-12-21"
        }
      },
      description: "reschedule study session",
      requiresConfirmation: true
    },
    explanation: "User wants to reschedule. Parse relative date and time description, update session."
  },
  {
    request: "List all my assignments",
    response: {
      type: "query",
      data: {
        description: "You have 8 assignment(s) total",
        details: "Upcoming:\n• Math Homework (MATH 201) - Dec 20\n• CS Project (CS 101) - Dec 22\n\nPast:\n• Physics Lab (PHYS 150) - Dec 15"
      },
      description: "list all assignments",
      requiresConfirmation: false
    },
    explanation: "User wants to see all assignments. Return comprehensive list, can group by status."
  },
  {
    request: "I need to add a chemistry midterm on January 15th",
    response: {
      type: "add_assignment",
      data: {
        title: "Chemistry Midterm",
        course: "CHEM 101",
        dueDate: "2025-01-15T23:59:59.999Z",
        priority: "high",
        description: ""
      },
      description: "add assignment 'Chemistry Midterm'",
      requiresConfirmation: true
    },
    explanation: "User wants to add an exam. Parse specific date and extract course from context or request."
  },
  {
    request: "When is my next assignment due?",
    response: {
      type: "query",
      data: {
        description: "Your next assignment is due on December 20, 2024",
        details: "Math Homework (MATH 201) - Due: December 20, 2024"
      },
      description: "find next assignment",
      requiresConfirmation: false
    },
    explanation: "User wants to query the next assignment. Find the earliest upcoming assignment and return details."
  },
  {
    request: "Cancel my study session for tomorrow",
    response: {
      type: "delete_study_session",
      data: {
        id: "session-id-123"
      },
      description: "delete study session",
      requiresConfirmation: true
    },
    explanation: "User wants to delete/cancel a study session. Find session by date and delete it."
  },
  // Study Time Estimation Examples
  {
    request: "Approximate how much time it will take me to study for my organic chemistry exam, and factor that in",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Organic Chemistry Exam",
        course: "CHEM 301",
        estimatedHours: 12,
        studySessions: [
          { date: "2024-12-22", startTime: "2024-12-22T10:00:00.000Z", endTime: "2024-12-22T12:00:00.000Z", duration: 120 },
          { date: "2024-12-23", startTime: "2024-12-23T14:00:00.000Z", endTime: "2024-12-23T17:00:00.000Z", duration: 180 },
          { date: "2024-12-24", startTime: "2024-12-24T09:00:00.000Z", endTime: "2024-12-24T12:00:00.000Z", duration: 180 }
        ]
      },
      description: "estimate study time for Organic Chemistry Exam and create study sessions",
      requiresConfirmation: true
    },
    explanation: "User wants time estimation for an exam. Estimate hours needed (typically 10-15 hours for exams), then create multiple study sessions spread over available days before the exam."
  },
  {
    request: "How long will it take to study for the physics final? Schedule that time",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Physics Final",
        course: "PHYS 201",
        estimatedHours: 15,
        studySessions: [
          { date: "2024-12-20", startTime: "2024-12-20T13:00:00.000Z", endTime: "2024-12-20T16:00:00.000Z", duration: 180 },
          { date: "2024-12-21", startTime: "2024-12-21T10:00:00.000Z", endTime: "2024-12-21T13:00:00.000Z", duration: 180 },
          { date: "2024-12-22", startTime: "2024-12-22T14:00:00.000Z", endTime: "2024-12-22T17:00:00.000Z", duration: 180 }
        ]
      },
      description: "estimate and schedule study time for Physics Final",
      requiresConfirmation: true
    },
    explanation: "User wants time estimation and scheduling. Estimate hours (15 for finals), create study sessions with specific times."
  },
  // Workout Plan Examples
  {
    request: "Make me a workout plan for this week where I workout three times, fit it in my schedule",
    response: {
      type: "add_workout_plan",
      data: {
        week: "2024-12-16",
        numberOfWorkouts: 3,
        workouts: [
          { date: "2024-12-18", startTime: "2024-12-18T07:00:00.000Z", endTime: "2024-12-18T08:30:00.000Z", type: "workout", title: "Workout Session 1" },
          { date: "2024-12-20", startTime: "2024-12-20T18:00:00.000Z", endTime: "2024-12-20T19:30:00.000Z", type: "workout", title: "Workout Session 2" },
          { date: "2024-12-22", startTime: "2024-12-22T07:00:00.000Z", endTime: "2024-12-22T08:30:00.000Z", type: "workout", title: "Workout Session 3" }
        ]
      },
      description: "create workout plan with 3 sessions this week",
      requiresConfirmation: true
    },
    explanation: "User wants a workout plan. Create multiple workout events (typically 60-90 minutes) spread throughout the week, avoiding course times and assignments."
  },
  {
    request: "I want to exercise 4 times this week, schedule it around my classes",
    response: {
      type: "add_workout_plan",
      data: {
        week: "2024-12-16",
        numberOfWorkouts: 4,
        workouts: [
          { date: "2024-12-17", startTime: "2024-12-17T06:30:00.000Z", endTime: "2024-12-17T08:00:00.000Z", type: "workout", title: "Morning Workout" },
          { date: "2024-12-19", startTime: "2024-12-19T17:00:00.000Z", endTime: "2024-12-19T18:30:00.000Z", type: "workout", title: "Evening Workout" },
          { date: "2024-12-21", startTime: "2024-12-21T07:00:00.000Z", endTime: "2024-12-21T08:30:00.000Z", type: "workout", title: "Morning Workout" },
          { date: "2024-12-22", startTime: "2024-12-22T16:00:00.000Z", endTime: "2024-12-22T17:30:00.000Z", type: "workout", title: "Afternoon Workout" }
        ]
      },
      description: "create workout plan with 4 sessions this week",
      requiresConfirmation: true
    },
    explanation: "User wants 4 workouts scheduled around classes. Space them out, avoid class times, use morning/evening slots."
  },
  // Cancelled Session Examples
  {
    request: "My math review session got cancelled",
    response: {
      type: "add_event",
      data: {
        title: "Math Review Session - CANCELLED",
        type: "cancelled",
        date: "2024-12-20",
        originalTime: "2024-12-20T14:00:00.000Z",
        description: "Review session was cancelled"
      },
      description: "mark math review session as cancelled",
      requiresConfirmation: true
    },
    explanation: "User reports a cancelled session. Create an event marking it as cancelled, or delete the corresponding study session if it exists."
  },
  {
    request: "The CS lab got cancelled for tomorrow",
    response: {
      type: "add_event",
      data: {
        title: "CS Lab - CANCELLED",
        type: "cancelled",
        date: "2024-12-21",
        originalTime: "2024-12-21T10:00:00.000Z",
        description: "Lab session was cancelled"
      },
      description: "mark CS lab as cancelled",
      requiresConfirmation: true
    },
    explanation: "User reports cancelled lab. Create event or remove from schedule."
  },
  // More Assignment Variations
  {
    request: "I have a paper due next Monday for English class",
    response: {
      type: "add_assignment",
      data: {
        title: "English Paper",
        course: "ENG 101",
        dueDate: "2024-12-23T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add assignment 'English Paper'",
      requiresConfirmation: true
    },
    explanation: "User mentions a paper. Extract course from 'English class', parse 'next Monday' as date."
  },
  {
    request: "Add a group project for biology that's due in two weeks",
    response: {
      type: "add_assignment",
      data: {
        title: "Biology Group Project",
        course: "BIO 101",
        dueDate: "2025-01-04T23:59:59.999Z",
        priority: "medium",
        description: "Group project"
      },
      description: "add assignment 'Biology Group Project'",
      requiresConfirmation: true
    },
    explanation: "User wants to add a group project. Parse 'in two weeks' as 14 days from today."
  },
  {
    request: "I need to remember to study for my calculus quiz on Friday",
    response: {
      type: "add_assignment",
      data: {
        title: "Calculus Quiz",
        course: "MATH 251",
        dueDate: "2024-12-27T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add assignment 'Calculus Quiz'",
      requiresConfirmation: true
    },
    explanation: "User mentions a quiz. Extract course and date, create assignment."
  },
  {
    request: "Remind me about the history essay due December 30th",
    response: {
      type: "add_assignment",
      data: {
        title: "History Essay",
        course: "HIST 101",
        dueDate: "2024-12-30T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add assignment 'History Essay'",
      requiresConfirmation: true
    },
    explanation: "User wants a reminder. Create assignment with the specified date."
  },
  // Study Plan Generation
  {
    request: "Create a study plan for my chemistry exam next week",
    response: {
      type: "generate_study_plan",
      data: {
        assignmentTitle: "Chemistry Exam",
        course: "CHEM 101",
        examDate: "2024-12-27T23:59:59.999Z",
        studySessions: [
          { date: "2024-12-23", startTime: "2024-12-23T10:00:00.000Z", endTime: "2024-12-23T12:00:00.000Z", topic: "Chapters 1-3" },
          { date: "2024-12-24", startTime: "2024-12-24T14:00:00.000Z", endTime: "2024-12-24T16:00:00.000Z", topic: "Chapters 4-6" },
          { date: "2024-12-26", startTime: "2024-12-26T09:00:00.000Z", endTime: "2024-12-26T11:00:00.000Z", topic: "Review all chapters" }
        ]
      },
      description: "generate study plan for Chemistry Exam",
      requiresConfirmation: true
    },
    explanation: "User wants a study plan. Create multiple study sessions spread before the exam date with specific topics."
  },
  {
    request: "Plan out my study schedule for finals week",
    response: {
      type: "generate_study_plan",
      data: {
        period: "finals week",
        studySessions: [
          { date: "2024-12-16", startTime: "2024-12-16T09:00:00.000Z", endTime: "2024-12-16T12:00:00.000Z", topic: "Final 1 Review" },
          { date: "2024-12-17", startTime: "2024-12-17T14:00:00.000Z", endTime: "2024-12-17T17:00:00.000Z", topic: "Final 2 Review" },
          { date: "2024-12-18", startTime: "2024-12-18T10:00:00.000Z", endTime: "2024-12-18T13:00:00.000Z", topic: "Final 3 Review" }
        ]
      },
      description: "generate study plan for finals week",
      requiresConfirmation: true
    },
    explanation: "User wants a comprehensive study plan. Create multiple study sessions for finals week."
  },
  // Time Block Examples
  {
    request: "Block out 2 hours every morning this week for studying",
    response: {
      type: "add_time_blocks",
      data: {
        pattern: "daily",
        startDate: "2024-12-16",
        endDate: "2024-12-22",
        startTime: "08:00",
        endTime: "10:00",
        title: "Morning Study Block",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
      },
      description: "create daily morning study blocks",
      requiresConfirmation: true
    },
    explanation: "User wants recurring time blocks. Create daily blocks at specified time for the week."
  },
  {
    request: "Reserve my afternoons from 2-4pm for homework this month",
    response: {
      type: "add_time_blocks",
      data: {
        pattern: "daily",
        startDate: "2024-12-16",
        endDate: "2025-01-16",
        startTime: "14:00",
        endTime: "16:00",
        title: "Afternoon Homework Block",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
      },
      description: "create daily afternoon homework blocks",
      requiresConfirmation: true
    },
    explanation: "User wants recurring blocks. Create daily blocks for the specified month."
  },
  // Complex Multi-Step Requests
  {
    request: "I have a big project due Friday, estimate how much time I need and schedule study sessions",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Big Project",
        course: "Unknown Course",
        estimatedHours: 10,
        studySessions: [
          { date: "2024-12-18", startTime: "2024-12-18T10:00:00.000Z", endTime: "2024-12-18T13:00:00.000Z", duration: 180 },
          { date: "2024-12-19", startTime: "2024-12-19T14:00:00.000Z", endTime: "2024-12-19T17:00:00.000Z", duration: 180 },
          { date: "2024-12-20", startTime: "2024-12-20T09:00:00.000Z", endTime: "2024-12-20T12:00:00.000Z", duration: 180 }
        ]
      },
      description: "estimate time and schedule study sessions for big project",
      requiresConfirmation: true
    },
    explanation: "User wants both estimation and scheduling. Estimate hours (10 for big projects), create multiple sessions before Friday."
  },
  {
    request: "My professor moved the exam to next Thursday instead of Friday",
    response: {
      type: "update_assignment",
      data: {
        id: "assignment-id-exam",
        title: "Exam",
        updates: {
          dueDate: "2024-12-26T23:59:59.999Z"
        }
      },
      description: "update exam due date to next Thursday",
      requiresConfirmation: true
    },
    explanation: "User reports date change. Find the exam assignment and update its due date."
  },
  // More Query Variations
  {
    request: "What do I have coming up this weekend?",
    response: {
      type: "query",
      data: {
        description: "Here's what you have this weekend:",
        details: "Saturday: Workout Session\nSunday: Study Session for Chemistry Exam"
      },
      description: "list weekend events",
      requiresConfirmation: false
    },
    explanation: "User wants weekend schedule. Query events/assignments for Saturday and Sunday."
  },
  {
    request: "How busy am I next week?",
    response: {
      type: "query",
      data: {
        description: "Next week you have:",
        details: "3 assignments due\n5 study sessions scheduled\n2 workouts planned"
      },
      description: "summarize next week schedule",
      requiresConfirmation: false
    },
    explanation: "User wants a summary. Count assignments, study sessions, and other events for next week."
  },
  {
    request: "Do I have any free time tomorrow afternoon?",
    response: {
      type: "query",
      data: {
        description: "Tomorrow afternoon you have:",
        details: "Free from 2:00 PM - 4:00 PM\nBusy: 10:00 AM - 12:00 PM (Class), 4:00 PM - 6:00 PM (Study Session)"
      },
      description: "check free time tomorrow afternoon",
      requiresConfirmation: false
    },
    explanation: "User wants to know free time. Check schedule for tomorrow afternoon, identify gaps."
  },
  // Priority and Urgency Examples
  {
    request: "I have an urgent essay due tomorrow, add it",
    response: {
      type: "add_assignment",
      data: {
        title: "Essay",
        course: "Unknown Course",
        dueDate: "2024-12-21T23:59:59.999Z",
        priority: "high",
        description: "Urgent"
      },
      description: "add urgent essay due tomorrow",
      requiresConfirmation: true
    },
    explanation: "User mentions urgent. Set priority to high, parse 'tomorrow' as date."
  },
  {
    request: "Mark my calculus final as high priority",
    response: {
      type: "update_assignment",
      data: {
        id: "assignment-id-calc-final",
        title: "Calculus Final",
        updates: {
          priority: "high"
        }
      },
      description: "update calculus final priority to high",
      requiresConfirmation: true
    },
    explanation: "User wants to change priority. Find assignment and update priority field."
  },
  // Social/Personal Events
  {
    request: "I have a study group meeting Wednesday at 3pm",
    response: {
      type: "add_event",
      data: {
        title: "Study Group Meeting",
        type: "study_group",
        date: "2024-12-25",
        startTime: "2024-12-25T15:00:00.000Z",
        endTime: "2024-12-25T16:30:00.000Z",
        description: ""
      },
      description: "add study group meeting",
      requiresConfirmation: true
    },
    explanation: "User mentions a study group. Create event with date and time."
  },
  {
    request: "Add a reminder for my doctor's appointment next Monday at 10am",
    response: {
      type: "add_event",
      data: {
        title: "Doctor's Appointment",
        type: "appointment",
        date: "2024-12-23",
        startTime: "2024-12-23T10:00:00.000Z",
        endTime: "2024-12-23T11:00:00.000Z",
        description: ""
      },
      description: "add doctor's appointment",
      requiresConfirmation: true
    },
    explanation: "User wants a reminder. Create event/appointment with specific date and time."
  },
  // Exam/Test Specific
  {
    request: "I have a midterm in two weeks for statistics",
    response: {
      type: "add_assignment",
      data: {
        title: "Statistics Midterm",
        course: "STAT 201",
        dueDate: "2025-01-04T23:59:59.999Z",
        priority: "high",
        description: ""
      },
      description: "add Statistics Midterm",
      requiresConfirmation: true
    },
    explanation: "User mentions midterm. Extract course, parse 'in two weeks' as 14 days from today, set high priority."
  },
  {
    request: "Add my biology test for next Tuesday",
    response: {
      type: "add_assignment",
      data: {
        title: "Biology Test",
        course: "BIO 101",
        dueDate: "2024-12-24T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add Biology Test",
      requiresConfirmation: true
    },
    explanation: "User mentions test. Extract course, parse 'next Tuesday' as date."
  },
  // Lab/Project Work
  {
    request: "I need to finish my computer science lab by Friday",
    response: {
      type: "add_assignment",
      data: {
        title: "Computer Science Lab",
        course: "CS 101",
        dueDate: "2024-12-27T23:59:59.999Z",
        priority: "medium",
        description: "Lab work"
      },
      description: "add Computer Science Lab",
      requiresConfirmation: true
    },
    explanation: "User mentions lab. Extract course, parse 'by Friday' as due date."
  },
  {
    request: "My engineering project presentation is on December 28th",
    response: {
      type: "add_assignment",
      data: {
        title: "Engineering Project Presentation",
        course: "ENG 201",
        dueDate: "2024-12-28T23:59:59.999Z",
        priority: "high",
        description: "Presentation"
      },
      description: "add Engineering Project Presentation",
      requiresConfirmation: true
    },
    explanation: "User mentions presentation. Extract course, parse specific date."
  },
  // Study Session Variations
  {
    request: "I want to study for 3 hours tomorrow for my chemistry exam",
    response: {
      type: "add_study_session",
      data: {
        assignmentTitle: "Chemistry Exam",
        course: "CHEM 101",
        date: "2024-12-21",
        startTime: "2024-12-21T10:00:00.000Z",
        endTime: "2024-12-21T13:00:00.000Z",
        duration: 180
      },
      description: "add 3-hour study session for Chemistry Exam",
      requiresConfirmation: true
    },
    explanation: "User wants a specific study session. Create session with 3-hour duration for tomorrow."
  },
  {
    request: "Schedule a 2-hour review session for my math final on Wednesday",
    response: {
      type: "add_study_session",
      data: {
        assignmentTitle: "Math Final",
        course: "MATH 201",
        date: "2024-12-25",
        startTime: "2024-12-25T14:00:00.000Z",
        endTime: "2024-12-25T16:00:00.000Z",
        duration: 120
      },
      description: "add 2-hour study session for Math Final",
      requiresConfirmation: true
    },
    explanation: "User wants a review session. Create 2-hour session on Wednesday."
  },
  // Course Schedule
  {
    request: "I have organic chemistry class Monday, Wednesday, Friday from 9-10:30am",
    response: {
      type: "add_course",
      data: {
        name: "Organic Chemistry",
        code: "CHEM 301",
        days: ["monday", "wednesday", "friday"],
        startTime: "2024-12-16T09:00:00.000Z",
        endTime: "2024-12-16T10:30:00.000Z",
        location: ""
      },
      description: "add Organic Chemistry course",
      requiresConfirmation: true
    },
    explanation: "User describes a course schedule. Extract course name, days, and times."
  },
  {
    request: "Add my physics lecture that meets Tuesdays and Thursdays at 11am",
    response: {
      type: "add_course",
      data: {
        name: "Physics",
        code: "PHYS 201",
        days: ["tuesday", "thursday"],
        startTime: "2024-12-17T11:00:00.000Z",
        endTime: "2024-12-17T12:30:00.000Z",
        location: ""
      },
      description: "add Physics course",
      requiresConfirmation: true
    },
    explanation: "User describes course schedule. Extract days and time."
  },
  // Flexible Scheduling
  {
    request: "Find me a good time to study this week, I'm free after 6pm",
    response: {
      type: "add_study_session",
      data: {
        assignmentTitle: "Study Session",
        course: "Unknown Course",
        date: "2024-12-18",
        startTime: "2024-12-18T18:00:00.000Z",
        endTime: "2024-12-18T20:00:00.000Z",
        duration: 120
      },
      description: "schedule study session after 6pm",
      requiresConfirmation: true
    },
    explanation: "User wants flexible scheduling. Find available time after 6pm this week, create study session."
  },
  {
    request: "I need to block time for my research paper, when can I fit it in?",
    response: {
      type: "query",
      data: {
        description: "Here are available time slots this week:",
        details: "Monday: 2:00 PM - 4:00 PM\nWednesday: 10:00 AM - 12:00 PM\nFriday: 1:00 PM - 3:00 PM"
      },
      description: "find available time for research paper",
      requiresConfirmation: false
    },
    explanation: "User wants to find time. Query schedule for available blocks, suggest times."
  },
  // Multiple Items
  {
    request: "I have three assignments due next week: math homework, physics lab, and chemistry quiz",
    response: {
      type: "add_assignment",
      data: {
        title: "Math Homework",
        course: "MATH 201",
        dueDate: "2024-12-23T23:59:59.999Z",
        priority: "medium",
        description: ""
      },
      description: "add multiple assignments",
      requiresConfirmation: true
    },
    explanation: "User lists multiple assignments. Create separate assignment actions for each (this example shows one, but should create three)."
  },
  // Reminder/Notification Style
  {
    request: "Don't let me forget about my presentation next Friday",
    response: {
      type: "add_assignment",
      data: {
        title: "Presentation",
        course: "Unknown Course",
        dueDate: "2024-12-27T23:59:59.999Z",
        priority: "high",
        description: ""
      },
      description: "add presentation reminder",
      requiresConfirmation: true
    },
    explanation: "User wants a reminder. Create assignment with high priority for visibility."
  },
  // Time Management
  {
    request: "How much time do I have left to finish my project?",
    response: {
      type: "query",
      data: {
        description: "Time remaining for your project:",
        details: "Project due: December 27, 2024\nDays remaining: 6 days\nRecommended study time: 12-15 hours"
      },
      description: "calculate time remaining for project",
      requiresConfirmation: false
    },
    explanation: "User wants time calculation. Find project, calculate days/hours remaining, suggest study time."
  },
  {
    request: "What's my workload like for the next two weeks?",
    response: {
      type: "query",
      data: {
        description: "Your workload for the next two weeks:",
        details: "5 assignments due\n3 exams scheduled\nEstimated study time needed: 25 hours"
      },
      description: "summarize two-week workload",
      requiresConfirmation: false
    },
    explanation: "User wants workload summary. Count assignments/exams, estimate total time needed."
  },
  // More diverse examples - Daily Life Integration
  {
    request: "I have a job interview next Tuesday at 2pm, add it to my calendar",
    response: {
      type: "add_event",
      data: {
        title: "Job Interview",
        type: "interview",
        date: "2024-12-24",
        startTime: "2024-12-24T14:00:00.000Z",
        endTime: "2024-12-24T15:00:00.000Z",
        description: ""
      },
      description: "add job interview",
      requiresConfirmation: true
    },
    explanation: "User mentions interview. Create event with specific date and time."
  },
  {
    request: "Block out time for meal prep every Sunday afternoon",
    response: {
      type: "add_time_blocks",
      data: {
        pattern: "weekly",
        startDate: "2024-12-22",
        dayOfWeek: "sunday",
        startTime: "14:00",
        endTime: "16:00",
        title: "Meal Prep",
        recurring: true
      },
      description: "create weekly meal prep time block",
      requiresConfirmation: true
    },
    explanation: "User wants recurring time block. Create weekly block for Sunday afternoons."
  },
  {
    request: "I need to study for 20 hours total for my comprehensive exam, spread it over the next two weeks",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Comprehensive Exam",
        course: "Unknown Course",
        estimatedHours: 20,
        studySessions: [
          { date: "2024-12-18", startTime: "2024-12-18T10:00:00.000Z", endTime: "2024-12-18T13:00:00.000Z", duration: 180 },
          { date: "2024-12-20", startTime: "2024-12-20T14:00:00.000Z", endTime: "2024-12-20T17:00:00.000Z", duration: 180 },
          { date: "2024-12-22", startTime: "2024-12-22T09:00:00.000Z", endTime: "2024-12-22T12:00:00.000Z", duration: 180 },
          { date: "2024-12-23", startTime: "2024-12-23T14:00:00.000Z", endTime: "2024-12-23T17:00:00.000Z", duration: 180 },
          { date: "2024-12-25", startTime: "2024-12-25T10:00:00.000Z", endTime: "2024-12-25T13:00:00.000Z", duration: 180 },
          { date: "2024-12-27", startTime: "2024-12-27T14:00:00.000Z", endTime: "2024-12-27T17:00:00.000Z", duration: 180 },
          { date: "2024-12-29", startTime: "2024-12-29T09:00:00.000Z", endTime: "2024-12-29T12:00:00.000Z", duration: 180 }
        ]
      },
      description: "estimate and schedule 20 hours of study time over two weeks",
      requiresConfirmation: true
    },
    explanation: "User wants specific hours spread over time. Create multiple study sessions totaling 20 hours over two weeks."
  },
  {
    request: "My roommate cancelled our study group, remove it from my schedule",
    response: {
      type: "delete_study_session",
      data: {
        id: "session-id-study-group"
      },
      description: "remove cancelled study group",
      requiresConfirmation: true
    },
    explanation: "User reports cancelled study group. Find and delete the corresponding study session or event."
  },
  {
    request: "I want to exercise 5 days a week, schedule workouts around my classes",
    response: {
      type: "add_workout_plan",
      data: {
        pattern: "weekly",
        numberOfWorkouts: 5,
        workouts: [
          { date: "2024-12-16", startTime: "2024-12-16T07:00:00.000Z", endTime: "2024-12-16T08:30:00.000Z", type: "workout", title: "Monday Workout" },
          { date: "2024-12-17", startTime: "2024-12-17T18:00:00.000Z", endTime: "2024-12-17T19:30:00.000Z", type: "workout", title: "Tuesday Workout" },
          { date: "2024-12-19", startTime: "2024-12-19T07:00:00.000Z", endTime: "2024-12-19T08:30:00.000Z", type: "workout", title: "Thursday Workout" },
          { date: "2024-12-20", startTime: "2024-12-20T18:00:00.000Z", endTime: "2024-12-20T19:30:00.000Z", type: "workout", title: "Friday Workout" },
          { date: "2024-12-21", startTime: "2024-12-21T10:00:00.000Z", endTime: "2024-12-21T11:30:00.000Z", type: "workout", title: "Saturday Workout" }
        ]
      },
      description: "create weekly workout plan with 5 sessions",
      requiresConfirmation: true
    },
    explanation: "User wants 5 workouts per week. Create recurring workout plan, space them out, avoid class times."
  },
  {
    request: "I need to prepare for my thesis defense in 3 weeks, create a study schedule",
    response: {
      type: "generate_study_plan",
      data: {
        assignmentTitle: "Thesis Defense",
        course: "Thesis",
        examDate: "2025-01-06T23:59:59.999Z",
        studySessions: [
          { date: "2024-12-23", startTime: "2024-12-23T10:00:00.000Z", endTime: "2024-12-23T13:00:00.000Z", topic: "Review thesis chapters 1-3" },
          { date: "2024-12-26", startTime: "2024-12-26T14:00:00.000Z", endTime: "2024-12-26T17:00:00.000Z", topic: "Review chapters 4-6" },
          { date: "2024-12-30", startTime: "2024-12-30T09:00:00.000Z", endTime: "2024-12-30T12:00:00.000Z", topic: "Practice presentation" },
          { date: "2025-01-02", startTime: "2025-01-02T10:00:00.000Z", endTime: "2025-01-02T13:00:00.000Z", topic: "Final review and Q&A prep" }
        ]
      },
      description: "create study plan for thesis defense",
      requiresConfirmation: true
    },
    explanation: "User wants study plan for major event. Create multiple sessions over 3 weeks with specific topics."
  },
  {
    request: "What's the best time for me to study this week given my schedule?",
    response: {
      type: "query",
      data: {
        description: "Best study times this week:",
        details: "Monday: 2:00 PM - 4:00 PM (free)\nWednesday: 10:00 AM - 12:00 PM (free)\nFriday: 1:00 PM - 3:00 PM (free)\nWeekend: All day Saturday available"
      },
      description: "find optimal study times",
      requiresConfirmation: false
    },
    explanation: "User wants optimal time suggestions. Analyze schedule, find free blocks, suggest best times."
  },
  {
    request: "I have a group project meeting every Thursday at 4pm for the next month",
    response: {
      type: "add_time_blocks",
      data: {
        pattern: "weekly",
        startDate: "2024-12-19",
        endDate: "2025-01-16",
        dayOfWeek: "thursday",
        startTime: "16:00",
        endTime: "17:30",
        title: "Group Project Meeting",
        recurring: true
      },
      description: "create recurring group project meetings",
      requiresConfirmation: true
    },
    explanation: "User wants recurring meetings. Create weekly time blocks for Thursdays over the next month."
  },
  {
    request: "Estimate how long I'll need to study for my organic chemistry final and block that time",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Organic Chemistry Final",
        course: "CHEM 301",
        estimatedHours: 15,
        studySessions: [
          { date: "2024-12-18", startTime: "2024-12-18T10:00:00.000Z", endTime: "2024-12-18T13:00:00.000Z", duration: 180 },
          { date: "2024-12-20", startTime: "2024-12-20T14:00:00.000Z", endTime: "2024-12-20T17:00:00.000Z", duration: 180 },
          { date: "2024-12-22", startTime: "2024-12-22T09:00:00.000Z", endTime: "2024-12-22T12:00:00.000Z", duration: 180 },
          { date: "2024-12-23", startTime: "2024-12-23T14:00:00.000Z", endTime: "2024-12-23T17:00:00.000Z", duration: 180 },
          { date: "2024-12-24", startTime: "2024-12-24T10:00:00.000Z", endTime: "2024-12-24T13:00:00.000Z", duration: 180 }
        ]
      },
      description: "estimate and block study time for Organic Chemistry Final",
      requiresConfirmation: true
    },
    explanation: "User wants both estimation and time blocking. Estimate 15 hours for final, create multiple study sessions."
  },
  {
    request: "I'm overwhelmed, help me prioritize what I need to do this week",
    response: {
      type: "query",
      data: {
        description: "Priority tasks for this week:",
        details: "HIGH PRIORITY:\n• Chemistry Exam (Dec 20) - Study 10 hours\n• Math Project (Dec 22) - Due soon\n\nMEDIUM PRIORITY:\n• Physics Lab Report (Dec 25)\n• English Essay (Dec 27)\n\nRecommendation: Focus on Chemistry Exam first, then Math Project."
      },
      description: "prioritize weekly tasks",
      requiresConfirmation: false
    },
    explanation: "User wants prioritization help. List assignments by priority and due date, provide recommendations."
  },
  {
    request: "Can I fit in a 2-hour workout tomorrow?",
    response: {
      type: "query",
      data: {
        description: "Available time slots tomorrow:",
        details: "Morning: 7:00 AM - 9:00 AM (free)\nAfternoon: 2:00 PM - 4:00 PM (free)\nEvening: 6:00 PM - 8:00 PM (free)\n\nYes! You can fit a 2-hour workout in any of these slots."
      },
      description: "check if workout fits tomorrow",
      requiresConfirmation: false
    },
    explanation: "User asks about availability. Check tomorrow's schedule, find 2-hour free blocks, confirm if workout fits."
  },
  {
    request: "My professor extended the deadline for the research paper to next Friday",
    response: {
      type: "update_assignment",
      data: {
        id: "assignment-id-research-paper",
        title: "Research Paper",
        updates: {
          dueDate: "2024-12-27T23:59:59.999Z"
        }
      },
      description: "update research paper deadline to next Friday",
      requiresConfirmation: true
    },
    explanation: "User reports deadline extension. Find assignment, update due date to next Friday."
  },
  {
    request: "I need to study 30 hours for my comprehensive exam, schedule it over 3 weeks",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Comprehensive Exam",
        course: "Unknown Course",
        estimatedHours: 30,
        studySessions: [
          { date: "2024-12-18", startTime: "2024-12-18T10:00:00.000Z", endTime: "2024-12-18T13:00:00.000Z", duration: 180 },
          { date: "2024-12-20", startTime: "2024-12-20T14:00:00.000Z", endTime: "2024-12-20T17:00:00.000Z", duration: 180 },
          { date: "2024-12-22", startTime: "2024-12-22T09:00:00.000Z", endTime: "2024-12-22T12:00:00.000Z", duration: 180 },
          { date: "2024-12-23", startTime: "2024-12-23T14:00:00.000Z", endTime: "2024-12-23T17:00:00.000Z", duration: 180 },
          { date: "2024-12-25", startTime: "2024-12-25T10:00:00.000Z", endTime: "2024-12-25T13:00:00.000Z", duration: 180 },
          { date: "2024-12-27", startTime: "2024-12-27T14:00:00.000Z", endTime: "2024-12-27T17:00:00.000Z", duration: 180 },
          { date: "2024-12-29", startTime: "2024-12-29T09:00:00.000Z", endTime: "2024-12-29T12:00:00.000Z", duration: 180 },
          { date: "2024-12-30", startTime: "2024-12-30T14:00:00.000Z", endTime: "2024-12-30T17:00:00.000Z", duration: 180 },
          { date: "2025-01-02", startTime: "2025-01-02T10:00:00.000Z", endTime: "2025-01-02T13:00:00.000Z", duration: 180 },
          { date: "2025-01-03", startTime: "2025-01-03T14:00:00.000Z", endTime: "2025-01-03T17:00:00.000Z", duration: 180 }
        ]
      },
      description: "estimate and schedule 30 hours of study over 3 weeks",
      requiresConfirmation: true
    },
    explanation: "User wants 30 hours over 3 weeks. Create multiple study sessions totaling 30 hours, spread evenly."
  },
  {
    request: "Add my tutoring session every Monday at 3pm",
    response: {
      type: "add_time_blocks",
      data: {
        pattern: "weekly",
        startDate: "2024-12-23",
        dayOfWeek: "monday",
        startTime: "15:00",
        endTime: "16:00",
        title: "Tutoring Session",
        recurring: true
      },
      description: "create recurring tutoring sessions",
      requiresConfirmation: true
    },
    explanation: "User wants recurring tutoring. Create weekly time block for Mondays at 3pm."
  },
  {
    request: "I have a conference presentation on January 10th at 10am",
    response: {
      type: "add_event",
      data: {
        title: "Conference Presentation",
        type: "presentation",
        date: "2025-01-10",
        startTime: "2025-01-10T10:00:00.000Z",
        endTime: "2025-01-10T11:00:00.000Z",
        description: ""
      },
      description: "add conference presentation",
      requiresConfirmation: true
    },
    explanation: "User mentions presentation. Create event with specific date and time."
  },
  {
    request: "Help me balance my study time and workout schedule this week",
    response: {
      type: "add_workout_plan",
      data: {
        week: "2024-12-16",
        numberOfWorkouts: 3,
        workouts: [
          { date: "2024-12-18", startTime: "2024-12-18T07:00:00.000Z", endTime: "2024-12-18T08:30:00.000Z", type: "workout", title: "Morning Workout" },
          { date: "2024-12-20", startTime: "2024-12-20T18:00:00.000Z", endTime: "2024-12-20T19:30:00.000Z", type: "workout", title: "Evening Workout" },
          { date: "2024-12-22", startTime: "2024-12-22T10:00:00.000Z", endTime: "2024-12-22T11:30:00.000Z", type: "workout", title: "Weekend Workout" }
        ]
      },
      description: "create balanced workout plan for the week",
      requiresConfirmation: true
    },
    explanation: "User wants balance. Create workout plan that doesn't conflict with study sessions, space them out."
  },
  {
    request: "I need 5 hours to study for my physics midterm, when should I schedule it?",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Physics Midterm",
        course: "PHYS 201",
        estimatedHours: 5,
        studySessions: [
          { date: "2024-12-19", startTime: "2024-12-19T14:00:00.000Z", endTime: "2024-12-19T17:00:00.000Z", duration: 180 },
          { date: "2024-12-20", startTime: "2024-12-20T10:00:00.000Z", endTime: "2024-12-20T12:00:00.000Z", duration: 120 }
        ]
      },
      description: "estimate and schedule 5 hours for Physics Midterm",
      requiresConfirmation: true
    },
    explanation: "User wants specific hours. Estimate 5 hours, create 2-3 study sessions before the midterm."
  },
  {
    request: "My study group moved our meeting to next Wednesday at 5pm",
    response: {
      type: "update_study_session",
      data: {
        id: "session-id-study-group",
        updates: {
          startTime: "2024-12-25T17:00:00.000Z",
          endTime: "2024-12-25T18:30:00.000Z",
          date: "2024-12-25"
        }
      },
      description: "reschedule study group to next Wednesday",
      requiresConfirmation: true
    },
    explanation: "User reports time change. Find study group session, update to new date and time."
  },
  // Completion tracking examples
  {
    request: "I just finished my math homework, it took me 2 hours",
    response: {
      type: "update_assignment",
      data: {
        title: "math homework",
        completed: true,
        actualTimeSpent: 120,
        completedAt: new Date().toISOString()
      },
      description: "mark math homework as completed",
      requiresConfirmation: false
    },
    explanation: "User reports completion with time. Mark assignment as completed and record actual time spent for adaptive learning."
  },
  {
    request: "Mark my physics lab report as done, I spent 3 hours on it",
    response: {
      type: "update_assignment",
      data: {
        title: "physics lab report",
        completed: true,
        actualTimeSpent: 180,
        completedAt: new Date().toISOString()
      },
      description: "mark physics lab report as completed",
      requiresConfirmation: false
    },
    explanation: "User wants to mark assignment complete with specific time. Update assignment status and record time for ML training."
  },
  {
    request: "I completed the CS project in 8 hours",
    response: {
      type: "update_assignment",
      data: {
        title: "CS project",
        completed: true,
        actualTimeSpent: 480,
        completedAt: new Date().toISOString()
      },
      description: "mark CS project as completed",
      requiresConfirmation: false
    },
    explanation: "User reports completion with time. Record completion and actual time for adaptive learning and future predictions."
  },
  {
    request: "Finished my essay, took me 4.5 hours",
    response: {
      type: "update_assignment",
      data: {
        title: "essay",
        completed: true,
        actualTimeSpent: 270,
        completedAt: new Date().toISOString()
      },
      description: "mark essay as completed",
      requiresConfirmation: false
    },
    explanation: "User reports completion. Parse time (4.5 hours = 270 minutes) and mark assignment complete with actual time data."
  },
  {
    request: "What assignments are due before my chemistry exam?",
    response: {
      type: "query",
      data: {
        description: "Assignments due before your Chemistry Exam:",
        details: "• Math Homework (Dec 20)\n• Physics Lab (Dec 22)\n• English Essay (Dec 23)\n\nChemistry Exam is on Dec 27, so you have 3 assignments due before it."
      },
      description: "list assignments before chemistry exam",
      requiresConfirmation: false
    },
    explanation: "User wants relative query. Find chemistry exam date, list all assignments due before that date."
  },
  {
    request: "I want to work out 6 times this week, can you fit it in?",
    response: {
      type: "add_workout_plan",
      data: {
        week: "2024-12-16",
        numberOfWorkouts: 6,
        workouts: [
          { date: "2024-12-16", startTime: "2024-12-16T07:00:00.000Z", endTime: "2024-12-16T08:30:00.000Z", type: "workout", title: "Monday Workout" },
          { date: "2024-12-17", startTime: "2024-12-17T18:00:00.000Z", endTime: "2024-12-17T19:30:00.000Z", type: "workout", title: "Tuesday Workout" },
          { date: "2024-12-19", startTime: "2024-12-19T07:00:00.000Z", endTime: "2024-12-19T08:30:00.000Z", type: "workout", title: "Thursday Workout" },
          { date: "2024-12-20", startTime: "2024-12-20T18:00:00.000Z", endTime: "2024-12-20T19:30:00.000Z", type: "workout", title: "Friday Workout" },
          { date: "2024-12-21", startTime: "2024-12-21T10:00:00.000Z", endTime: "2024-12-21T11:30:00.000Z", type: "workout", title: "Saturday Workout" },
          { date: "2024-12-22", startTime: "2024-12-22T14:00:00.000Z", endTime: "2024-12-22T15:30:00.000Z", type: "workout", title: "Sunday Workout" }
        ]
      },
      description: "create workout plan with 6 sessions this week",
      requiresConfirmation: true
    },
    explanation: "User wants 6 workouts. Create plan with workouts spread throughout week, avoid conflicts."
  },
  {
    request: "Create a study schedule for my finals that starts next week",
    response: {
      type: "generate_study_plan",
      data: {
        period: "finals week",
        startDate: "2024-12-23",
        studySessions: [
          { date: "2024-12-23", startTime: "2024-12-23T09:00:00.000Z", endTime: "2024-12-23T12:00:00.000Z", topic: "Final 1 Review" },
          { date: "2024-12-24", startTime: "2024-12-24T14:00:00.000Z", endTime: "2024-12-24T17:00:00.000Z", topic: "Final 2 Review" },
          { date: "2024-12-26", startTime: "2024-12-26T10:00:00.000Z", endTime: "2024-12-26T13:00:00.000Z", topic: "Final 3 Review" },
          { date: "2024-12-27", startTime: "2024-12-27T09:00:00.000Z", endTime: "2024-12-27T12:00:00.000Z", topic: "Final Review All" }
        ]
      },
      description: "create study schedule for finals starting next week",
      requiresConfirmation: true
    },
    explanation: "User wants finals study schedule. Create multiple study sessions starting next week."
  },
  {
    request: "I need to block 3 hours every day for the next week to finish my thesis",
    response: {
      type: "add_time_blocks",
      data: {
        pattern: "daily",
        startDate: "2024-12-16",
        endDate: "2024-12-22",
        startTime: "10:00",
        endTime: "13:00",
        title: "Thesis Work",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      },
      description: "create daily 3-hour thesis blocks for the week",
      requiresConfirmation: true
    },
    explanation: "User wants daily blocks. Create 3-hour blocks every day for the week."
  },
  // Study Guide Generation Examples
  {
    request: "Create a study guide for my organic chemistry final covering topics: reaction mechanisms, stereochemistry, and spectroscopy",
    response: {
      type: "generate_study_guide",
      data: {
        assignmentTitle: "Organic Chemistry Final",
        course: "CHEM 301",
        topics: ["reaction mechanisms", "stereochemistry", "spectroscopy"],
        studyGuide: "STUDY GUIDE FOR ORGANIC CHEMISTRY FINAL\n\n1. REACTION MECHANISMS\n   - SN1 vs SN2 reactions\n   - E1 vs E2 eliminations\n   - Nucleophilic substitution patterns\n   - Practice drawing mechanisms\n\n2. STEREOCHEMISTRY\n   - R/S configuration\n   - E/Z isomers\n   - Chirality and enantiomers\n   - Diastereomers\n\n3. SPECTROSCOPY\n   - IR spectroscopy: functional group identification\n   - NMR: chemical shifts and splitting patterns\n   - Mass spectrometry basics\n\nStudy Tips:\n- Review past homework problems\n- Practice mechanism drawings\n- Memorize key functional group IR peaks\n- Work through NMR practice problems"
      },
      description: "generate study guide for Organic Chemistry Final",
      requiresConfirmation: false
    },
    explanation: "User wants a study guide. Generate comprehensive study guide covering the specified topics with detailed content, tips, and structure."
  },
  {
    request: "Make me a study guide for my calculus exam on derivatives and integrals",
    response: {
      type: "generate_study_guide",
      data: {
        assignmentTitle: "Calculus Exam",
        course: "MATH 251",
        topics: ["derivatives", "integrals"],
        studyGuide: "CALCULUS EXAM STUDY GUIDE\n\nDERIVATIVES:\n- Power rule, product rule, quotient rule, chain rule\n- Implicit differentiation\n- Related rates problems\n- Optimization problems\n\nINTEGRALS:\n- Basic integration rules\n- U-substitution\n- Integration by parts\n- Definite vs indefinite integrals\n- Applications: area under curve, volume\n\nPractice Problems:\n- Work through textbook examples\n- Review homework assignments\n- Focus on word problems"
      },
      description: "generate study guide for Calculus Exam",
      requiresConfirmation: false
    },
    explanation: "User wants study guide. Generate guide with topics, key concepts, and practice recommendations."
  },
  // Study Pattern Analysis Examples
  {
    request: "Based on my past MATH 201 homework assignments, how should I study for the final?",
    response: {
      type: "analyze_study_patterns",
      data: {
        course: "MATH 201",
        analysis: "Based on your past MATH 201 assignments:\n\nASSIGNMENT PATTERNS:\n- You've had 8 homework assignments covering: algebra, functions, limits, derivatives\n- Most assignments focused on problem-solving (70%) vs theory (30%)\n- Average assignment length: 5-7 problems\n\nSTUDY RECOMMENDATIONS:\n1. Focus Areas:\n   - Derivatives (appeared in 5/8 assignments)\n   - Function analysis (appeared in 6/8 assignments)\n   - Word problems (appeared in 4/8 assignments)\n\n2. Study Strategy:\n   - Review all past homework problems\n   - Practice similar problem types\n   - Focus on derivative rules and applications\n   - Allocate 60% time to practice problems, 40% to theory review\n\n3. Time Allocation:\n   - Derivatives: 4 hours\n   - Functions: 3 hours\n   - Limits: 2 hours\n   - Review: 3 hours\n\nTotal recommended: 12 hours of study time"
      },
      description: "analyze study patterns for MATH 201 final",
      requiresConfirmation: false
    },
    explanation: "User wants personalized study recommendations. Analyze past assignments for the course, identify patterns, topics covered, and suggest optimal study strategy based on assignment history."
  },
  {
    request: "Analyze my chemistry homework history and suggest the best way to prepare for the midterm",
    response: {
      type: "analyze_study_patterns",
      data: {
        course: "CHEM 101",
        analysis: "CHEMISTRY MIDTERM STUDY ANALYSIS\n\nHOMEWORK PATTERNS:\n- 6 assignments covering: atomic structure, bonding, stoichiometry, thermodynamics\n- Problem types: calculations (50%), conceptual questions (30%), lab applications (20%)\n- Most challenging topics: thermodynamics (lowest scores), stoichiometry (most problems)\n\nOPTIMAL STUDY PLAN:\n1. High Priority Topics:\n   - Stoichiometry (appeared in all 6 assignments)\n   - Thermodynamics (your weakest area)\n   - Bonding concepts (foundation for other topics)\n\n2. Study Methods:\n   - Practice stoichiometry calculations (2 hours)\n   - Review thermodynamics formulas and concepts (3 hours)\n   - Work through past homework problems (2 hours)\n   - Create concept maps for bonding (1 hour)\n\n3. Recommended Schedule:\n   - Day 1-2: Stoichiometry review and practice\n   - Day 3-4: Thermodynamics deep dive\n   - Day 5: Bonding and atomic structure review\n   - Day 6: Practice problems from all topics\n   - Day 7: Final review and formula memorization"
      },
      description: "analyze chemistry homework patterns and suggest midterm study plan",
      requiresConfirmation: false
    },
    explanation: "User wants analysis of homework history. Analyze all past assignments for the course, identify strengths/weaknesses, and create personalized study plan."
  },
  {
    request: "What topics should I focus on for my physics exam based on my previous assignments?",
    response: {
      type: "analyze_study_patterns",
      data: {
        course: "PHYS 201",
        analysis: "PHYSICS EXAM FOCUS AREAS\n\nBased on your 7 past assignments:\n\nMOST FREQUENT TOPICS:\n1. Kinematics (appeared in 5/7 assignments) - HIGH PRIORITY\n2. Forces and Newton's Laws (appeared in 6/7 assignments) - HIGH PRIORITY\n3. Energy and Work (appeared in 4/7 assignments) - MEDIUM PRIORITY\n4. Momentum (appeared in 3/7 assignments) - MEDIUM PRIORITY\n\nASSIGNMENT ANALYSIS:\n- Average problems per assignment: 4-6\n- Problem types: calculations (60%), conceptual (25%), lab-based (15%)\n- Your strongest area: Kinematics\n- Your weakest area: Energy and Work\n\nSTUDY FOCUS:\n- Spend 40% time on Forces and Newton's Laws (most frequent)\n- Spend 30% time on Energy and Work (your weakness)\n- Spend 20% time on Momentum\n- Spend 10% time reviewing Kinematics (already strong)\n\nPractice Strategy:\n- Work through all past homework problems\n- Focus on energy conservation problems\n- Review force diagrams and free-body diagrams"
      },
      description: "analyze physics assignments to identify focus topics",
      requiresConfirmation: false
    },
    explanation: "User wants topic focus recommendations. Analyze assignment history, identify most frequent topics, and suggest what to prioritize."
  },
  {
    request: "My lab section was cancelled for this Friday",
    response: {
      type: "add_event",
      data: {
        title: "Lab Section - CANCELLED",
        type: "cancelled",
        date: "2024-12-27",
        originalTime: "2024-12-27T14:00:00.000Z",
        description: "Lab section was cancelled"
      },
      description: "mark lab section as cancelled",
      requiresConfirmation: true
    },
    explanation: "User reports cancelled lab. Create event or remove from schedule."
  },
  {
    request: "How many hours of studying do I have scheduled this week?",
    response: {
      type: "query",
      data: {
        description: "Total study hours scheduled this week:",
        details: "You have 12 hours of study sessions scheduled:\n• Monday: 3 hours\n• Wednesday: 3 hours\n• Friday: 3 hours\n• Saturday: 3 hours"
      },
      description: "calculate total study hours",
      requiresConfirmation: false
    },
    explanation: "User wants total calculation. Sum up all study session durations for the week."
  },
  {
    request: "I want to exercise every other day, schedule it for the next two weeks",
    response: {
      type: "add_workout_plan",
      data: {
        pattern: "every_other_day",
        startDate: "2024-12-16",
        endDate: "2024-12-30",
        numberOfWorkouts: 7,
        workouts: [
          { date: "2024-12-16", startTime: "2024-12-16T07:00:00.000Z", endTime: "2024-12-16T08:30:00.000Z", type: "workout", title: "Workout" },
          { date: "2024-12-18", startTime: "2024-12-18T18:00:00.000Z", endTime: "2024-12-18T19:30:00.000Z", type: "workout", title: "Workout" },
          { date: "2024-12-20", startTime: "2024-12-20T07:00:00.000Z", endTime: "2024-12-20T08:30:00.000Z", type: "workout", title: "Workout" },
          { date: "2024-12-22", startTime: "2024-12-22T18:00:00.000Z", endTime: "2024-12-22T19:30:00.000Z", type: "workout", title: "Workout" },
          { date: "2024-12-24", startTime: "2024-12-24T07:00:00.000Z", endTime: "2024-12-24T08:30:00.000Z", type: "workout", title: "Workout" },
          { date: "2024-12-26", startTime: "2024-12-26T18:00:00.000Z", endTime: "2024-12-26T19:30:00.000Z", type: "workout", title: "Workout" },
          { date: "2024-12-28", startTime: "2024-12-28T07:00:00.000Z", endTime: "2024-12-28T08:30:00.000Z", type: "workout", title: "Workout" }
        ]
      },
      description: "create every-other-day workout plan for two weeks",
      requiresConfirmation: true
    },
    explanation: "User wants every-other-day pattern. Create workouts alternating days over two weeks."
  },
  {
    request: "Estimate study time for my calculus exam and create a study plan",
    response: {
      type: "estimate_study_time",
      data: {
        assignmentTitle: "Calculus Exam",
        course: "MATH 251",
        estimatedHours: 12,
        studySessions: [
          { date: "2024-12-19", startTime: "2024-12-19T10:00:00.000Z", endTime: "2024-12-19T13:00:00.000Z", duration: 180, topic: "Chapters 1-4" },
          { date: "2024-12-21", startTime: "2024-12-21T14:00:00.000Z", endTime: "2024-12-21T17:00:00.000Z", duration: 180, topic: "Chapters 5-8" },
          { date: "2024-12-23", startTime: "2024-12-23T09:00:00.000Z", endTime: "2024-12-23T12:00:00.000Z", duration: 180, topic: "Practice problems" },
          { date: "2024-12-24", startTime: "2024-12-24T14:00:00.000Z", endTime: "2024-12-24T17:00:00.000Z", duration: 180, topic: "Review all chapters" }
        ]
      },
      description: "estimate and create study plan for Calculus Exam",
      requiresConfirmation: true
    },
    explanation: "User wants both estimation and plan. Estimate 12 hours, create study sessions with topics."
  }
];

/**
 * Get relevant examples for a given request (for RAG)
 * Uses keyword matching to find the most relevant examples
 */
export const getRelevantExamples = (userRequest, limit = 5) => {
  const lowerRequest = userRequest.toLowerCase();
  
  // Score examples based on keyword matches
  const scoredExamples = calendarExamples.map(example => {
    let score = 0;
    const exampleLower = example.request.toLowerCase();
    
    // Check for action keywords
    if (lowerRequest.includes('add') || lowerRequest.includes('create') || lowerRequest.includes('new')) {
      if (exampleLower.includes('add') || exampleLower.includes('create')) score += 3;
    }
    if (lowerRequest.includes('update') || lowerRequest.includes('change') || lowerRequest.includes('modify')) {
      if (exampleLower.includes('update') || exampleLower.includes('change')) score += 3;
    }
    if (lowerRequest.includes('delete') || lowerRequest.includes('remove')) {
      if (exampleLower.includes('delete') || exampleLower.includes('remove')) score += 3;
    }
    if (lowerRequest.includes('show') || lowerRequest.includes('list') || lowerRequest.includes('what')) {
      if (exampleLower.includes('show') || exampleLower.includes('list') || exampleLower.includes('what')) score += 3;
    }
    
    // Check for entity keywords
    if (lowerRequest.includes('assignment') || lowerRequest.includes('homework') || lowerRequest.includes('project')) {
      if (exampleLower.includes('assignment') || exampleLower.includes('homework') || exampleLower.includes('project')) score += 2;
    }
    if (lowerRequest.includes('study session') || lowerRequest.includes('study')) {
      if (exampleLower.includes('study session') || exampleLower.includes('study')) score += 2;
    }
    if (lowerRequest.includes('course')) {
      if (exampleLower.includes('course')) score += 2;
    }
    if (lowerRequest.includes('workout') || lowerRequest.includes('exercise') || lowerRequest.includes('gym')) {
      if (exampleLower.includes('workout') || exampleLower.includes('exercise') || exampleLower.includes('gym')) score += 3;
    }
    if (lowerRequest.includes('estimate') || lowerRequest.includes('time') || lowerRequest.includes('hours')) {
      if (exampleLower.includes('estimate') || exampleLower.includes('time') || exampleLower.includes('hours')) score += 2;
    }
    if (lowerRequest.includes('plan') || lowerRequest.includes('schedule')) {
      if (exampleLower.includes('plan') || exampleLower.includes('schedule')) score += 2;
    }
    if (lowerRequest.includes('cancelled') || lowerRequest.includes('cancel')) {
      if (exampleLower.includes('cancelled') || exampleLower.includes('cancel')) score += 2;
    }
    if (lowerRequest.includes('block') || lowerRequest.includes('reserve')) {
      if (exampleLower.includes('block') || exampleLower.includes('reserve')) score += 2;
    }
    if (lowerRequest.includes('study guide') || lowerRequest.includes('guide') || lowerRequest.includes('create guide') || lowerRequest.includes('make guide')) {
      if (exampleLower.includes('study guide') || exampleLower.includes('guide')) score += 3;
    }
    if (lowerRequest.includes('analyze') || lowerRequest.includes('based on') || lowerRequest.includes('homework history') || lowerRequest.includes('past assignments')) {
      if (exampleLower.includes('analyze') || exampleLower.includes('based on') || exampleLower.includes('homework') || exampleLower.includes('past')) score += 3;
    }
    if (lowerRequest.includes('how should i study') || lowerRequest.includes('study strategy') || lowerRequest.includes('study recommendation')) {
      if (exampleLower.includes('how should') || exampleLower.includes('strategy') || exampleLower.includes('recommendation')) score += 3;
    }
    
    // Check for date keywords
    if (lowerRequest.includes('tomorrow') || lowerRequest.includes('friday') || lowerRequest.includes('week')) {
      if (exampleLower.includes('tomorrow') || exampleLower.includes('friday') || exampleLower.includes('week')) score += 1;
    }
    
    return { example, score };
  });
  
  // Sort by score and return top examples
  return scoredExamples
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.example);
};

/**
 * Build RAG-enhanced prompt with examples
 * This prompt is designed to help the LLM understand calendar tasks through examples
 */
export const buildRAGPrompt = (userRequest, context, examples) => {
  const examplesText = examples.map((ex, i) => 
    `Example ${i + 1}:
User: "${ex.request}"
Assistant Response: ${JSON.stringify(ex.response, null, 2)}
Why: ${ex.explanation}`
  ).join('\n\n');

  // Get current date for context
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  return `You are an AI calendar assistant. Your job is to parse user requests and return JSON actions that modify or query a calendar system.

=== AVAILABLE ACTIONS ===
1. add_assignment: Create a new assignment
   Format: { "type": "add_assignment", "data": { "title": "...", "course": "...", "dueDate": "ISO_DATE", "priority": "low|medium|high", "description": "..." }, "description": "...", "requiresConfirmation": true }

2. update_assignment: Modify an existing assignment
   Format: { "type": "update_assignment", "data": { "id": "...", "updates": { "dueDate": "...", "priority": "...", etc } }, "description": "...", "requiresConfirmation": true }

3. delete_assignment: Remove an assignment
   Format: { "type": "delete_assignment", "data": { "id": "..." }, "description": "...", "requiresConfirmation": true }

4. add_course: Add a new course
   Format: { "type": "add_course", "data": { "name": "...", "code": "...", "instructor": "...", "days": ["monday", "wednesday"], "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "location": "..." }, "description": "...", "requiresConfirmation": true }

5. update_study_session: Reschedule a study session
   Format: { "type": "update_study_session", "data": { "id": "...", "updates": { "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "date": "YYYY-MM-DD" } }, "description": "...", "requiresConfirmation": true }

6. delete_study_session: Remove a study session
   Format: { "type": "delete_study_session", "data": { "id": "..." }, "description": "...", "requiresConfirmation": true }

7. add_study_session: Create a new study session
   Format: { "type": "add_study_session", "data": { "assignmentTitle": "...", "course": "...", "date": "YYYY-MM-DD", "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "duration": 120, "topic": "..." }, "description": "...", "requiresConfirmation": true }

8. estimate_study_time: Estimate hours needed and create study sessions
   Format: { "type": "estimate_study_time", "data": { "assignmentTitle": "...", "course": "...", "estimatedHours": 12, "studySessions": [{ "date": "YYYY-MM-DD", "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "duration": 180, "topic": "..." }] }, "description": "...", "requiresConfirmation": true }

9. generate_study_plan: Create a comprehensive study plan
   Format: { "type": "generate_study_plan", "data": { "assignmentTitle": "...", "course": "...", "examDate": "ISO_DATE", "studySessions": [{ "date": "YYYY-MM-DD", "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "topic": "..." }] }, "description": "...", "requiresConfirmation": true }

10. add_workout_plan: Create a workout schedule
    Format: { "type": "add_workout_plan", "data": { "week": "YYYY-MM-DD", "numberOfWorkouts": 3, "workouts": [{ "date": "YYYY-MM-DD", "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "type": "workout", "title": "..." }] }, "description": "...", "requiresConfirmation": true }

11. add_time_blocks: Create recurring time blocks
    Format: { "type": "add_time_blocks", "data": { "pattern": "daily|weekly", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "startTime": "HH:mm", "endTime": "HH:mm", "title": "...", "days": ["monday", "tuesday"], "recurring": true }, "description": "...", "requiresConfirmation": true }

12. add_event: Add a calendar event (appointments, meetings, cancelled sessions, etc.)
    Format: { "type": "add_event", "data": { "title": "...", "type": "appointment|meeting|cancelled|study_group", "date": "YYYY-MM-DD", "startTime": "ISO_DATETIME", "endTime": "ISO_DATETIME", "description": "..." }, "description": "...", "requiresConfirmation": true }

13. generate_study_guide: Generate a comprehensive study guide from topics
    Format: { "type": "generate_study_guide", "data": { "assignmentTitle": "...", "course": "...", "topics": ["topic1", "topic2"], "studyGuide": "full study guide text content..." }, "description": "...", "requiresConfirmation": false }

14. analyze_study_patterns: Analyze past assignments and suggest optimal study strategy
    Format: { "type": "analyze_study_patterns", "data": { "course": "...", "analysis": "detailed analysis text with recommendations..." }, "description": "...", "requiresConfirmation": false }

15. query: Answer questions (read-only, no confirmation needed)
    Format: { "type": "query", "data": { "description": "...", "details": "..." }, "description": "...", "requiresConfirmation": false }

=== CURRENT CALENDAR STATE ===
Today's Date: ${todayISO}

Upcoming Assignments (${context.assignments.filter(a => new Date(a.dueDate) >= new Date()).length} total):
${context.assignments.filter(a => new Date(a.dueDate) >= new Date()).slice(0, 15).map(a => `- ${a.title} (${a.course}) - Due: ${a.dueDate} - Priority: ${a.priority}${a.description ? ` - Description: ${a.description}` : ''}`).join('\n')}

Past/Completed Assignments (${context.assignments.filter(a => new Date(a.dueDate) < new Date()).length} total):
${context.assignments.filter(a => new Date(a.dueDate) < new Date()).slice(0, 20).map(a => `- ${a.title} (${a.course}) - Due: ${a.dueDate} - Priority: ${a.priority}${a.description ? ` - Description: ${a.description}` : ''}`).join('\n')}
${context.assignments.filter(a => new Date(a.dueDate) < new Date()).length > 20 ? `... and ${context.assignments.filter(a => new Date(a.dueDate) < new Date()).length - 20} more past assignments` : ''}

Courses (${context.courses.length} total):
${context.courses.map(c => `- ${c.name}${c.code ? ` (${c.code})` : ''}${c.instructor ? ` - Instructor: ${c.instructor}` : ''}`).join('\n')}

Study Sessions (${context.studySessions.length} total):
${context.studySessions.slice(0, 10).map(s => `- ${s.assignmentTitle} - ${s.startTime ? new Date(s.startTime).toLocaleString() : s.date}${s.topic ? ` - Topic: ${s.topic}` : ''}`).join('\n')}
${context.studySessions.length > 10 ? `... and ${context.studySessions.length - 10} more sessions` : ''}

=== LEARN FROM THESE EXAMPLES ===
${examplesText}

=== USER REQUEST ===
"${userRequest}"

=== YOUR TASK ===
Parse the user's request and return ONLY valid JSON in this exact format:
{
  "actions": [
    {
      "type": "action_type",
      "data": { ... },
      "description": "Brief description of what you're doing",
      "requiresConfirmation": true
    }
  ]
}

IMPORTANT RULES:
1. Dates: Parse relative dates like "tomorrow", "next Friday", "December 25th" into ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
2. Times: Parse times like "2pm", "3:30 PM" into 24-hour format
3. Courses: Match course names/codes from the context when possible
4. IDs: For updates/deletes, find the matching item from context and use its ID
5. Priority: Extract "high", "urgent", "important" → "high"; "low", "not important" → "low"; default → "medium"
6. Queries: For "show", "list", "what" requests, return query actions with description and details
7. Study Guides: For "study guide", "create guide", "make guide" requests, use generate_study_guide action. Generate comprehensive, detailed study guide content covering all specified topics. Include sections, key concepts, tips, and practice recommendations.
8. Study Analysis: For "analyze", "based on", "how should I study" requests, use analyze_study_patterns action. Analyze past assignments from the course, identify patterns, topics covered, strengths/weaknesses, and provide personalized study recommendations with time allocations.
9. Always return an array of actions, even if it's just one action
10. For generate_study_guide and analyze_study_patterns, the content should be detailed and comprehensive - use your knowledge to create valuable study materials

Return ONLY the JSON, no other text.`;
};

