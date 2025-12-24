import { getRelevantExamples, buildRAGPrompt } from './ragKnowledgeBase';

/**
 * Parse natural language using Ollama (local LLM)
 * 
 * Requires: Ollama installed and running locally
 * Default model: llama3.1 (can be changed)
 * 
 * To use:
 * 1. Install Ollama: https://ollama.ai
 * 2. Run: ollama pull llama3.1
 * 3. Make sure Ollama is running (it starts automatically)
 */
export const parseWithOllama = async (request, context, model = 'llama3.1') => {
  try {
    // First, verify the model exists
    const modelsResponse = await fetch('http://localhost:11434/api/tags');
    if (!modelsResponse.ok) {
      throw new Error('Cannot connect to Ollama. Make sure it\'s running on http://localhost:11434');
    }
    
    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.models?.map(m => m.name) || [];
    
    if (!availableModels.includes(model)) {
      // Try to find a similar model or use the first available
      const fallbackModel = availableModels.find(m => m.includes('llama') || m.includes('mistral')) || availableModels[0];
      
      if (!fallbackModel) {
        throw new Error(`Model "${model}" not found. Please run: ollama pull ${model}\n\nAvailable models: ${availableModels.join(', ') || 'None'}`);
      }
      
      console.warn(`Model "${model}" not found, using "${fallbackModel}" instead`);
      model = fallbackModel;
    }
    
    // Get relevant examples for RAG
    const relevantExamples = getRelevantExamples(request, 5);
    
    // Build RAG-enhanced prompt
    const prompt = buildRAGPrompt(request, context, relevantExamples);
    
    // Call Ollama API
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        throw new Error(`Model "${model}" not found. Please run: ollama pull ${model}\n\nAvailable models: ${availableModels.join(', ') || 'None'}`);
      }
      throw new Error(`Ollama API error (${response.status}): ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
    }

    const data = await response.json();
    let responseText = data.response || '';

    // Clean up response - remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON from response
    // Try multiple strategies to extract JSON
    let parsed = null;
    
    // Strategy 1: Find JSON object
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Try to fix common JSON issues
        try {
          const fixed = jsonMatch[0]
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Add quotes to keys if missing
          parsed = JSON.parse(fixed);
        } catch (e2) {
          console.warn('Failed to parse JSON, trying fallback');
        }
      }
    }
    
    // Strategy 2: Try JSON array
    if (!parsed) {
      jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('Failed to parse JSON array');
        }
      }
    }

    // Strategy 3: Try to parse the entire response
    if (!parsed) {
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.warn('Failed to parse entire response as JSON');
      }
    }

    if (parsed) {
      // Handle different response formats
      if (parsed.actions && Array.isArray(parsed.actions)) {
        return parsed.actions;
      } else if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.type) {
        // Single action object
        return [parsed];
      } else if (parsed.action) {
        // Alternative format
        return [parsed.action];
      }
    }

    // Fallback: use rule-based parser
    console.warn('Ollama response not in expected format, falling back to rule-based parser');
    return extractActionsFromText(request, context);
  } catch (error) {
    console.error('Ollama API error:', error);
    
    // If Ollama is not running, provide helpful error
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Ollama is not running. Please start Ollama and make sure it\'s running on http://localhost:11434');
    }
    
    // If it's a model not found error, provide specific instructions
    if (error.message.includes('not found') || error.message.includes('404')) {
      throw error; // Already has helpful message
    }
    
    // For other errors, provide a helpful message and suggest fallback
    throw new Error(`${error.message}\n\nTip: You can disable Ollama mode to use the rule-based parser instead.`);
  }
};

/**
 * Fallback: Extract actions from text response if JSON parsing fails
 * Falls back to rule-based parser
 */
const extractActionsFromText = async (text, context) => {
  // If JSON parsing fails, fall back to rule-based parser
  // Import dynamically to avoid circular dependencies
  const { parseNaturalLanguageRequest } = await import('./aiAgent');
  return parseNaturalLanguageRequest(text, context);
};

/**
 * Check if Ollama is available and running
 */
export const checkOllamaAvailability = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      return {
        available: true,
        models: models.map(m => m.name),
        defaultModel: models.length > 0 ? models[0].name : 'llama3.1',
      };
    }
    
    return { available: false, models: [], defaultModel: null };
  } catch (error) {
    return { available: false, models: [], defaultModel: null };
  }
};

/**
 * Get list of available Ollama models
 */
export const getOllamaModels = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      return data.models?.map(m => m.name) || [];
    }
    return [];
  } catch (error) {
    return [];
  }
};

