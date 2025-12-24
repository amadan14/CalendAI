/**
 * LLM Integration for AI Agent
 * 
 * FREE OPTIONS:
 * 1. OpenAI API - $5 free credit when you sign up (then pay-as-you-go, very cheap)
 * 2. Hugging Face Inference API - FREE tier available
 * 3. Local models - FREE using transformers.js (runs in browser)
 * 
 * To use OpenAI (easiest, has free credits):
 * 1. Sign up at https://platform.openai.com (get $5 free credit)
 * 2. Get your API key from https://platform.openai.com/api-keys
 * 3. Create a .env file in project root: REACT_APP_OPENAI_API_KEY=your_key_here
 * 4. Install: npm install openai
 * 5. Uncomment the code below and update aiAgent.js to use parseWithLLM
 */

/**
 * Parse natural language using OpenAI's API
 * 
 * COST: ~$0.002 per request (very cheap, and you get $5 free credit initially)
 * Requires: npm install openai
 * Set environment variable: REACT_APP_OPENAI_API_KEY=your_key_here
 * 
 * Get free credits: https://platform.openai.com
 */
export const parseWithLLM = async (request, context) => {
  // Check if OpenAI is available
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Using rule-based parser. Set REACT_APP_OPENAI_API_KEY to use GPT.');
    // Fallback to rule-based parser
    const { parseNaturalLanguageRequest } = await import('./aiAgent');
    return parseNaturalLanguageRequest(request, context);
  }

  try {
    // Dynamic import to avoid errors if package isn't installed
    // Use a function to prevent webpack from statically analyzing this import
    const openaiModule = await import(/* webpackIgnore: true */ 'openai');
    const OpenAI = openaiModule.default || openaiModule.OpenAI;
    
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Only for client-side, use backend in production
    });

    const systemPrompt = `You are an AI calendar assistant. Parse user requests and return JSON actions.
    
Available actions:
- add_assignment: { title, course, dueDate (ISO string), priority (low/medium/high), description }
- update_assignment: { id, updates: { dueDate, priority, title, description } }
- delete_assignment: { id }
- add_course: { name, code, instructor, credits, days, startTime, endTime, location }
- update_study_session: { id, updates: { startTime, endTime, date } }
- delete_study_session: { id }
- query: { description, details }

Current context:
- Assignments: ${JSON.stringify(context.assignments.slice(0, 10))} ${context.assignments.length > 10 ? `... and ${context.assignments.length - 10} more` : ''}
- Courses: ${JSON.stringify(context.courses)}
- Study Sessions: ${JSON.stringify(context.studySessions.slice(0, 10))} ${context.studySessions.length > 10 ? `... and ${context.studySessions.length - 10} more` : ''}

Return ONLY valid JSON in this format:
{
  "actions": [
    {
      "type": "add_assignment",
      "data": {
        "title": "Math Homework",
        "course": "MATH 201",
        "dueDate": "2024-12-25T23:59:59.999Z",
        "priority": "medium",
        "description": ""
      },
      "description": "add assignment 'Math Homework'",
      "requiresConfirmation": true
    }
  ]
}

Be smart about dates - if user says "next Friday", calculate the actual date. Use ISO 8601 format for dates.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cheaper than gpt-4, still very good
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.actions || [];
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to rule-based parser if API fails
    return [];
  }
};

/**
 * Alternative: Use a backend API endpoint
 * This is the recommended approach for production
 */
export const parseWithBackendAPI = async (request, context) => {
  try {
    const response = await fetch('/api/ai-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.actions || [];
  } catch (error) {
    console.error('Backend API error:', error);
    throw error;
  }
};

