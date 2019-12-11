-- schema now has an exclusiveMinimum of 0
-- trip.export view will use the calculated value of distance if this one is NULL
-- previously, operators could set the distance at 0.
UPDATE carpool.carpools SET distance = NULL WHERE distance = 0;
