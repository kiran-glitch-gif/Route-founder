const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    buildSystemPrompt(busData, context = {}) {
        const currentDate = new Date().toLocaleDateString('en-IN');
        const currentTime = new Date().toLocaleTimeString('en-IN');
        
        return `You are a helpful Tamil Nadu bus schedule agent.
Today is ${currentDate}, current time is ${currentTime}.

Available buses matching the query:
${JSON.stringify(busData, null, 2)}

Rules:
- Always show bus in format: BUS_ID - DEPARTURE_TIME (e.g. SKV-01 - 9:00 PM)
- Mention bus name, type, duration, fare
- If no direct route, suggest connections via intermediate stops
- Be concise and friendly
- Respond in the user's language (Tamil or English)
- Show fare in rupees (₹)
- Mention bus status (on-time/late/cancelled)

Context: ${context.from ? `User is looking for buses from ${context.from} to ${context.to}` : 'General bus inquiry'}`;
    }

    async getChatResponse(message, busData, conversationHistory = [], context = {}) {
        try {
            const systemPrompt = this.buildSystemPrompt(busData, context);
            
            const messages = [
                ...conversationHistory,
                { role: 'user', content: message }
            ];

            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                system: systemPrompt,
                messages: messages
            });

            return response.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error);
            throw new Error('Failed to get AI response');
        }
    }
}

module.exports = new ClaudeService();