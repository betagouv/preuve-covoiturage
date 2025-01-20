FROM ghcr.io/dbt-labs/dbt-postgres:1.9.0
RUN addgroup --gid 1000 dbt \
  && adduser --uid 1000 --disabled-password dbt --ingroup dbt \
  && mkdir /data/ \
  && chown dbt:dbt /data/

WORKDIR /data
USER dbt
ADD --chown=dbt:dbt . /data
RUN dbt deps
