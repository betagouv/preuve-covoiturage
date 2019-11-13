CREATE TABLE IF NOT EXISTS territory.territory_operators
(
  territory_id integer NOT NULL REFERENCES territory.territories (_id),
  operator_id integer NOT NULL
);

CREATE INDEX ON territory.territory_operators(territory_id);
CREATE INDEX ON territory.territory_operators(operator_id);

CREATE UNIQUE INDEX ON territory.territory_operators (territory_id, operator_id);
