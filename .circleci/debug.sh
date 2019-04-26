#!/usr/bin/env bash
COMMIT_HASH=$(git rev-parse HEAD)

curl -s \
    --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=${COMMIT_HASH}\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/github/betagouv/preuve-covoiturage/tree/arch%2F46-middlewares
