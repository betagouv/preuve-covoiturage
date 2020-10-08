
-- used only for temporary territories_view
DROP MATERIALIZED VIEW IF EXISTS territory.territories_view;
DROP TABLE IF EXISTS territory.territories_view CASCADE;

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

DROP FUNCTION IF EXISTS breadcrumb_to_json; 
CREATE OR REPLACE FUNCTION breadcrumb_to_json(bc territory.breadcrumb) returns json as $$
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

DROP FUNCTION IF EXISTS json_to_breadcrumb; 
CREATE OR REPLACE FUNCTION json_to_breadcrumb(bc json) returns territory.breadcrumb as $$
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
