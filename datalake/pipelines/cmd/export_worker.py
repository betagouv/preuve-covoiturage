"""On-demand export worker.

Drains the API's pending export queue: claim -> COPY to CSV -> zip -> upload to
the export bucket -> report success/failure back to the API.
"""

import logging
import os
import tempfile
import time
import zipfile
from datetime import datetime

import psycopg
import typer
from dotenv import load_dotenv

from pipelines.helpers.api_client import ApiClient
from pipelines.helpers.export_query import build_copy_sql
from pipelines.helpers.pg import pg_conninfo
from pipelines.helpers.s3 import export_s3_client, s3_upload

load_dotenv()
app = typer.Typer()
log = logging.getLogger("export_worker")

TARGETS = ["operator", "territory"]


def _to_local_date(iso: str) -> str:
    # normalize ISO datetime to YYYY-MM-DD (day-boundary semantics like start_date_filter)
    return datetime.fromisoformat(iso).strftime("%Y-%m-%d")


def _mo(path: str) -> str:
    return f"{os.path.getsize(path) / 1e6:.1f} Mo"


def stream_csv(conn, inner_sql: str, csv_path: str) -> int:
    # server-side streaming COPY straight to a local file, semicolon-delimited + header
    copy_sql = f"COPY ({inner_sql}) TO STDOUT (FORMAT CSV, DELIMITER ';', HEADER)"
    with open(csv_path, "wb") as f, conn.cursor() as cur:
        with cur.copy(copy_sql) as copy:
            for chunk in copy:
                f.write(chunk)
        return cur.rowcount


def process_one(api, conn, s3, bucket) -> bool:
    log.info("claim : recherche d'un export en attente (%s)", ", ".join(TARGETS))
    task = api.claim(TARGETS)
    if not task:
        log.info("claim : aucun export en attente")
        return False
    uuid = task["uuid"]
    started = time.monotonic()
    try:
        params = dict(task["params"])
        log.info("[%s] réclamé : target=%s params=%s", uuid, task["target"], params)
        params["start_at"] = _to_local_date(params["start_at"])
        params["end_at"] = _to_local_date(params["end_at"])
        inner = build_copy_sql(task["target"], params)
        log.info("[%s] requête construite : %s → %s (borne exclusive)",
                 uuid, params["start_at"], params["end_at"])

        # temp files vont dans un répertoire inscriptible (TMPDIR, défaut /tmp) :
        # le workdir de l'image est monté en lecture seule. Auto-nettoyé en sortie.
        with tempfile.TemporaryDirectory(prefix="export-") as tmp:
            csv_path = os.path.join(tmp, f"{uuid}.csv")
            zip_path = os.path.join(tmp, f"{uuid}.csv.zip")
            key = f"{uuid}.csv.zip"

            t = time.monotonic()
            log.info("[%s] COPY depuis zone_exposed.export_partners…", uuid)
            rows = stream_csv(conn, inner, csv_path)
            log.info("[%s] CSV écrit : %s lignes, %s en %.1fs",
                     uuid, rows, _mo(csv_path), time.monotonic() - t)

            t = time.monotonic()
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
                z.write(csv_path, arcname=f"{uuid}.csv")
            log.info("[%s] zip : %s en %.1fs", uuid, _mo(zip_path), time.monotonic() - t)

            t = time.monotonic()
            log.info("[%s] upload s3://%s/%s…", uuid, bucket, key)
            s3_upload(bucket, key, zip_path, client=s3)
            log.info("[%s] upload terminé en %.1fs", uuid, time.monotonic() - t)

            api.complete(uuid, os.path.getsize(zip_path))
        log.info("[%s] terminé, signalé à l'API (%.1fs au total)",
                 uuid, time.monotonic() - started)
        return True
    except Exception:  # any failure -> report to API, don't crash the loop
        # Full detail stays worker-side (logs); the API/user only sees a generic
        # message — raw psycopg/botocore errors can leak schema/hostnames.
        log.exception("[%s] échec après %.1fs", uuid, time.monotonic() - started)
        api.fail(uuid, "export generation failed")
        return True


@app.command()
def run(max_iterations: int = 50):
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s %(levelname)s %(message)s")
    api = ApiClient(os.environ["API_URL"],
                    os.environ["EXPORT_WORKER_ACCESS_KEY"],
                    os.environ["EXPORT_WORKER_SECRET_KEY"])
    s3 = export_s3_client()
    bucket = os.environ["EXPORT_S3_BUCKET"]
    log.info("démarrage : bucket=%s max_iterations=%s", bucket, max_iterations)
    processed = 0
    with psycopg.connect(pg_conninfo()) as conn:
        log.info("connecté au datalake")
        while processed < max_iterations and process_one(api, conn, s3, bucket):
            processed += 1
    log.info("fin : %s export(s) traité(s)", processed)


if __name__ == "__main__":
    app()
