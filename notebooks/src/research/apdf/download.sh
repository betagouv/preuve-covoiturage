#!/usr/bin/env bash

# Download the APDF datasets to sources/ directory

# ------------------------------------------------------------------------------------------
# config
# ------------------------------------------------------------------------------------------

SOURCE_FOLDER="sources"
MC_CONNECTION="rpc"
BUCKET_NAME="api.production-appels-de-fonds"

# ------------------------------------------------------------------------------------------
# user arguments
# ------------------------------------------------------------------------------------------

# Check if the campaign_id and month are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./download.sh <yyyy-mm> <campaign_id>"
    exit 1
fi

# Set the campaign_id and month
MONTH=$1
CAMPAIGN_ID=$2

BUCKET_URL="${MC_CONNECTION}/${BUCKET_NAME}/${CAMPAIGN_ID}/"
BUCKET_FILTER="APDF-${MONTH}"

mc ls "${BUCKET_URL}" \
  | grep "${BUCKET_FILTER}" \
  | awk '{print $6}' \
  | xargs -I {} mc cp "${BUCKET_URL}{}" "${SOURCE_FOLDER}/"
