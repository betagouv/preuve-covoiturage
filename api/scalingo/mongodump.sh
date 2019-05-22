#!/usr/bin/env bash

DATE=$(date +%Y%m%d%H%M%S)
FOLDER=/tmp
FILENAME="mongodump-$DATE.archive.gz"
TRANSFERSH_SERVER=http://shared.dotify.eu:8080

dbclient-fetcher mongo 4.0
mongodump \
    --uri $MONGO_URL \
    --forceTableScan \
    --gzip \
    --archive="$FOLDER/$FILENAME"

curl --upload-file "$FOLDER/$FILENAME" "$TRANSFERSH_SERVER/$FILENAME" && echo ""
