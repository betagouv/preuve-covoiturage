#!/usr/bin/env bash

DATE=$(date +%Y%m%d%H%M%S)
FOLDER=/tmp
FILENAME="csv-journeys-$DATE.csv"
OPENDATA_FILENAME="csv-journeys-$DATE-opendata.csv"
TRANSFERSH_SERVER=http://shared.dotify.eu:8080

dbclient-fetcher mongo 4.0
mongoexport \
    --uri $MONGO_URL \
    --collection=journeys \
    --type=csv \
    --forceTableScan \
    --fields='_id,operator_class,status,passenger.distance,passenger.duration,passenger.cost,passenger.incentive,passenger.remaining_fee,passenger.contribution,passenger.seats,passenger.start.postcodes.0,passenger.start.datetime,passenger.start.lon,passenger.start.lat,passenger.start.literal,passenger.start.country,passenger.end.postcodes.0,passenger.end.datetime,passenger.end.lon,passenger.end.lat,passenger.end.literal,passenger.end.country,driver.distance,driver.duration,driver.cost,driver.incentive,driver.remaining_fee,driver.revenue,driver.expense,driver.start.postcodes.0,driver.start.datetime,driver.start.lon,driver.start.lat,driver.start.literal,driver.start.country,driver.end.postcodes.0,driver.end.datetime,driver.end.lon,driver.end.lat,driver.end.literal,driver.end.country' \
    --out="$FOLDER/$FILENAME"

# install dependencies and run the opendata filter
cd scalingo
yarn
node opendata.js "$FOLDER/$FILENAME"

echo "Upload file"
curl --upload-file "$FOLDER/$OPENDATA_FILENAME" "$TRANSFERSH_SERVER/$OPENDATA_FILENAME" && echo ""
