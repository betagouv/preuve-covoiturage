-- TODO make this a MATERIALIZED VIEW with a REFRESH procedure
-- before pushing to production
CREATE OR REPLACE VIEW certificate.identities AS (
  SELECT
    ci.phone AS phone,
    array_agg(cc.identity_id) AS identities
  FROM carpool.carpools AS cc
  JOIN carpool.identities AS ci
  ON cc.identity_id::int = ci._id
  GROUP BY ci.phone
);

-- TODO activate when converted to MATERIALIZED VIEW
-- CREATE INDEX ON certificate.identities (phone);
