# Developer Guide

This guide is for developers and college students who want to understand, modify, or contribute to the Personal Calendar project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure & Responsibilities](#file-structure--responsibilities)
4. [Data Flow](#data-flow)
5. [Key Technologies](#key-technologies)
6. [How It Works](#how-it-works)
7. [Adding New Features](#adding-new-features)
8. [Common Tasks](#common-tasks)

---

## Project Overview

This is a **React-based single-page application** for managing college schedules. It's designed to be:
- **Offline-first**: All data stored in browser localStorage
- **No backend required**: Everything runs client-side
- **AI-powered**: Natural language interface for managing calendar
- **Extensible**: Easy to add new features

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              React Application                   │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   App    │──│  Router  │──│  Views   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│       │              │              │          │
│       └──────────────┼──────────────┘          │
│                      │                          │
│  ┌──────────────────────────────────────┐      │
│  │      State Management (useState)     │      │
│  │  + LocalStorage Persistence Hook     │      │
│  └──────────────────────────────────────┘      │
│                      │                          │
│  ┌──────────────────────────────────────┐      │
│  │         Utility Functions            │      │
│  │  - Canvas Import                     │      │
│  │  - Study Scheduler                   │      │
│  │  - AI Agent (Rule-based/LLM)        │      │
│  │  - ICS Export                       │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **User interacts** with UI (clicks, types, etc.)
2. **Component** updates local state
3. **useLocalStorage hook** automatically syncs to localStorage
4. **Other components** react to state changes via props
5. **UI re-renders** with new data

---

## File Structure & Responsibilities

### Entry Point

#### `src/index.js`
- **Purpose**: Application entry point
- **Responsibilities**:
  - Sets up Material UI theme with pastel color palette
  - Provides CssBaseline for consistent styling
  - Renders the root App component
- **Key Code**:
  ```javascript
  const theme = createTheme({ palette: {...} });
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
  ```

### Main App Component

#### `src/App.js`
- **Purpose**: Main application shell with routing
- **Responsibilities**:
  - Sets up React Router
  - Manages global state (assignments, courses, studySessions)
  - Provides navigation tabs
  - Routes to different views
- **State Management**:
  - Uses `useLocalStorage` hook for persistence
  - Passes state down to child components via props
- **Key Features**:
  - Tab-based navigation
  - React Router for URL routing
  - Consistent theming

### Components

#### `src/components/CalendarView.js`
- **Purpose**: Main calendar display component
- **Features**:
  - Month, week, and day view modes
  - Drag-and-drop for study sessions
  - Click to add assignments
  - Visual event indicators
  - ICS export functionality
- **Key State**:
  - `currentDate`: Currently displayed date
  - `view`: 'month', 'week', or 'day'
  - `draggedSession`: Session being dragged
- **Interactions**:
  - Click day → Add assignment dialog
  - Double-click day → Day detail view
  - Drag study session → Reschedule
  - Click study session → Edit dialog

#### `src/components/AssignmentsView.js`
- **Purpose**: Assignment management interface
- **Features**:
  - Add/edit/delete assignments
  - Canvas import (.ics/.csv)
  - Filter by upcoming/past
  - Priority indicators
  - Clear all functionality
- **Key Functions**:
  - `handleCanvasImport`: Parses Canvas files
  - Auto-adds courses from imported assignments
- **Data Flow**:
  - Reads from `assignments` prop
  - Updates via `setAssignments` prop

#### `src/components/CoursesView.js`
- **Purpose**: Course management interface
- **Features**:
  - Add/edit/delete courses
  - Set course schedule (days, times)
  - Display course details
- **Data Structure**:
  ```javascript
  {
    id, name, code, instructor,
    credits, days: ['monday', 'wednesday'],
    startTime, endTime, location
  }
  ```

#### `src/components/StudyScheduleView.js`
- **Purpose**: Study schedule generation and display
- **Features**:
  - Intelligent schedule generation
  - User preferences (availability, max hours)
  - Study session management
  - Clear all functionality
- **Key Integration**:
  - Uses `generateIntelligentSchedule` from `studyScheduler.js`
  - Respects course times to avoid conflicts
  - Creates time-specific study sessions

#### `src/components/StudyPreferences.js`
- **Purpose**: User study preferences component
- **Features**:
  - Set available study times
  - Preferred study hours
  - Max hours per day
- **Used By**: `StudyScheduleView`

#### `src/components/AIAgentView.js`
- **Purpose**: AI Assistant chat interface
- **Features**:
  - Natural language input
  - Multiple parsing modes (rule-based, Ollama, GPT)
  - Action confirmation dialogs
  - Query responses
  - Study guide generation
  - Study pattern analysis
- **Key State**:
  - `messages`: Chat history
  - `useOllama`, `useGPT`: Parser mode flags
  - `pendingActions`: Actions awaiting confirmation
- **Data Flow**:
  - User input → Parser → Actions → Execution → UI update

### Hooks

#### `src/hooks/useLocalStorage.js`
- **Purpose**: Persist state to browser localStorage
- **How It Works**:
  ```javascript
  const [value, setValue] = useLocalStorage('key', defaultValue);
  // Automatically syncs to localStorage on every setValue call
  ```
- **Benefits**:
  - Data persists across browser sessions
  - No backend needed
  - Automatic serialization/deserialization

### Utilities

#### `src/utils/canvasImport.js`
- **Purpose**: Import assignments from Canvas LMS
- **Functions**:
  - `importCanvasCalendar(file)`: Main import function
  - `parseICSDate(dateString)`: Parse Canvas date formats
  - `parseCSV(file)`: Parse CSV format
- **Returns**: Array of assignments + extracted courses
- **File Formats Supported**:
  - `.ics` (iCalendar format)
  - `.csv` (Comma-separated values)

#### `src/utils/studyScheduler.js`
- **Purpose**: Intelligent study schedule generation
- **Key Function**: `generateIntelligentSchedule(assignments, courses, preferences)`
- **Algorithm**:
  1. Calculates hours needed per assignment
  2. Finds available time slots (avoids courses)
  3. Distributes study time based on priority and due date
  4. Creates time-specific study sessions
- **Returns**: Array of study session objects with start/end times

#### `src/utils/aiAgent.js`
- **Purpose**: Rule-based natural language parser
- **How It Works**:
  - Pattern matching with regex and keyword detection
  - Extracts: action type, dates, times, courses, priorities
  - Returns structured action objects
- **Supported Actions**:
  - `add_assignment`, `update_assignment`, `delete_assignment`
  - `add_course`, `update_study_session`, `delete_study_session`
  - `query` (read-only)
- **Limitations**: Only handles predefined patterns

#### `src/utils/aiAgentLLM.js`
- **Purpose**: GPT integration for advanced parsing
- **Features**:
  - Uses OpenAI API (requires API key)
  - Better understanding of complex requests
  - Dynamic import to avoid build errors if not installed
- **Setup Required**:
  - Install: `npm install openai`
  - Set: `REACT_APP_OPENAI_API_KEY` in `.env`

#### `src/utils/ollamaAgent.js`
- **Purpose**: Local LLM integration via Ollama
- **Features**:
  - Connects to local Ollama instance (http://localhost:11434)
  - Uses RAG (Retrieval-Augmented Generation)
  - Free, offline, no API keys needed
- **Key Functions**:
  - `parseWithOllama(request, context, model)`: Main parsing function
  - `checkOllamaAvailability()`: Checks if Ollama is running
  - `getOllamaModels()`: Lists available models
- **RAG Integration**:
  - Retrieves relevant examples from `ragKnowledgeBase.js`
  - Injects examples into prompt for better understanding

#### `src/utils/ragKnowledgeBase.js`
- **Purpose**: RAG training data for AI Assistant
- **Contains**:
  - 100+ example requests and responses
  - Covers: assignments, study sessions, workouts, time blocks, etc.
  - Includes study guide and analysis examples
- **Key Functions**:
  - `getRelevantExamples(request, limit)`: Finds top examples by keyword matching
  - `buildRAGPrompt(request, context, examples)`: Builds LLM prompt with examples
- **How RAG Works**:
  1. User makes request
  2. System scores all examples by keyword matches
  3. Top 5 examples selected
  4. Examples injected into LLM prompt
  5. LLM uses examples to understand request format

#### `src/utils/icsExport.js`
- **Purpose**: Export calendar to ICS format
- **Functions**:
  - `generateICS(data)`: Creates ICS file content
  - `downloadICS(content, filename)`: Triggers file download
- **Exports**:
  - Assignments as events (with due dates)
  - Courses as recurring weekly events
  - Study sessions as timed events
- **Compatibility**: Google Calendar, Apple Calendar, Outlook, etc.

---

## Data Flow

### Adding an Assignment

```
User clicks "Add Assignment"
    ↓
AssignmentsView opens dialog
    ↓
User fills form and submits
    ↓
handleAddAssignment() creates assignment object
    ↓
setAssignments([...assignments, newAssignment])
    ↓
useLocalStorage hook saves to localStorage
    ↓
CalendarView re-renders with new assignment
    ↓
Assignment appears on calendar
```

### AI Assistant Request Flow

```
User types: "Add math homework due Friday"
    ↓
AIAgentView.handleSend()
    ↓
Parser selected (rule-based/Ollama/GPT)
    ↓
parseNaturalLanguageRequest() or parseWithOllama()
    ↓
Returns: [{ type: 'add_assignment', data: {...} }]
    ↓
If requiresConfirmation: Show dialog
    ↓
User confirms
    ↓
executeActions() updates state
    ↓
Assignment appears in calendar
```

### Study Schedule Generation

```
User clicks "Generate Study Schedule"
    ↓
StudyScheduleView calls generateIntelligentSchedule()
    ↓
studyScheduler.js:
  - Calculates hours needed per assignment
  - Finds available time slots
  - Avoids course conflicts
  - Creates study sessions
    ↓
Returns array of study sessions
    ↓
setStudySessions() updates state
    ↓
Sessions appear in calendar
```

---

## Key Technologies

### React
- **Version**: 18.2.0
- **Pattern**: Functional components with hooks
- **State**: useState for local, props for sharing

### Material UI (MUI)
- **Version**: 5.14.20
- **Purpose**: UI component library
- **Theme**: Custom pastel theme defined in `index.js`
- **Components Used**: Buttons, Dialogs, Cards, Chips, DatePickers, etc.

### React Router
- **Version**: 6.20.1
- **Purpose**: Client-side routing
- **Routes**: `/calendar`, `/assignments`, `/courses`, `/study-schedule`, `/ai-assistant`

### date-fns
- **Version**: 2.30.0
- **Purpose**: Date manipulation and formatting
- **Key Functions**: `format`, `parseISO`, `addDays`, `startOfWeek`, etc.

### MUI X Date Pickers
- **Version**: 6.18.2
- **Purpose**: Date and time selection components
- **Components**: `DatePicker`, `TimePicker`

---

## How It Works

### State Management

The app uses **React's useState** with a **localStorage persistence hook**:

```javascript
// In App.js
const [assignments, setAssignments] = useLocalStorage('assignments', []);

// useLocalStorage automatically:
// 1. Loads from localStorage on mount
// 2. Saves to localStorage on every update
// 3. Handles JSON serialization
```

### Data Persistence

All data is stored in **browser localStorage**:
- Key: `'assignments'`, `'courses'`, `'studySessions'`
- Format: JSON strings
- Persists across browser sessions
- Cleared only when user clears browser data

### Routing

Uses **React Router** for navigation:
- URL changes update active tab
- Tab clicks update URL
- Direct URL access works
- Browser back/forward works

### AI Assistant Architecture

**Three-tier parsing system**:

1. **Rule-based** (default):
   - Fast, offline, always available
   - Pattern matching with regex
   - Limited to predefined patterns

2. **Ollama** (recommended):
   - Local LLM, free, offline
   - Uses RAG with 100+ examples
   - Better understanding than rule-based
   - Requires Ollama installation

3. **GPT** (optional):
   - Best understanding
   - Requires API key
   - Costs money (but very cheap)

**RAG System**:
- Knowledge base of 100+ examples
- Keyword matching to find relevant examples
- Examples injected into LLM prompt
- LLM learns from examples to parse requests

---

## Adding New Features

### Adding a New View

1. **Create component** in `src/components/YourView.js`
2. **Add route** in `src/App.js`:
   ```javascript
   <Route path="/your-view" element={<YourView {...props} />} />
   ```
3. **Add tab** in `src/App.js`:
   ```javascript
   <Tab label="Your View" />
   ```
4. **Update routing logic** in `getTabValue()` and `handleTabChange()`

### Adding a New Action Type

1. **Add to RAG knowledge base** (`ragKnowledgeBase.js`):
   - Add example requests/responses
   - Update `buildRAGPrompt()` to include new action

2. **Add to execution logic** (`AIAgentView.js`):
   ```javascript
   case 'your_new_action':
     // Handle the action
     break;
   ```

3. **Update rule-based parser** (`aiAgent.js`):
   - Add pattern matching
   - Add handler function

### Adding a New Utility Function

1. **Create file** in `src/utils/yourUtility.js`
2. **Export functions**:
   ```javascript
   export const yourFunction = (params) => {
     // Implementation
   };
   ```
3. **Import where needed**:
   ```javascript
   import { yourFunction } from '../utils/yourUtility';
   ```

---

## Common Tasks

### Debugging

**Check localStorage**:
```javascript
// In browser console
JSON.parse(localStorage.getItem('assignments'));
```

**Check state**:
- Use React DevTools
- Add `console.log()` in components
- Check browser console for errors

**Test AI Assistant**:
- Check browser console for parsed actions
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check network tab for API calls

### Testing Canvas Import

1. Use test file: `testing/canvas-example.ics`
2. Go to Assignments tab
3. Click "Import from Canvas"
4. Select test file
5. Verify assignments appear

### Testing ICS Export

1. Add some assignments, courses, study sessions
2. Go to Calendar view
3. Click "Export to ICS"
4. Open file in text editor to verify format
5. Import into Google Calendar/Apple Calendar to test

### Modifying the Theme

Edit `src/index.js`:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#YOUR_COLOR' },
    // ... other colors
  }
});
```

### Adding New Query Types

Edit `src/utils/aiAgent.js` → `handleQuery()`:
```javascript
if (lower.includes('your pattern')) {
  // Calculate result
  return {
    description: 'Summary',
    details: 'Detailed info'
  };
}
```

---

## Code Style & Best Practices

### Component Structure

```javascript
// 1. Imports
import React, { useState } from 'react';
import { ... } from '@mui/material';

// 2. Component definition
const YourComponent = ({ prop1, prop2 }) => {
  // 3. State declarations
  const [state, setState] = useState(initial);
  
  // 4. Helper functions
  const handleSomething = () => { ... };
  
  // 5. Effects
  useEffect(() => { ... }, [deps]);
  
  // 6. Render
  return (
    <Box>
      {/* JSX */}
    </Box>
  );
};

export default YourComponent;
```

### Naming Conventions

- **Components**: PascalCase (`CalendarView.js`)
- **Functions**: camelCase (`handleAddAssignment`)
- **Constants**: UPPER_SNAKE_CASE (if truly constant)
- **Files**: Match component/function name

### State Management

- **Local state**: Use `useState` for component-specific state
- **Shared state**: Lift to parent (App.js) and pass via props
- **Persistence**: Use `useLocalStorage` hook

### Error Handling

- Always wrap date parsing in try-catch
- Validate user input
- Provide fallback values
- Log errors to console for debugging

---

## Troubleshooting

### Common Issues

**"Module not found" errors**:
- Run `npm install` to install dependencies
- Check import paths are correct

**State not updating**:
- Check if you're using `setState` correctly
- Verify props are being passed
- Check browser console for errors

**LocalStorage not working**:
- Check browser allows localStorage
- Verify data format is valid JSON
- Clear localStorage and try again

**Ollama not connecting**:
- Verify Ollama is running: `ollama serve`
- Check it's on `http://localhost:11434`
- Try pulling a model: `ollama pull llama3.1`

**ICS export not working**:
- Check browser allows downloads
- Verify all dates are valid
- Check console for errors

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### What to Contribute

- Bug fixes
- New features
- UI improvements
- Documentation
- Performance optimizations
- More RAG examples

### Code Review Checklist

- [ ] Code follows existing patterns
- [ ] No console errors
- [ ] Works in different browsers
- [ ] Handles edge cases
- [ ] Updates documentation if needed

---

## Resources

- **React Docs**: https://react.dev
- **Material UI Docs**: https://mui.com
- **date-fns Docs**: https://date-fns.org
- **React Router Docs**: https://reactrouter.com
- **Ollama Docs**: https://ollama.ai
- **ICS Format Spec**: https://icalendar.org

---

## Questions?

If you have questions about the codebase:
1. Check this guide first
2. Read the code comments
3. Check browser console for errors
4. Review the RAG examples for AI patterns
5. Look at similar existing features

Happy coding! 🎓📅

