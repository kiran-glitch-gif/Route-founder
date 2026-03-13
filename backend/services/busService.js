const { Pool } = require('pg');

class BusService {
    constructor() {
        this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    }

    async getAllBuses() {
        const { rows } = await this.pool.query('SELECT * FROM buses ORDER BY departure');
        return rows;
    }

    async searchBuses(from, to) {
        const { rows } = await this.pool.query(
            `SELECT * FROM buses
             WHERE LOWER(from_stop) = LOWER($1)
               AND LOWER(to_stop)   = LOWER($2)
             ORDER BY departure`,
            [from, to]
        );
        return rows;
    }

    async getBusById(id) {
        const { rows } = await this.pool.query(
            'SELECT * FROM buses WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    }

    async getAllRoutes() {
        const { rows } = await this.pool.query(
            `SELECT from_stop, to_stop, COUNT(*) AS bus_count
             FROM buses
             GROUP BY from_stop, to_stop
             ORDER BY from_stop, to_stop`
        );
        return rows;
    }

    async getAllStops() {
        const { rows } = await this.pool.query(
            'SELECT DISTINCT name FROM stops ORDER BY name'
        );
        return rows.map(r => r.name);
    }

    // Used by AI agent to find relevant buses from free-text
    async searchBusesForChat(message) {
        const words = message.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (words.length === 0) return [];
        const likePatterns = words.map(w => `%${w}%`);
        const { rows } = await this.pool.query(
            `SELECT * FROM buses
             WHERE LOWER(from_stop) = ANY($1)
                OR LOWER(to_stop)   = ANY($1)
                OR LOWER(name)      LIKE ANY($2)
             ORDER BY departure
             LIMIT 10`,
            [words, likePatterns]
        );
        return rows;
    }
}

module.exports = new BusService();
