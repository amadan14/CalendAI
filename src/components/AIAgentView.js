import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send,
  SmartToy,
  CheckCircle,
  Cancel,
  AutoAwesome,
} from '@mui/icons-material';
import { format, parseISO, addDays } from 'date-fns';
// Choose your parser:
import { parseNaturalLanguageRequest } from '../utils/aiAgent'; // Rule-based (free, works offline)
// Note: parseWithLLM is dynamically imported when needed to avoid build warnings
import { parseWithOllama, checkOllamaAvailability, getOllamaModels } from '../utils/ollamaAgent'; // Ollama (local, free)

const AIAgentView = ({ 
  assignments, 
  setAssignments, 
  courses, 
  setCourses, 
  studySessions, 
  setStudySessions 
}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI calendar assistant. I can help you:\n• Add assignments\n• Modify study schedules\n• Update courses\n• Generate study plans\n• Answer questions about your schedule\n\nTry saying something like 'Add a math homework due next Friday' or 'Reschedule my study session for CS 101 to tomorrow at 2pm'",
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [useGPT, setUseGPT] = useState(false);
  const [useOllama, setUseOllama] = useState(false);
  const [gptAvailable, setGptAvailable] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('llama3.1');
  const messagesEndRef = useRef(null);

  // Check if GPT and Ollama are available
  useEffect(() => {
    const checkAvailability = async () => {
      // Check GPT
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        try {
          await import('openai');
          setGptAvailable(true);
        } catch (e) {
          setGptAvailable(false);
        }
      } else {
        setGptAvailable(false);
      }

      // Check Ollama
      const ollamaStatus = await checkOllamaAvailability();
      setOllamaAvailable(ollamaStatus.available);
      if (ollamaStatus.available) {
        setOllamaModels(ollamaStatus.models);
        if (ollamaStatus.defaultModel) {
          setSelectedOllamaModel(ollamaStatus.defaultModel);
        }
      }
    };
    checkAvailability();
    
    // Check Ollama periodically in case user starts it
    const interval = setInterval(async () => {
      if (!ollamaAvailable) {
        const status = await checkOllamaAvailability();
        if (status.available) {
          setOllamaAvailable(true);
          setOllamaModels(status.models);
          if (status.defaultModel) {
            setSelectedOllamaModel(status.defaultModel);
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [ollamaAvailable]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      // Parse the natural language request using selected method
      let parser;
      if (useOllama && ollamaAvailable) {
        parser = (req, ctx) => parseWithOllama(req, ctx, selectedOllamaModel);
      } else if (useGPT && gptAvailable) {
        // Dynamically import parseWithLLM to avoid build warnings if openai isn't installed
        const { parseWithLLM } = await import('../utils/aiAgentLLM');
        parser = parseWithLLM;
      } else {
        parser = parseNaturalLanguageRequest;
      }
      
      const actions = await parser(
        userMessage,
        { assignments, courses, studySessions }
      );

      if (actions.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I couldn't understand that request. Could you try rephrasing it? For example:\n• 'Add a physics lab report due December 25th'\n• 'Move my CS 101 study session to tomorrow at 3pm'\n• 'Show me all assignments due this week'",
        }]);
      } else {
        // Separate query/content generation actions from modification actions
        const queryActions = actions.filter(a => a.type === 'query' || a.type === 'generate_study_guide' || a.type === 'analyze_study_patterns');
        const modificationActions = actions.filter(a => a.type !== 'query' && a.type !== 'generate_study_guide' && a.type !== 'analyze_study_patterns');

        // Handle query/content generation actions (just show response)
        if (queryActions.length > 0) {
          const queryResponse = queryActions.map(a => {
            if (a.type === 'generate_study_guide') {
              return `📚 STUDY GUIDE: ${a.data.assignmentTitle || 'Study Guide'}\n\n${a.data.studyGuide || a.data.content || 'Study guide content will be generated here.'}`;
            } else if (a.type === 'analyze_study_patterns') {
              return `📊 STUDY ANALYSIS: ${a.data.course || 'Course'}\n\n${a.data.analysis || a.data.content || 'Analysis will be generated here.'}`;
            } else {
              // Ensure we always show details, even if empty
              const description = a.data?.description || '';
              const details = a.data?.details || '';
              if (description && details) {
                return `${description}\n\n${details}`;
              } else if (description) {
                return description;
              } else if (details) {
                return details;
              } else {
                // Fallback if both are missing
                return 'I couldn\'t find the information you requested. Please try rephrasing your question.';
              }
            }
          }).join('\n\n---\n\n');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: queryResponse,
          }]);
        }

        // Handle modification actions
        if (modificationActions.length > 0) {
          if (modificationActions.some(a => a.requiresConfirmation)) {
            // Show confirmation dialog for actions that need approval
            setPendingActions(modificationActions);
            setOpenConfirmDialog(true);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `I understand! I'll ${modificationActions.map(a => a.description).join(', ')}. Please confirm below.`,
            }]);
          } else {
            // Execute actions immediately
            executeActions(modificationActions);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Done! I've ${modificationActions.map(a => a.description).join(', ')}.`,
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Error processing request:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userRequest: userMessage,
        useOllama,
        useGPT,
        ollamaAvailable,
        gptAvailable,
      });
      
      // If Ollama fails, offer to fall back to rule-based parser
      let errorMessage = `Sorry, I encountered an error: ${error.message}`;
      
      if (useOllama && error.message.includes('not found')) {
        errorMessage += '\n\n📦 To use Ollama:\n1. Install Ollama from https://ollama.ai (it\'s a separate app, not an npm package)\n2. Run: ollama pull llama3.1\n3. Refresh this page\n\nOr disable Ollama mode to use the rule-based parser (works great and is always available!).';
        // Auto-disable Ollama if model not found
        setUseOllama(false);
      } else if (useOllama && (error.message.includes('not running') || error.message.includes('Cannot connect'))) {
        errorMessage += '\n\n📦 Ollama is not running. Install it from https://ollama.ai, then start it and pull a model with: ollama pull llama3.1\n\nOr disable Ollama mode to use the rule-based parser.';
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeActions = (actions) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'add_assignment':
          const newAssignment = {
            id: Date.now().toString() + Math.random(),
            title: action.data.title,
            course: action.data.course,
            dueDate: action.data.dueDate,
            priority: action.data.priority || 'medium',
            description: action.data.description || '',
            createdAt: new Date().toISOString(),
          };
          setAssignments(prev => [...prev, newAssignment]);
          break;

        case 'update_assignment':
          const assignmentToUpdate = assignments.find(a => 
            a.title.toLowerCase().includes(action.data.title?.toLowerCase() || '') ||
            a.id === action.data.id
          );
          if (assignmentToUpdate) {
            const updatedAssignment = { ...assignmentToUpdate, ...action.data };
            
            // If marking as completed, calculate actual time spent
            if (action.data.completed && !updatedAssignment.actualTimeSpent) {
              // Try to get time from study sessions
              const relatedSessions = studySessions.filter(s => 
                s.assignmentTitle === updatedAssignment.title ||
                (s.course === updatedAssignment.course && 
                 new Date(s.startTime) >= new Date(updatedAssignment.createdAt))
              );
              const totalMinutes = relatedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
              if (totalMinutes > 0) {
                updatedAssignment.actualTimeSpent = totalMinutes;
              } else if (action.data.actualTimeSpent) {
                updatedAssignment.actualTimeSpent = action.data.actualTimeSpent;
              }
              
              if (!updatedAssignment.completedAt) {
                updatedAssignment.completedAt = new Date().toISOString();
              }
            }
            
            setAssignments(prev => prev.map(a => 
              a.id === assignmentToUpdate.id 
                ? updatedAssignment
                : a
            ));
          }
          break;

        case 'delete_assignment':
          setAssignments(prev => prev.filter(a => a.id !== action.data.id));
          break;

        case 'add_course':
          const newCourse = {
            id: Date.now().toString() + Math.random(),
            name: action.data.name,
            code: action.data.code || action.data.name,
            instructor: action.data.instructor || '',
            credits: action.data.credits || '',
            days: action.data.days || [],
            startTime: action.data.startTime || new Date().toISOString(),
            endTime: action.data.endTime || new Date().toISOString(),
            location: action.data.location || '',
            createdAt: new Date().toISOString(),
          };
          setCourses(prev => [...prev, newCourse]);
          break;

        case 'update_study_session':
          setStudySessions(prev => prev.map(s => 
            s.id === action.data.id ? { ...s, ...action.data.updates } : s
          ));
          break;

        case 'delete_study_session':
          setStudySessions(prev => prev.filter(s => s.id !== action.data.id));
          break;

        case 'add_study_session':
          const newStudySession = {
            id: Date.now().toString() + Math.random(),
            assignmentTitle: action.data.assignmentTitle || 'Study Session',
            course: action.data.course || 'Unknown Course',
            date: action.data.date || new Date().toISOString().split('T')[0],
            startTime: action.data.startTime || new Date().toISOString(),
            endTime: action.data.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            duration: action.data.duration || 120,
            topic: action.data.topic || '',
            createdAt: new Date().toISOString(),
          };
          setStudySessions(prev => [...prev, newStudySession]);
          break;

        case 'estimate_study_time':
          // Create multiple study sessions based on estimate
          if (action.data.studySessions && Array.isArray(action.data.studySessions)) {
            const studySessions = action.data.studySessions.map((session, idx) => ({
              id: Date.now().toString() + Math.random() + idx,
              assignmentTitle: action.data.assignmentTitle || 'Study Session',
              course: action.data.course || 'Unknown Course',
              date: session.date || new Date().toISOString().split('T')[0],
              startTime: session.startTime || new Date().toISOString(),
              endTime: session.endTime || new Date(Date.now() + (session.duration || 120) * 60 * 1000).toISOString(),
              duration: session.duration || 120,
              topic: session.topic || '',
              createdAt: new Date().toISOString(),
            }));
            setStudySessions(prev => [...prev, ...studySessions]);
          }
          break;

        case 'generate_study_plan':
          // Create study sessions from the plan
          if (action.data.studySessions && Array.isArray(action.data.studySessions)) {
            const planSessions = action.data.studySessions.map((session, idx) => ({
              id: Date.now().toString() + Math.random() + idx,
              assignmentTitle: action.data.assignmentTitle || 'Study Plan',
              course: action.data.course || 'Unknown Course',
              date: session.date || new Date().toISOString().split('T')[0],
              startTime: session.startTime || new Date().toISOString(),
              endTime: session.endTime || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
              duration: session.duration || 180,
              topic: session.topic || '',
              createdAt: new Date().toISOString(),
            }));
            setStudySessions(prev => [...prev, ...planSessions]);
          }
          break;

        case 'add_workout_plan':
          // Create workout events as study sessions (or we could create a separate events system)
          if (action.data.workouts && Array.isArray(action.data.workouts)) {
            const workouts = action.data.workouts.map((workout, idx) => ({
              id: Date.now().toString() + Math.random() + idx,
              assignmentTitle: workout.title || 'Workout',
              course: 'Fitness',
              date: workout.date || new Date().toISOString().split('T')[0],
              startTime: workout.startTime || new Date().toISOString(),
              endTime: workout.endTime || new Date(Date.now() + 90 * 60 * 1000).toISOString(),
              duration: 90,
              topic: 'Workout',
              type: 'workout',
              createdAt: new Date().toISOString(),
            }));
            setStudySessions(prev => [...prev, ...workouts]);
          }
          break;

        case 'add_time_blocks':
          // Create recurring study sessions for time blocks
          if (action.data.pattern === 'daily' && action.data.days) {
            const blocks = [];
            const startDate = new Date(action.data.startDate || new Date());
            const endDate = new Date(action.data.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const dayName = dayNames[d.getDay()];
              if (action.data.days.includes(dayName)) {
                const [hours, minutes] = (action.data.startTime || '10:00').split(':').map(Number);
                const [endHours, endMinutes] = (action.data.endTime || '12:00').split(':').map(Number);
                const startDateTime = new Date(d);
                startDateTime.setHours(hours, minutes, 0, 0);
                const endDateTime = new Date(d);
                endDateTime.setHours(endHours, endMinutes, 0, 0);
                
                blocks.push({
                  id: Date.now().toString() + Math.random() + blocks.length,
                  assignmentTitle: action.data.title || 'Time Block',
                  course: 'Scheduled',
                  date: d.toISOString().split('T')[0],
                  startTime: startDateTime.toISOString(),
                  endTime: endDateTime.toISOString(),
                  duration: (endDateTime - startDateTime) / (60 * 1000),
                  topic: action.data.title || '',
                  type: 'time_block',
                  createdAt: new Date().toISOString(),
                });
              }
            }
            setStudySessions(prev => [...prev, ...blocks]);
          } else if (action.data.pattern === 'weekly' && action.data.dayOfWeek) {
            // Weekly recurring blocks
            const blocks = [];
            const startDate = new Date(action.data.startDate || new Date());
            const endDate = new Date(action.data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const targetDayIndex = dayNames.indexOf(action.data.dayOfWeek.toLowerCase());
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              if (d.getDay() === targetDayIndex) {
                const [hours, minutes] = (action.data.startTime || '10:00').split(':').map(Number);
                const [endHours, endMinutes] = (action.data.endTime || '12:00').split(':').map(Number);
                const startDateTime = new Date(d);
                startDateTime.setHours(hours, minutes, 0, 0);
                const endDateTime = new Date(d);
                endDateTime.setHours(endHours, endMinutes, 0, 0);
                
                blocks.push({
                  id: Date.now().toString() + Math.random() + blocks.length,
                  assignmentTitle: action.data.title || 'Weekly Block',
                  course: 'Scheduled',
                  date: d.toISOString().split('T')[0],
                  startTime: startDateTime.toISOString(),
                  endTime: endDateTime.toISOString(),
                  duration: (endDateTime - startDateTime) / (60 * 1000),
                  topic: action.data.title || '',
                  type: 'time_block',
                  createdAt: new Date().toISOString(),
                });
              }
            }
            setStudySessions(prev => [...prev, ...blocks]);
          }
          break;

        case 'add_event':
          // Create event as a study session entry (or separate event system)
          const newEvent = {
            id: Date.now().toString() + Math.random(),
            assignmentTitle: action.data.title,
            course: action.data.type || 'Event',
            date: action.data.date || new Date().toISOString().split('T')[0],
            startTime: action.data.startTime || new Date().toISOString(),
            endTime: action.data.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            duration: action.data.endTime && action.data.startTime 
              ? (new Date(action.data.endTime) - new Date(action.data.startTime)) / (60 * 1000)
              : 60,
            topic: action.data.description || '',
            type: action.data.type || 'event',
            createdAt: new Date().toISOString(),
          };
          setStudySessions(prev => [...prev, newEvent]);
          break;

        case 'query':
          // For query actions, just show the response
          break;

        default:
          console.warn('Unknown action type:', action.type);
      }
    });
  };

  const handleConfirmActions = () => {
    executeActions(pendingActions);
    setOpenConfirmDialog(false);
    setPendingActions([]);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Confirmed! I've ${pendingActions.map(a => a.description).join(', ')}.`,
    }]);
  };

  const handleCancelActions = () => {
    setOpenConfirmDialog(false);
    setPendingActions([]);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "Cancelled. No changes were made. How else can I help you?",
    }]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', maxHeight: 800 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SmartToy sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                AI Calendar Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask me to manage your schedule in natural language
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {ollamaAvailable && (
              <Button
                variant={useOllama ? "contained" : "outlined"}
                startIcon={<SmartToy />}
                onClick={() => {
                  setUseOllama(!useOllama);
                  if (!useOllama) setUseGPT(false); // Turn off GPT if turning on Ollama
                }}
                sx={{
                  bgcolor: useOllama ? 'primary.main' : 'transparent',
                  borderColor: 'primary.main',
                  color: useOllama ? 'white' : 'primary.main',
                  '&:hover': {
                    bgcolor: useOllama ? 'primary.dark' : 'primary.light',
                    color: 'white',
                  },
                }}
              >
                {useOllama ? 'Using Ollama' : 'Use Ollama'}
              </Button>
            )}
            {gptAvailable && (
              <Button
                variant={useGPT ? "contained" : "outlined"}
                startIcon={<AutoAwesome />}
                onClick={() => {
                  setUseGPT(!useGPT);
                  if (!useGPT) setUseOllama(false); // Turn off Ollama if turning on GPT
                }}
                disabled={useOllama}
                sx={{
                  bgcolor: useGPT ? 'primary.main' : 'transparent',
                  borderColor: 'primary.main',
                  color: useGPT ? 'white' : 'primary.main',
                  '&:hover': {
                    bgcolor: useGPT ? 'primary.dark' : 'primary.light',
                    color: 'white',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                {useGPT ? 'Using GPT' : 'Try GPT'}
              </Button>
            )}
              {!ollamaAvailable && !gptAvailable && (
                <Chip
                  label="Rule-based Parser (Always Available)"
                  color="default"
                  size="small"
                  sx={{ bgcolor: 'grey.200' }}
                />
              )}
          </Box>
        </Box>
        {useOllama && ollamaAvailable && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2">
                <strong>Ollama Mode Active:</strong> Using local LLM with RAG training data.
              </Typography>
              {ollamaModels.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={selectedOllamaModel}
                    label="Model"
                    onChange={(e) => setSelectedOllamaModel(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  >
                    {ollamaModels.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Alert>
        )}
        {useGPT && gptAvailable && !useOllama && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>GPT Mode Active:</strong> Using OpenAI's GPT for better understanding. 
              {process.env.REACT_APP_OPENAI_API_KEY ? '' : ' Note: API key not found. Please set REACT_APP_OPENAI_API_KEY in your .env file.'}
            </Typography>
          </Alert>
        )}
      </Box>

      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          {/* Messages Area */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isProcessing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything about your schedule... (e.g., 'Add a math homework due Friday' or 'Show me assignments due this week')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isProcessing}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                  },
                }}
              >
                <Send />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {useOllama && ollamaAvailable
                  ? `Ollama Mode: Using ${selectedOllamaModel} with RAG training!`
                  : useGPT && gptAvailable 
                  ? 'GPT Mode: I can understand complex requests!' 
                  : 'Tip: Be specific about dates, times, and course names for best results'}
              </Typography>
              {!ollamaAvailable && !gptAvailable && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: '📦 To enable Ollama (FREE, local, no npm install needed):\n\n1. Install Ollama app from https://ollama.ai (it\'s a separate desktop application)\n2. Open terminal and run: ollama pull llama3.1\n3. Make sure Ollama is running (it starts automatically)\n4. Refresh this page - it will auto-detect!\n\n💡 Note: Ollama is NOT an npm package. It\'s a separate application that runs locally.\n\n🤖 To enable GPT (optional, requires API key):\n1. npm install openai\n2. Get API key: https://platform.openai.com/api-keys\n3. Create .env file: REACT_APP_OPENAI_API_KEY=your_key\n4. Restart the app',
                    }]);
                  }}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  How to enable AI?
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelActions}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome />
            Confirm Actions
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            I'm about to make the following changes:
          </Typography>
          <List>
            {pendingActions.map((action, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={action.description}
                  secondary={action.details}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelActions} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmActions}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIAgentView;

