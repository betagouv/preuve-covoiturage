CREATE SCHEMA IF NOT EXISTS fraudcheck;

CREATE TABLE IF NOT EXISTS fraudcheck.user_phone_change_history (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    year_month DATE,
    total_changes INTEGER
);
CREATE UNIQUE INDEX ON fraudcheck.triangular_patterns (year_month);