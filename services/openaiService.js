const axios = require('axios');

class OpenRouterService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseUrl = 'https://openrouter.ai/api/v1';
        
        // Model configurations for OpenRouter
        this.modelConfigs = {
            'google/gemini-2.5-flash': {
                maxTokens: 1000000,
                responseTokens: 8000
            },
            'anthropic/claude-3.5-sonnet': {
                maxTokens: 200000,
                responseTokens: 4000
            },
            'google/gemini-pro-1.5': {
                maxTokens: 2000000,
                responseTokens: 8000
            }
        };
        
        this.defaultModel = 'google/gemini-2.5-flash';
    }

    async getResponse(context, question) {
        try {
            const modelName = this.defaultModel;
            
            // Clean and validate content before sending to OpenRouter
            const cleanContext = this.sanitizeContent(context);
            const cleanQuestion = this.sanitizeContent(question);
            
            // Only log for errors or first request
            if (process.env.NODE_ENV === 'development') {
                console.log(`🤖 AI Request: ${cleanContext.length.toLocaleString()} chars, Model: ${modelName}`);
            }
            
            const messages = [
                {
                    role: "system",
                    content: `You are a helpful AI chatbot assistant that provides friendly, conversational responses about website content. Your goal is to be helpful, accurate, and easy to understand.

## RESPONSE STYLE:
- Use a conversational, friendly tone like a knowledgeable assistant
- Provide clear, direct answers without being overly formal
- Use natural language that flows well in a chat interface
- Be concise but informative - avoid walls of text
- Use markdown formatting for better readability (##, **, bullet points)

## RESPONSE STRUCTURE:
**For Simple Questions:**
- Give a direct answer in 1-2 sentences
- Add brief context if helpful
- Include relevant links naturally

**For Complex Questions:**
- Start with a clear answer
- Use ## headers to organize information
- Use bullet points for lists
- Include relevant details in a structured way

**For Detailed Requests:**
- Provide comprehensive information
- Use clear sections with ## headers
- Include all relevant data points
- Maintain readability with good formatting

## FORMATTING GUIDELINES:
- Use ## for main headers
- Use ** for emphasis/bold text
- Use bullet points (•) for lists
- Include links as [text](url) when available
- Keep paragraphs short and readable
- Use line breaks for better spacing

## CORE PRINCIPLES:
- Only use information from the provided website content
- Be accurate and never make up information
- Include relevant links when available
- Match the user's tone (casual vs formal)
- Focus on what the user actually asked
- If information isn't available, say so clearly

## CHATBOT PERSONALITY:
- Helpful and knowledgeable
- Professional but approachable
- Clear and concise
- Focused on user needs
- Friendly without being overly casual

Remember: You're a chatbot assistant, so keep responses conversational and well-formatted for easy reading in a chat interface.`
                },
                {
                    role: "user",
                    content: `Website Content:\n${cleanContext}\n\nUser Question: ${cleanQuestion}\n\nResponse Guidelines:\n- Provide helpful, conversational responses that directly answer the user's question\n- Use natural language and maintain a friendly, professional tone\n- Format responses with clear structure using markdown-style formatting (##, **, bullet points)\n- Include relevant links in [text](url) format when available\n- Keep responses concise but informative\n- Avoid overly technical jargon unless specifically requested\n- If the question is simple, provide a direct answer; if complex, provide structured analysis\n- Always base responses strictly on the provided website content\n\nPlease respond in a natural, conversational manner that would work well in a chatbot interface.`
                }
            ];

            // Validate request payload before sending
            const requestPayload = {
                model: modelName,
                messages: messages,
                temperature: 0.3,
                max_tokens: 4000,
                top_p: 0.9,
                stream: false
            };

            const response = await axios.post(`${this.baseUrl}/chat/completions`, requestPayload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://chatflow-ai.com',
                    'X-Title': 'ChatFlow AI'
                },
                timeout: 60000 // 60 second timeout
            });

            const aiResponse = response.data.choices[0].message.content;
            
            return aiResponse;
        } catch (error) {
            console.error('❌ OpenRouter Error:', error.response?.status || error.message);
            
            // Enhanced error handling for OpenRouter
            if (error.response?.status === 401) {
                throw new Error('Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY configuration.');
            } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a moment.');
            } else if (error.response?.status === 402) {
                throw new Error('OpenRouter API quota exceeded. Please check your billing settings.');
            } else if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.error?.message || 'Request format error. The content may contain invalid characters.';
                throw new Error(`Request format error: ${errorMsg}`);
            } else if (error.response?.status === 413) {
                // If context is too long, try with a model that supports larger context
                console.log('Context too long, trying with Google Gemini Pro 1.5...');
                return this.getResponseWithLargerContext(cleanContext, cleanQuestion);
            } else {
                console.error('Full error details:', error.response?.data || error.message);
                throw new Error('OpenRouter AI service temporarily unavailable. Please try again later.');
            }
        }
    }

    async getResponseWithLargerContext(context, question) {
        try {
            const modelName = "google/gemini-pro-1.5";
            
            // Minimal logging for fallback
            
            const messages = [
                {
                    role: "system",
                    content: `You are a helpful AI chatbot assistant that provides friendly, conversational responses about website content. Your goal is to be helpful, accurate, and easy to understand.

## RESPONSE STYLE:
- Use a conversational, friendly tone like a knowledgeable assistant
- Provide clear, direct answers without being overly formal
- Use natural language that flows well in a chat interface
- Be concise but informative - avoid walls of text
- Use markdown formatting for better readability (##, **, bullet points)

## RESPONSE STRUCTURE:
**For Simple Questions:**
- Give a direct answer in 1-2 sentences
- Add brief context if helpful
- Include relevant links naturally

**For Complex Questions:**
- Start with a clear answer
- Use ## headers to organize information
- Use bullet points for lists
- Include relevant details in a structured way

**For Detailed Requests:**
- Provide comprehensive information
- Use clear sections with ## headers
- Include all relevant data points
- Maintain readability with good formatting

## FORMATTING GUIDELINES:
- Use ## for main headers
- Use ** for emphasis/bold text
- Use bullet points (•) for lists
- Include links as [text](url) when available
- Keep paragraphs short and readable
- Use line breaks for better spacing

## CORE PRINCIPLES:
- Only use information from the provided website content
- Be accurate and never make up information
- Include relevant links when available
- Match the user's tone (casual vs formal)
- Focus on what the user actually asked
- If information isn't available, say so clearly

## CHATBOT PERSONALITY:
- Helpful and knowledgeable
- Professional but approachable
- Clear and concise
- Focused on user needs
- Friendly without being overly casual

Remember: You're a chatbot assistant, so keep responses conversational and well-formatted for easy reading in a chat interface.`
                },
                {
                    role: "user",
                    content: `Website Content:\n${cleanContext}\n\nUser Question: ${cleanQuestion}\n\nResponse Guidelines:\n- Provide helpful, conversational responses that directly answer the user's question\n- Use natural language and maintain a friendly, professional tone\n- Format responses with clear structure using markdown-style formatting (##, **, bullet points)\n- Include relevant links in [text](url) format when available\n- Keep responses concise but informative\n- Avoid overly technical jargon unless specifically requested\n- If the question is simple, provide a direct answer; if complex, provide structured analysis\n- Always base responses strictly on the provided website content\n\nPlease respond in a natural, conversational manner that would work well in a chatbot interface.`
                }
            ];

            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model: modelName,
                messages: messages,
                temperature: 0.3,
                max_tokens: 8000,
                top_p: 0.9
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://chatflow-ai.com',
                    'X-Title': 'ChatFlow AI'
                }
            });

            const aiResponse = response.data.choices[0].message.content;
            
            return aiResponse;
        } catch (error) {
            console.error('Larger Context Model API Error:', error);
            throw new Error('AI service temporarily unavailable. Please try again later.');
        }
    }

    sanitizeContent(content) {
        if (!content || typeof content !== 'string') {
            return '';
        }
        
        try {
            let sanitized = content
                // Remove or replace problematic Unicode characters
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
                // Replace smart quotes and dashes with regular ones
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201C\u201D]/g, '"')
                .replace(/[\u2013\u2014]/g, '-')
                .replace(/\u2026/g, '...')
                // Remove emojis and other problematic Unicode ranges
                .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
                // Remove other problematic characters
                .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, '')
                // Remove excessive whitespace
                .replace(/\s+/g, ' ')
                .trim();
            
            // Ensure valid UTF-8 encoding
            sanitized = sanitized.normalize('NFC');
            
            // Additional validation - check for remaining problematic characters
            if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(sanitized)) {
                console.warn('⚠️ Still contains control characters after sanitization');
                sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
            }
            
            return sanitized;
        } catch (error) {
            console.error('Error sanitizing content:', error);
            // Fallback: return basic ASCII-only content
            return content.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    buildPrompt(context, question) {
        return `Website Content:
${context}

User Question: ${question}

Response Guidelines:
- Provide helpful, conversational responses that directly answer the user's question
- Use natural language and maintain a friendly, professional tone
- Format responses with clear structure using markdown-style formatting (##, **, bullet points)
- Include relevant links in [text](url) format when available
- Keep responses concise but informative
- Avoid overly technical jargon unless specifically requested
- If the question is simple, provide a direct answer; if complex, provide structured analysis
- Always base responses strictly on the provided website content

Please respond in a natural, conversational manner that would work well in a chatbot interface.`;
    }
}

module.exports = new OpenRouterService();