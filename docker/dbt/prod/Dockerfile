# Debian 11 (base dbt-postgres officielle) n'est plus maintenue : on repart d'une base à jour.
FROM python:3.12-slim-trixie
# dbt-core >= 1.9.9 (protobuf 6) requis pour dbt-common >= 1.29, seul compatible deepdiff 8 (CVE-2025-58367)
RUN pip install --no-cache-dir \
    dbt-core==1.9.11 \
    dbt-postgres==1.9.1 \
    elementary-data==0.18.3 \
    "deepdiff>=8.6.1" \
  && groupadd --gid 1000 dbt \
  && useradd --uid 1000 --gid dbt --create-home dbt \
  && mkdir /data/ \
  && chown dbt:dbt /data/

WORKDIR /data
USER dbt
COPY --chown=dbt:dbt . /data
RUN dbt deps
ENTRYPOINT ["dbt"]
