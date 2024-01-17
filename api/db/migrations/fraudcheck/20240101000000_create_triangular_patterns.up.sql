CREATE SCHEMA IF NOT EXISTS fraudcheck;

CREATE TABLE IF NOT EXISTS fraudcheck.triangular_patterns (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    phone_trunc VARCHAR(20),
    num_participants 
    num_trips FLOAT,
    operator_list VARCHAR(255),
    num_operators INTEGER,
    average_duration FLOAT,
    departure_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    average_daily_trips FLOAT,
    level INTEGER
);
CREATE UNIQUE INDEX ON fraudcheck.triangular_patterns(phone_trunc, departure_date, end_date);