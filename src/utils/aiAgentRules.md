# AI Agent Parsing Rules

This document lists all the patterns and rules that the rule-based parser understands.

## Assignment Actions

### Add Assignment
**Patterns:**
- "add assignment [title]"
- "create homework [title]"
- "new project [title]"
- "add exam [title]"
- "add quiz [title]"

**Extracted Information:**
- **Title**: Extracted from request or defaults to "Assignment", "Homework", "Project", "Exam", or "Quiz"
- **Course**: Matches against existing courses or extracts course code (e.g., "CS 101", "MATH 201")
- **Due Date**: Parses dates from various formats
- **Priority**: Detects "high", "urgent", "important" (high) or "low", "not important" (low), defaults to "medium"

**Examples:**
- "Add a math homework due next Friday"
- "Create a physics project due December 25th"
- "New CS 101 assignment due tomorrow"

### Update Assignment
**Patterns:**
- "update assignment [name]"
- "change assignment [name]"
- "modify assignment [name]"
- "change due date"

**What Can Be Updated:**
- Due date (parsed from request)
- Priority (high/medium/low)

**Examples:**
- "Update the physics assignment due date to December 25th"
- "Change CS 101 assignment to high priority"

### Delete Assignment
**Patterns:**
- "delete assignment [name]"
- "remove assignment [name]"
- "cancel assignment [name]"

**Examples:**
- "Delete the math homework"
- "Remove CS 101 assignment"

## Course Actions

### Add Course
**Patterns:**
- "add course [code]"
- "new course [code]"

**Extracted Information:**
- Course code/name (e.g., "CS 101", "MATH 201")

**Examples:**
- "Add course CS 101"
- "New course MATH 201"

## Study Session Actions

### Update Study Session
**Patterns:**
- "move study session"
- "reschedule study session"
- "change study session time"

**What Can Be Updated:**
- Start time (parsed from request)
- End time (calculated from duration)
- Date (parsed from request)

**Examples:**
- "Move my study session to tomorrow at 2pm"
- "Reschedule CS 101 study session to Friday at 3:30 PM"

### Delete Study Session
**Patterns:**
- "delete study session"
- "remove study session"
- "cancel study session"

## Query Actions

### Show Assignments
**Patterns:**
- "show assignments"
- "list assignments"
- "what assignments"
- "assignments due this week"
- "upcoming assignments"

**Returns:**
- List of assignments matching the query
- For "this week": assignments due within the current week

**Examples:**
- "Show me all assignments due this week"
- "What assignments do I have?"
- "List upcoming assignments"

### Show Study Sessions
**Patterns:**
- "show study sessions"
- "list study sessions"
- "what study sessions"

**Returns:**
- List of scheduled study sessions

**Examples:**
- "Show me my study sessions"
- "What study sessions do I have scheduled?"

## Date Parsing Rules

The parser understands various date formats:

### Relative Dates
- "today" → Today's date
- "tomorrow" → Tomorrow's date
- "next week" → 7 days from now
- "next Monday" → Next Monday
- "next Friday" → Next Friday

### Day of Week
- "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
- Finds the next occurrence of that day

### Specific Dates
- "MM/DD" or "MM/DD/YYYY" format (e.g., "12/25" or "12/25/2024")
- Month names (e.g., "December 25th", "January 15")

## Time Parsing Rules

### Time Formats
- "2pm" or "2 PM" → 2:00 PM (14:00)
- "3:30pm" or "3:30 PM" → 3:30 PM (15:30)
- "10am" or "10 AM" → 10:00 AM (10:00)
- "12pm" → 12:00 PM (noon)
- "12am" → 12:00 AM (midnight)

## Course Matching

The parser tries to match courses in this order:
1. Exact match against existing course names
2. Exact match against course codes
3. Extract course code pattern (e.g., "CS 101", "MATH 201")
4. Default to first course in list or "Unknown Course"

## Priority Detection

- **High**: "high", "urgent", "important"
- **Low**: "low", "not important"
- **Medium**: Default if not specified

## Limitations

The rule-based parser:
- Works best with clear, structured requests
- May struggle with very complex or ambiguous requests
- Requires specific keywords to trigger actions
- Uses pattern matching, not true understanding

**For better understanding of complex requests, use GPT integration!**

