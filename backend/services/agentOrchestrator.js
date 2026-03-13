const Anthropic = require('@anthropic-ai/sdk');

/**
 * Multi-Agent Orchestrator
 * Manages specialized AI agents for different tasks:
 * - TrackingAgent: Monitors bus positions and delays
 * - RouteAgent: Answers route and schedule questions
 * - AlertAgent: Sends delay/cancellation notifications
 * - PlannerAgent: Suggests optimal travel plans
 */
class AgentOrchestrator {
    constructor() {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        this.model = 'claude-sonnet-4-20250514';

        // Define tools each agent can use
        this.tools = [
            {
                name: 'get_bus_location',
                description: 'Get the current real-time location and status of a specific bus',
                input_schema: {
                    type: 'object',
                    properties: {
                        bus_id: { type: 'string', description: 'The bus ID e.g. SKV-01' }
                    },
                    required: ['bus_id']
                }
            },
            {
                name: 'search_buses',
                description: 'Search for buses between two stops',
                input_schema: {
                    type: 'object',
                    properties: {
                        from: { type: 'string', description: 'Departure stop name' },
                        to: { type: 'string', description: 'Destination stop name' }
                    },
                    required: ['from', 'to']
                }
            },
            {
                name: 'get_route_stops',
                description: 'Get all intermediate stops for a bus route',
                input_schema: {
                    type: 'object',
                    properties: {
                        bus_id: { type: 'string', description: 'The bus ID' }
                    },
                    required: ['bus_id']
                }
            },
            {
                name: 'calculate_eta',
                description: 'Calculate estimated time of arrival for a bus at a specific stop',
                input_schema: {
                    type: 'object',
                    properties: {
                        bus_id: { type: 'string', description: 'The bus ID' },
                        stop_name: { type: 'string', description: 'The stop to calculate ETA for' }
                    },
                    required: ['bus_id', 'stop_name']
                }
            },
            {
                name: 'get_delay_alerts',
                description: 'Get all current delay or cancellation alerts',
                input_schema: {
                    type: 'object',
                    properties: {
                        route: { type: 'string', description: 'Optional: filter by route' }
                    }
                }
            },
            {
                name: 'suggest_alternative_route',
                description: 'Suggest alternative routes if a bus is delayed or cancelled',
                input_schema: {
                    type: 'object',
                    properties: {
                        from: { type: 'string' },
                        to: { type: 'string' },
                        avoid_bus_id: { type: 'string', description: 'Bus ID to avoid' }
                    },
                    required: ['from', 'to']
                }
            }
        ];
    }

    // Execute tool calls made by the AI agent
    async executeTool(toolName, toolInput, busTracker) {
        switch (toolName) {
            case 'get_bus_location': {
                const loc = busTracker.getBusLocation(toolInput.bus_id);
                return loc || { error: `Bus ${toolInput.bus_id} not found` };
            }
            case 'search_buses': {
                const buses = busTracker.searchBuses(toolInput.from, toolInput.to);
                return { buses, count: buses.length };
            }
            case 'get_route_stops': {
                const bus = busTracker.getBusLocation(toolInput.bus_id);
                return bus ? { stops: bus.stops, current_stop: bus.currentStop } : { error: 'Bus not found' };
            }
            case 'calculate_eta': {
                const eta = busTracker.calculateETA(toolInput.bus_id, toolInput.stop_name);
                return eta;
            }
            case 'get_delay_alerts': {
                const alerts = busTracker.getAlerts(toolInput.route);
                return { alerts, count: alerts.length };
            }
            case 'suggest_alternative_route': {
                const alternatives = busTracker.getAlternatives(toolInput.from, toolInput.to, toolInput.avoid_bus_id);
                return { alternatives };
            }
            default:
                return { error: `Unknown tool: ${toolName}` };
        }
    }

    // Main agentic loop — runs until the agent produces a final answer
    async runAgent(userMessage, conversationHistory = [], busTracker, context = {}) {
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        let response;
        let iterations = 0;
        const MAX_ITERATIONS = 5;

        while (iterations < MAX_ITERATIONS) {
            iterations++;

            response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 1500,
                system: systemPrompt,
                tools: this.tools,
                messages
            });

            // If agent is done, return the text response
            if (response.stop_reason === 'end_turn') {
                const textBlock = response.content.find(b => b.type === 'text');
                return {
                    response: textBlock ? textBlock.text : 'Done.',
                    toolsUsed: messages.filter(m => m.role === 'tool').length
                };
            }

            // Process tool calls
            if (response.stop_reason === 'tool_use') {
                // Add assistant's tool_use message
                messages.push({ role: 'assistant', content: response.content });

                // Execute each tool and collect results
                const toolResults = [];
                for (const block of response.content) {
                    if (block.type === 'tool_use') {
                        console.log(`🤖 Agent calling tool: ${block.name}`, block.input);
                        const result = await this.executeTool(block.name, block.input, busTracker);
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: block.id,
                            content: JSON.stringify(result)
                        });
                    }
                }

                // Feed tool results back to agent
                messages.push({ role: 'user', content: toolResults });
            }
        }

        return { response: 'I reached the maximum number of steps. Please try a simpler query.', toolsUsed: iterations };
    }

    buildSystemPrompt(context) {
        const now = new Date();
        return `You are a smart Tamil Nadu bus tracking AI agent with real-time data access.
Current time: ${now.toLocaleTimeString('en-IN')} | Date: ${now.toLocaleDateString('en-IN')}

You have access to tools to:
- Look up live bus locations and status
- Search bus routes
- Calculate ETAs
- Get delay alerts
- Suggest alternative routes

Rules:
- Always use tools to get real data before answering
- Show bus format: BUS_ID - DEPARTURE_TIME (e.g. SKV-01 - 9:00 PM)
- Include live status (on-time/late/cancelled) with every bus mention
- If a bus is late, proactively suggest alternatives
- Be concise and friendly
- Respond in the user's language (Tamil or English)
- Show fare in ₹ (rupees)

${context.from ? `User context: Tracking route from ${context.from} to ${context.to}` : ''}`;
    }
}

module.exports = new AgentOrchestrator();
