CREATE TABLE trips
(
  _id serial primary key,
  operator_trip_id varchar,
  status varchar, -- enum ()
  karma int DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE TABLE trip_participants (
  _id serial primary key,
  trip_id integer REFERENCES trips (_id),

  operator_id varchar NOT NULL,
  journey_id varchar NOT NULL,
  operator_class char NOT NULL,

  identity identitytype,

  is_driver boolean NOT NULL,
  start_datetime timestamp with time zone NOT NULL,
  start_position geography NOT NULL,
  start_insee text NOT NULL,
  start_postcodes text[] NOT NULL,
  start_town text NOT NULL,
  start_country text NOT NULL,
  start_territory text NOT NULL,
  start_literal text,

  end_datetime timestamp with time zone NOT NULL,
  end_position geography NOT NULL,
  end_insee text NOT NULL,
  end_postcodes text[] NOT NULL,
  end_town text NOT NULL,
  end_country text NOT NULL,
  end_territory text NOT NULL,
  end_literal text,

  distance int NOT NULL,
  duration int NOT NULL,
  calc_distance int,
  calc_duration int,

  seats int NOT NULL default 1,

-- montant payé hors incitation non listée
  contribution int,

-- montant reçu hors incitation non listée
  revenue int,

-- montant final (+/-) en fonction de la situation
  expense int NULL,

  incentives json[] NOT NULL DEFAULT array[]::json[],
  -- incentives?: IncentiveInterface[];
  payments json[] NOT NULL DEFAULT array[]::json[]
  -- payments?: PaymentInterface[];
  -- campaign id
);
