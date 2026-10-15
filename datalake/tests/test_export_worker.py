import logging
from pathlib import Path
from unittest.mock import MagicMock, patch

from pipelines.cmd.export_worker import process_one


def test_process_one_empty_returns_false():
    api = MagicMock()
    api.claim.return_value = None
    assert process_one(api, MagicMock(), MagicMock(), "export") is False


@patch("pipelines.cmd.export_worker.stream_csv")
def test_process_one_success_flow(stream_csv, tmp_path, monkeypatch):
    # Le worker ne doit écrire aucun fichier temporaire dans le répertoire courant
    # (régression : ./{uuid}.csv échouait sur le workdir en lecture seule du pod).
    monkeypatch.chdir(tmp_path)
    captured = {}

    def _fake_stream(conn, inner, csv_path):
        captured["csv_path"] = csv_path
        with open(csv_path, "w") as f:
            f.write("journey_id\n1\n")
    stream_csv.side_effect = _fake_stream

    api = MagicMock()
    api.claim.return_value = {"uuid": "u1", "target": "operator",
                             "params": {"start_at": "2026-01-01T00:00:00+0100",
                                        "end_at": "2026-02-01T00:00:00+0100",
                                        "operator_id": [1], "geo_selector": None}}
    s3 = MagicMock()
    ok = process_one(api, MagicMock(), s3, "export")
    assert ok is True
    # temp file lived outside cwd, and the tempdir was cleaned up on exit
    assert Path(captured["csv_path"]).parent != tmp_path
    assert not Path(captured["csv_path"]).exists()
    assert list(tmp_path.iterdir()) == []
    s3.upload_file.assert_called_once()
    assert s3.upload_file.call_args[0][2] == "u1.csv.zip"
    api.complete.assert_called_once()
    assert api.complete.call_args[0][0] == "u1"


@patch("pipelines.cmd.export_worker.stream_csv", side_effect=RuntimeError("boom"))
def test_process_one_failure_calls_fail(stream_csv, tmp_path, monkeypatch, caplog):
    monkeypatch.chdir(tmp_path)
    api = MagicMock()
    api.claim.return_value = {"uuid": "u2", "target": "operator",
                             "params": {"start_at": "2026-01-01T00:00:00+0100",
                                        "end_at": "2026-02-01T00:00:00+0100",
                                        "operator_id": [1], "geo_selector": None}}
    with caplog.at_level(logging.INFO, logger="export_worker"):
        assert process_one(api, MagicMock(), MagicMock(), "export") is True
    api.fail.assert_called_once()
    assert api.fail.call_args[0][0] == "u2"
    errors = [r for r in caplog.records if r.levelno == logging.ERROR]
    assert len(errors) == 1 and "u2" in errors[0].getMessage()
    assert errors[0].exc_info is not None


def test_process_one_empty_logs_queue_empty(caplog):
    api = MagicMock()
    api.claim.return_value = None
    with caplog.at_level(logging.INFO, logger="export_worker"):
        process_one(api, MagicMock(), MagicMock(), "export")
    assert "aucun export en attente" in caplog.text


@patch("pipelines.cmd.export_worker.stream_csv")
def test_process_one_logs_every_step_at_info(stream_csv, caplog):
    def _fake_stream(conn, inner, csv_path):
        with open(csv_path, "w") as f:
            f.write("journey_id\n1\n2\n")
        return 2
    stream_csv.side_effect = _fake_stream

    api = MagicMock()
    api.claim.return_value = {"uuid": "u3", "target": "territory",
                             "params": {"start_at": "2026-01-01T00:00:00+0100",
                                        "end_at": "2026-02-01T00:00:00+0100",
                                        "geo_selector": {"aom": ["217500016"]}}}
    with caplog.at_level(logging.INFO, logger="export_worker"):
        process_one(api, MagicMock(), MagicMock(), "export")

    infos = [r.getMessage() for r in caplog.records if r.levelno == logging.INFO]
    steps = ["réclamé", "requête", "CSV écrit", "zip :", "upload s3://", "signalé à l'API"]
    for step in steps:
        assert any(step in m for m in infos), f"étape « {step} » absente des logs"
    assert all("u3" in m for m in infos if not m.startswith("claim"))
    assert any("2 lignes" in m for m in infos)
    claimed = next(m for m in infos if "réclamé" in m)
    assert "territory" in claimed and "2026-01-01" in claimed
    # geo_selector résolu = parfois des centaines de codes : on n'en logue que le nombre
    assert "{'aom': 1}" in claimed and "217500016" not in claimed
