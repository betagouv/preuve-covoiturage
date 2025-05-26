FROM ghcr.io/dbt-labs/dbt-postgres:1.9.latest
RUN addgroup --gid 1000 dbt \
  && adduser --uid 1000 --disabled-password dbt --ingroup dbt \
  && mkdir /data/ \
  && chown dbt:dbt /data/

WORKDIR /data
USER dbt
COPY --chown=dbt:dbt . /data
RUN pip install --no-cache-dir elementary-data==0.18.3
RUN dbt deps
