
-- used only for temporary territories_view
-- DROP MATERIALIZED VIEW IF EXISTS territory.territories_view;

DROP TYPE IF EXISTS territory.breadcrumb CASCADE; 

CREATE TYPE territory.breadcrumb AS (
  country varchar,
  countrygroup varchar,
  district varchar,
  megalopolis varchar,
  other varchar,
  region varchar,
  state varchar,
  town varchar,
  towngroup varchar
);


DROP TYPE IF EXISTS breadcrumb_to_json; 

create or replace function breadcrumb_to_json(bc territory.breadcrumb) returns json as $$
  select json_build_object(
    'country', $1.country
  , 'countrygroup', $1.countrygroup
  , 'district', $1.district
  , 'megalopolis', $1.megalopolis
  , 'other', $1.other
  , 'region', $1.region
  , 'state', $1.state
  , 'town', $1.town
  , 'towngroup', $1.towngroup
 
  );
$$ language sql;

CREATE CAST (territory.breadcrumb as json) with function breadcrumb_to_json(bc territory.breadcrumb) as assignment;

DROP TYPE IF EXISTS json_to_breadcrumb; 

create or replace function json_to_breadcrumb(bc json) returns territory.breadcrumb as $$
  select ROW(
    $1->>'country',
    $1->>'countrygroup',
    $1->>'district',
    $1->>'megalopolis',
    $1->>'other',
    $1->>'region',
    $1->>'state',
    $1->>'town',
    $1->>'towngroup')::territory.breadcrumb;
$$ language sql;

create cast (json as territory.breadcrumb) with function json_to_breadcrumb(_ti json) as assignment;


DROP TABLE IF EXISTS territory.territories_view;

  CREATE TABLE IF NOT EXISTS territory.territories_view
(
  _id serial primary key,
  active boolean NOT NULL DEFAULT false,
  activable boolean NOT NULL DEFAULT false,
  
  
  level territory.territory_level_enum NOT NULL,
  
  parent integer DEFAULT NULL,
  children integer[] DEFAULT array[]::integer[],
  ancestors integer[] DEFAULT array[]::integer[],
  descendants integer[] DEFAULT array[]::integer[],
  insee varchar[] DEFAULT array[]::varchar[],
  postcode varchar[] DEFAULT array[]::varchar[],
  codedep varchar[] DEFAULT array[]::varchar[],
  breadcrumb territory.breadcrumb DEFAULT NULL

);

CREATE INDEX ON territory.territories_view (_id);


