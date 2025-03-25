/**
 * AI Assistant service that handles communication with the GPT-4o API
 */

// Function to check if the API key is valid
const isValidApiKey = (apiKey) => {
  return typeof apiKey === 'string' && apiKey.startsWith('sk-') && apiKey.length > 40;
};

// Store the API key in memory (would be better to use a more secure method in production)
let API_KEY = "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";

/**
 * Set the API key for the AI service
 * @param {string} apiKey - The OpenAI API key
 * @returns {boolean} - Whether the key was valid and set successfully
 */
export const setApiKey = (apiKey) => {
  if (isValidApiKey(apiKey)) {
    API_KEY = apiKey;
    localStorage.setItem('ai_api_key_set', 'true'); // Just store that a key was set, not the actual key
    return true;
  }
  return false;
};

/**
 * Check if an API key has been set
 * @returns {boolean} - Whether an API key has been set
 */
export const hasApiKey = () => {
  return API_KEY !== null || localStorage.getItem('ai_api_key_set') === 'true';
};

/**
 * Clear the stored API key
 */
export const clearApiKey = () => {
  API_KEY = null;
  localStorage.removeItem('ai_api_key_set');
};

/**
 * Send a message to the AI and get a response
 * 
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options
 * @param {Function} options.onChunk - Callback for receiving streaming chunks
 * @param {boolean} options.stream - Whether to stream the response
 * @returns {Promise<Object>} - The complete response
 */
export const sendMessage = async (messages, options = {}) => {
  const { onChunk, stream = true } = options;
  
  if (!API_KEY) {
    throw new Error('API key not set. Please set your OpenAI API key first.');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        stream: stream,
        temperature: 0.7,
        max_tokens: 1200
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error communicating with OpenAI API');
    }
    
    // Handle streaming response
    if (stream && onChunk && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let completeResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        buffer += chunk;
        
        // Process complete lines from the buffer
        let lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || '';
              if (content) {
                completeResponse += content;
                onChunk(content);
              }
            } catch (error) {
              console.warn('Error parsing streaming response:', error);
            }
          }
        }
      }
      
      return { 
        content: completeResponse,
        role: 'assistant'
      };
    } 
    // Handle non-streaming response
    else {
      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content,
        role: 'assistant'
      };
    }
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error(error.message || 'An error occurred while communicating with the AI service');
  }
};

/**
 * Generate a test response for debugging without using the API
 * @param {string} message - The input message 
 * @returns {Promise<Object>} - A fake response
 */
export const generateTestResponse = async (message) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const responses = [
    `That's an interesting question about "${message.substring(0, 30)}...". Let me think about it...`,
    `I'd be happy to help with your question about "${message.substring(0, 30)}...".`,
    `Here's a formula for you: $E = mc^2$`,
    `Let me explain with some code:
\`\`\`python
def calculate_answer(question):
    return "The answer is 42"
\`\`\``,
    `Here's how I would approach this problem:
1. First, understand the question
2. Then, analyze the components
3. Finally, synthesize an answer`,
  ];
  
  return {
    content: responses[Math.floor(Math.random() * responses.length)],
    role: 'assistant'
  };
}; 