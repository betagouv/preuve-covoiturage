CREATE SCHEMA IF NOT EXISTS fraudcheck;

CREATE TABLE IF NOT EXISTS fraudcheck.potential_triangular_patterns (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    group INTEGER,
    phone_trunc VARCHAR(20),
    num_participants INTEGER,
    num_trips INTEGER,
    operator_list INTEGER[],
    num_operators INTEGER,
    average_duration FLOAT,
    departure_date TIMESTAMP,
    end_date TIMESTAMP,
    average_daily_trips FLOAT,
    total_change_percentage FLOAT[],
    total_incentives FLOAT,
    central_participants JSONB,
    intermediate_participants JSONB,
    journey_id_list VARCHAR[]
);

CREATE UNIQUE INDEX on fraudcheck.potential_triangular_patterns on('id', 'group', 'phone_trunc');
