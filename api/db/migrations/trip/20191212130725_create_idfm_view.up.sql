DROP VIEW IF EXISTS trip.idfm;
CREATE VIEW trip.idfm AS (
  SELECT
    oo._id::int as operator_id,
    oo.name as operator,
    te.journey_id as rpc_id,
    SPLIT_PART(aa.journey_id, ':', 2) as journey_id,
    trip_id,
    journey_start_datetime,
    journey_start_insee,
    journey_end_datetime,
    journey_end_insee,
    journey_distance,
    journey_duration,
    (case
      when driver_card is not null
      then 'Oui'
      else 'Non'
     end) as driver_card,
    (case
      when passenger_card is not null
      then 'Oui'
      else 'Non'
     end) as passenger_card,
    operator_class,
    (case
      when passenger_over_18 = TRUE then 'Oui'
      when passenger_over_18 = FALSE then 'Non'
      else 'NC'
     end)as passenger_over_18,
    passenger_seats
  FROM trip.export as te
  JOIN acquisition.acquisitions as aa ON te.journey_id::int = aa._id
  JOIN operator.operators as oo ON te.operator_id::int = oo._id
  WHERE (journey_start_insee='75056' and journey_end_insee='75056') = FALSE
  AND start_territory_id = '239'
  AND end_territory_id = '239'
  AND journey_distance > 2000
);
