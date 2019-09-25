CREATE INDEX ON trip_participants (((identity).phone));
CREATE UNIQUE INDEX ON trip_participants(trip_id, ((identity).phone));

CREATE INDEX ON trip_participants (start_datetime);
CREATE INDEX ON trip_participants (distance);
CREATE INDEX ON trip_participants (operator_class);
CREATE INDEX ON trip_participants (start_territory);
CREATE INDEX ON trip_participants (end_territory);
CREATE INDEX ON trip_participants (start_town);
CREATE INDEX ON trip_participants (end_town);
CREATE INDEX ON trip_participants (operator_id);
