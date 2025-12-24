/**
 * Test script to verify Ollama integration
 * Run with: node test-ollama.js
 */

const testOllamaConnection = async () => {
  console.log('Testing Ollama connection...\n');

  // Test 1: Check if Ollama is running
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama is running!');
      console.log(`Available models: ${data.models?.map(m => m.name).join(', ') || 'None'}\n`);
    } else {
      console.log('❌ Ollama API returned error:', response.statusText);
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to Ollama. Make sure it\'s running on http://localhost:11434');
    console.log('   Install: https://ollama.ai');
    console.log('   Then run: ollama pull llama3.1\n');
    return;
  }

  // Test 2: Try a simple generation
  try {
    console.log('Testing simple generation...');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1',
        prompt: 'Say "Hello, Ollama is working!"',
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Generation test successful!');
      console.log('Response:', data.response?.substring(0, 100) + '...\n');
    } else {
      console.log('❌ Generation test failed:', response.statusText);
    }
  } catch (error) {
    console.log('❌ Generation test error:', error.message);
  }
};

// Run test if fetch is available (Node 18+)
if (typeof fetch !== 'undefined') {
  testOllamaConnection();
} else {
  console.log('This script requires Node.js 18+ with fetch support.');
  console.log('Or install node-fetch: npm install node-fetch');
}

