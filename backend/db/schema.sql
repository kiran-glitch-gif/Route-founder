-- Database schema for Bus Schedule Agent

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stops table
CREATE TABLE stops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lat FLOAT,
    lng FLOAT,
    district VARCHAR(100)
);

-- Buses table
CREATE TABLE buses (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    from_stop VARCHAR(255) NOT NULL,
    to_stop VARCHAR(255) NOT NULL,
    departure TIME NOT NULL,
    arrival TIME NOT NULL,
    duration VARCHAR(20),
    type VARCHAR(50) DEFAULT 'Ordinary',
    status VARCHAR(20) DEFAULT 'on-time',
    operator VARCHAR(255),
    stops JSONB,
    days JSONB DEFAULT '["Daily"]',
    fare INTEGER
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_buses_route ON buses(from_stop, to_stop);
CREATE INDEX idx_buses_departure ON buses(departure);
CREATE INDEX idx_stops_name ON stops(name);