const { Pool } = require('pg');

class BusService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async getAllBuses() {
        const query = 'SELECT * FROM buses ORDER BY departure';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async searchBuses(from, to) {
        const query = `
            SELECT * FROM buses 
            WHERE LOWER(from_stop) = LOWER($1) 
            AND LOWER(to_stop) = LOWER($2)
            ORDER BY departure
        `;
        const result = await this.pool.query(query, [from, to]);
        return result.rows;
    }

    async getBusById(id) {
        const query = 'SELECT * FROM buses WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async getAllRoutes() {
        const query = `
            SELECT DISTINCT from_stop, to_stop, COUNT(*) as bus_count
            FROM buses 
            GROUP BY from_stop, to_stop
            ORDER BY from_stop, to_stop
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async getAllStops() {
        const query = 'SELECT DISTINCT name FROM stops ORDER BY name';
        const result = await this.pool.query(query);
        return result.rows.map(row => row.name);
    }

    async searchBusesForChat(message) {
        // Extract potential location names from message
        const words = message.toLowerCase().split(/\s+/);
        const query = `
            SELECT * FROM buses 
            WHERE LOWER(from_stop) = ANY($1) 
            OR LOWER(to_stop) = ANY($1)
            OR LOWER(name) LIKE ANY($2)
            ORDER BY departure
            LIMIT 10
        `;
        
        const likePatterns = words.map(word => `%${word}%`);
        const result = await this.pool.query(query, [words, likePatterns]);
        return result.rows;
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }
}

module.exports = new BusService();