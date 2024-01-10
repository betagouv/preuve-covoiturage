CREATE SCHEMA IF NOT EXISTS fraudcheck;

CREATE TABLE IF NOT EXISTS fraudcheck.users_3_months_patterns (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    phone_trunc VARCHAR(20),
    total_incentives FLOAT,
    triangular BOOLEAN,
    has_night_time BOOLEAN,
    night_time_percentage FLOAT,
    occupancy_rate_exceeded BOOLEAN,
    average_seats FLOAT
);

CREATE UNIQUE INDEX ON fraudcheck.users_3_months_patterns('id','phone_trunc');