# Course Calendar

A comprehensive React application for managing college course schedules, assignments, and study plans. Built with Material UI for a modern, beautiful interface.

## Features

### Calendar View
- Monthly calendar display with all assignments and study sessions
- Visual indicators for due dates and priorities
- Quick add assignment from any date
- Color-coded events by priority

### Assignment Management
- Add, edit, and delete assignments
- Set priorities (High, Medium, Low)
- Track due dates with visual status indicators
- Separate views for upcoming and past assignments
- **Canvas LMS Import**: Import assignments from Canvas calendar exports (.ics or .csv files)

### Course Management
- Add courses with details (name, code, instructor, credits)
- Set class schedules (days of week, times, location)
- View all courses in a card-based layout

### Study Schedule Generator
- Automatically generates study schedules based on assignment due dates
- Distributes study time intelligently based on:
  - Assignment priority
  - Days until due date
  - Prefers weekdays over weekends
- Visual schedule table showing when to study for each assignment
- Upcoming assignments sidebar

### Data Persistence
- All data stored locally in browser (localStorage)
- No backend required - works completely offline
- Data persists across browser sessions

### Calendar Export
- **ICS Export**: Export your entire calendar as an ICS file
- Compatible with Google Calendar, Apple Calendar, Outlook, and other calendar apps
- Includes all assignments, courses, and study sessions
- One-click export from the Calendar view

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage

### Adding Courses
1. Navigate to the "Courses" tab
2. Click "Add Course"
3. Fill in course details (name, code, instructor, schedule, etc.)
4. Save

### Adding Assignments
1. Go to "Assignments" or "Calendar" tab
2. Click "Add Assignment"
3. Fill in assignment details:
   - Title (required)
   - Course (required)
   - Due date
   - Priority level
   - Description (optional)
4. Save

### Importing from Canvas
1. Export your Canvas calendar:
   - Go to Canvas → Calendar
   - Click the calendar feed icon
   - Download the .ics file
2. In the app, go to "Assignments" tab
3. Click "Import from Canvas"
4. Select your downloaded .ics file
5. Assignments will be automatically imported

### Generating Study Schedule
1. Add your assignments (manually or via Canvas import)
2. Navigate to "Study Schedule" tab
3. Click "Generate Study Schedule"
4. The app will create a study plan distributing time across days before each assignment's due date

### Exporting Calendar
1. Navigate to the "Calendar" tab
2. Click "Export to ICS" button in the top right
3. The calendar file will download automatically
4. Import into your preferred calendar app:
   - **Google Calendar**: Settings → Import & Export → Import
   - **Apple Calendar**: File → Import
   - **Outlook**: File → Open & Export → Import/Export

## Technology Stack

- **React** - UI framework
- **Material UI (MUI)** - Component library
- **React Router** - Navigation
- **date-fns** - Date manipulation
- **MUI X Date Pickers** - Date/time selection

## Project Structure

```
calendar/
├── src/                         # React frontend
│   ├── components/             # UI components
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── App.js                  # Main app component
│   └── index.js                # Entry point
├── ml-service/                  # Python ML backend
│   ├── src/                    # ML source code
│   ├── data/                   # Training data
│   ├── models/                 # Trained models
│   ├── notebooks/              # Jupyter notebooks
│   └── requirements.txt        # Python dependencies
└── README.md                   # This file
```

### Frontend Structure

```
src/
  ├── components/
  │   ├── CalendarView.js       # Main calendar display (month/week/day views)
  │   ├── AssignmentsView.js    # Assignment management
  │   ├── CoursesView.js        # Course management
  │   ├── StudyScheduleView.js  # Study schedule generator
  │   ├── StudyPreferences.js   # User study preferences
  │   └── AIAgentView.js        # AI Assistant chat interface
  ├── hooks/
  │   └── useLocalStorage.js    # Local storage persistence hook
  ├── utils/
  │   ├── canvasImport.js       # Canvas LMS import utilities
  │   ├── studyScheduler.js    # Intelligent study schedule generation
  │   ├── aiAgent.js            # Rule-based natural language parser
  │   ├── aiAgentLLM.js        # GPT integration (optional)
  │   ├── ollamaAgent.js       # Ollama local LLM integration
  │   ├── ragKnowledgeBase.js  # RAG training examples
  │   ├── icsExport.js         # ICS calendar export utility
  │   └── dataExport.js        # ML training data export
  ├── App.js                    # Main app component with routing
  └── index.js                  # Entry point with theme setup
```

### ML Service Structure

```
ml-service/
  ├── src/
  │   ├── data_processing.py   # Data cleaning and feature engineering
  │   ├── model.py             # ML model definitions
  │   ├── train.py             # Training script
  │   └── evaluate.py          # Model evaluation
  ├── data/                    # Training data (JSON files)
  ├── models/                  # Trained model files (.pkl)
  ├── notebooks/               # Jupyter notebooks for exploration
  └── requirements.txt        # Python dependencies
```

For detailed information about the codebase, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).

## Machine Learning Training

The project includes a Python ML service for training models to optimize schedules.

### Quick Start

1. **Export training data** from the React app:
   - Go to Assignments tab
   - Click "Export for ML" button
   - Save the JSON file

2. **Set up Python environment**:
   ```bash
   cd ml-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Place data file** in `ml-service/data/training_data.json`

4. **Train models**:
   ```bash
   python src/train.py --data data/training_data.json
   ```

5. **Evaluate models**:
   ```bash
   python src/evaluate.py --model models/study_time_predictor.pkl --data data/training_data.json
   ```

See [ml-service/README.md](./ml-service/README.md) for detailed ML documentation.

## AI Assistant

The app includes an AI-powered calendar assistant that can interpret natural language requests and make changes to your schedule.

### Features
- **Natural Language Processing**: Ask questions or make requests in plain English
- **Smart Actions**: Add assignments, modify schedules, update courses
- **Confirmation System**: Review changes before they're applied
- **Query Support**: Ask about your schedule, upcoming assignments, etc.
- **Multiple Modes**: Choose between rule-based, Ollama (local LLM), or GPT

### Example Requests
- "Add a math homework due next Friday"
- "Show me all assignments due this week"
- "Move my CS 101 study session to tomorrow at 2pm"
- "Update the physics assignment due date to December 25th"

### AI Modes

The AI assistant supports three modes:

1. **Rule-based Parser** (default): Fast, offline, works without any setup
2. **Ollama** (recommended, free & local): Uses a local LLM with RAG training data
3. **GPT** (optional): Uses OpenAI's GPT for advanced understanding

### Setting up Ollama (Recommended - Free & Local)

Ollama provides a free, local LLM that works offline and doesn't require API keys:

1. **Install Ollama**: Download from https://ollama.ai
2. **Pull a model**: Run `ollama pull llama3.1` (or any other model like `llama3.2`, `mistral`, etc.)
3. **Start Ollama**: It should start automatically, or run `ollama serve`
4. **Use in app**: Click "Use Ollama" button in the AI Assistant section

The app will automatically detect when Ollama is running and show the option. Ollama uses RAG (Retrieval-Augmented Generation) with a knowledge base of calendar examples to better understand your requests.

### Setting up GPT (Optional)

The AI assistant uses a rule-based parser by default (works offline, completely free). To use OpenAI's GPT for better understanding:

**Quick Setup (5 minutes):**
1. Sign up at [OpenAI Platform](https://platform.openai.com) - **Get $5 free credit!**
2. Get your API key from [API Keys page](https://platform.openai.com/api-keys)
3. Create a `.env` file in the project root:
   ```
   REACT_APP_OPENAI_API_KEY=sk-your-key-here
   ```
4. Install OpenAI package:
   ```bash
   npm install openai
   ```
5. Update `src/components/AIAgentView.js`:
   ```javascript
   // Comment out this line:
   // import { parseNaturalLanguageRequest } from '../utils/aiAgent';
   
   // Uncomment this line:
   import { parseWithLLM as parseNaturalLanguageRequest } from '../utils/aiAgentLLM';
   ```
6. Restart the app: `npm start`

### RAG Training Data

The Ollama integration uses RAG (Retrieval-Augmented Generation) with a curated knowledge base of calendar examples. This helps the LLM understand:
- How to parse natural language calendar requests
- What actions are available
- How to format responses correctly
- Common patterns and variations

See `RAG_TRAINING_DATA.md` for more details on the training data.

## Future Enhancements

Potential features for future versions:
- Google Calendar integration
- Email reminders
- Mobile app version
- Cloud sync across devices
- Assignment templates
- Time tracking
- Grade tracking
- Semester management
- Full LLM integration with OpenAI/Anthropic

## License

This project is open source and available for personal use.

