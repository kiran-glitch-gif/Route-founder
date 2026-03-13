const Anthropic = require('@anthropic-ai/sdk');

/**
 * Multi-Agent Orchestrator
 * Runs an agentic loop: Claude calls tools → tools return live data → Claude answers.
 *
 * Tools available to the agent:
 *   get_bus_location        — live GPS + status for a bus
 *   search_buses            — find buses between two stops
 *   get_route_stops         — intermediate stops for a bus
 *   calculate_eta           — ETA at a specific stop
 *   get_delay_alerts        — current delay/cancellation alerts
 *   suggest_alternative_route — alternatives when a bus is late/cancelled
 */
class AgentOrchestrator {
    constructor() {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        this.model     = 'claude-sonnet-4-20250514';

        this.tools = [
            {
                name: 'get_bus_location',
                description: 'Get the current real-time GPS location, speed, and status of a specific bus',
                input_schema: {
                    type: 'object',
                    properties: {
                        bus_id: { type: 'string', description: 'Bus ID e.g. SKV-01' }
                    },
                    required: ['bus_id']
                }
            },
            {
                name: 'search_buses',
                description: 'Search for all buses operating between two stops',
                input_schema: {
                    type: 'object',
                    properties: {
                        from: { type: 'string', description: 'Departure stop name' },
                        to:   { type: 'string', description: 'Destination stop name' }
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
                        bus_id: { type: 'string', description: 'Bus ID' }
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
                        bus_id:    { type: 'string', description: 'Bus ID' },
                        stop_name: { type: 'string', description: 'Stop name to calculate ETA for' }
                    },
                    required: ['bus_id', 'stop_name']
                }
            },
            {
                name: 'get_delay_alerts',
                description: 'Get all current delay or cancellation alerts, optionally filtered by route',
                input_schema: {
                    type: 'object',
                    properties: {
                        route: { type: 'string', description: 'Optional route filter e.g. "Chennai"' }
                    }
                }
            },
            {
                name: 'suggest_alternative_route',
                description: 'Suggest alternative buses when a bus is delayed or cancelled',
                input_schema: {
                    type: 'object',
                    properties: {
                        from:          { type: 'string', description: 'Departure stop' },
                        to:            { type: 'string', description: 'Destination stop' },
                        avoid_bus_id:  { type: 'string', description: 'Bus ID to avoid' }
                    },
                    required: ['from', 'to']
                }
            }
        ];
    }

    async _executeTool(name, input, busTracker) {
        switch (name) {
            case 'get_bus_location': {
                const loc = busTracker.getBusLocation(input.bus_id);
                return loc || { error: `Bus ${input.bus_id} not found` };
            }
            case 'search_buses': {
                const buses = busTracker.searchBuses(input.from, input.to);
                return { buses, count: buses.length };
            }
            case 'get_route_stops': {
                const bus = busTracker.getBusLocation(input.bus_id);
                return bus
                    ? { stops: bus.stops, current_stop: bus.currentStop, next_stop: bus.nextStop }
                    : { error: 'Bus not found' };
            }
            case 'calculate_eta':
                return busTracker.calculateETA(input.bus_id, input.stop_name);
            case 'get_delay_alerts': {
                const alerts = busTracker.getAlerts(input.route);
                return { alerts, count: alerts.length };
            }
            case 'suggest_alternative_route': {
                const alternatives = busTracker.getAlternatives(input.from, input.to, input.avoid_bus_id);
                return { alternatives, count: alternatives.length };
            }
            default:
                return { error: `Unknown tool: ${name}` };
        }
    }

    /**
     * Agentic loop — runs until Claude produces a final text answer or hits MAX_ITERATIONS.
     */
    async runAgent(userMessage, conversationHistory = [], busTracker, context = {}) {
        const systemPrompt = this._buildSystemPrompt(context);
        const messages = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        let toolsUsed = 0;
        const MAX_ITERATIONS = 6;

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const response = await this.anthropic.messages.create({
                model:      this.model,
                max_tokens: 1500,
                system:     systemPrompt,
                tools:      this.tools,
                messages
            });

            // Final answer
            if (response.stop_reason === 'end_turn') {
                const text = response.content.find(b => b.type === 'text');
                return { response: text ? text.text : 'Done.', toolsUsed };
            }

            // Tool calls
            if (response.stop_reason === 'tool_use') {
                messages.push({ role: 'assistant', content: response.content });

                const toolResults = [];
                for (const block of response.content) {
                    if (block.type === 'tool_use') {
                        console.log(`🤖 Agent → ${block.name}(${JSON.stringify(block.input)})`);
                        const result = await this._executeTool(block.name, block.input, busTracker);
                        toolResults.push({
                            type:        'tool_result',
                            tool_use_id: block.id,
                            content:     JSON.stringify(result)
                        });
                        toolsUsed++;
                    }
                }

                messages.push({ role: 'user', content: toolResults });
            }
        }

        return { response: 'Reached maximum steps. Please try a simpler query.', toolsUsed };
    }

    _buildSystemPrompt(context) {
        const now = new Date();
        return `You are a smart Tamil Nadu bus tracking AI agent with real-time data access.
Current time: ${now.toLocaleTimeString('en-IN')} | Date: ${now.toLocaleDateString('en-IN')}

You have tools to look up live bus locations, search routes, calculate ETAs, get delay alerts, and suggest alternatives.

Rules:
- Always call tools to get real data before answering — never guess
- Show every bus as: BUS_ID - DEPARTURE_TIME  (e.g. SKV-01 - 9:00 PM)
- Include live status (on-time / late / cancelled) with every bus
- If a bus is late, proactively suggest alternatives using the tool
- Show fare in ₹ (rupees)
- Be concise and friendly
- Respond in the user's language (Tamil or English)
${context.from ? `\nUser context: route from ${context.from} to ${context.to}` : ''}`;
    }
}

module.exports = new AgentOrchestrator();
