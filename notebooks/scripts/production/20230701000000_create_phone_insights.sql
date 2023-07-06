CREATE SCHEMA IF NOT EXISTS fraudcheck;

CREATE TABLE IF NOT EXISTS fraudcheck.phone_insights (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    phone_trunc VARCHAR(20),
    departure_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    num_days INTEGER,
    average_duration FLOAT,
    average_distance FLOAT,
    total_incentives FLOAT,
    average_trip_count FLOAT,
    num_operators INTEGER,
    driver_trip_percentage FLOAT,
    role_change BOOLEAN,
    intraday_change_count INTEGER,
    total_change_count INTEGER,
    intraday_change_percentage FLOAT,
    total_change_percentage FLOAT,
    carpool_days INTEGER,
    carpool_day_list VARCHAR(255),
    trip_id_list VARCHAR(255),
    operator_list VARCHAR(255)
);

CREATE UNIQUE INDEX on fraudcheck.phone_insights on('phone_trunc', 'departure_date', 'end_date');
