from contextlib import asynccontextmanager

from fastapi.testclient import TestClient

from api_datalake.cache import get_redis
from api_datalake.main import create_app
from api_datalake.repositories.observatory import build_territory_search_query
from api_datalake.routers.observatory import get_conn

# --- build_territory_search_query : SQL pur, testable sans base ---


def test_search_reads_only_exposed_zone():
    sql, _ = build_territory_search_query("paris", 20)
    assert "zone_exposed.observatory_search_territories" in sql
    for forbidden in ("zone_trusted.", "zone_raw.", "zone_aggregated."):
        assert forbidden not in sql


def test_search_binds_every_value():
    sql, params = build_territory_search_query("  Île-de-France  ", 15, year=2025)
    # q trim ; casse préservée pour l'exact, lower pour le flou ; valeurs liées
    assert params["q_exact"] == "Île-de-France"
    assert params["q"] == "île-de-france"
    assert params["limit"] == 15 and params["year"] == 2025
    assert "%(q_exact)s" in sql and "%(limit)s" in sql and "%(year)s" in sql
    # aucune valeur brute interpolée
    assert "Île-de-France" not in sql
    assert "year = %(year)s" in sql


def test_search_exact_match_is_case_sensitive_and_unindexed_columns():
    sql, _ = build_territory_search_query("11_reg", 20)
    # comparé aux colonnes brutes (index btree du modèle), pas via lower()
    assert "id = %(q_exact)s OR territory = %(q_exact)s" in sql


def test_search_defaults_to_latest_millesime():
    sql, params = build_territory_search_query("lyon", 20)
    assert "is_latest" in sql
    assert "year" not in params


def test_search_uses_accent_insensitive_and_trigram():
    sql, params = build_territory_search_query("lyon", 20)
    assert "public.immutable_unaccent" in sql
    assert "LIKE" in sql
    assert "%%" in sql  # opérateur trigram + wildcards LIKE, échappés
    assert "similarity(" in sql
    assert params["q_like"] == "%lyon%"


def test_search_short_query_is_exact_match_only():
    # < 3 caractères : aucun trigramme utile -> pas de LIKE ni de similarity,
    # seulement la résolution exacte (sinon seq scan sur motif non indexable).
    sql, params = build_territory_search_query("84", 20)
    assert "LIKE" not in sql
    assert "similarity(" not in sql
    assert "%%" not in sql
    assert "q_like" not in params
    assert "id = %(q_exact)s OR territory = %(q_exact)s" in sql


def test_search_escapes_like_metacharacters():
    _, params = build_territory_search_query("a_b%c\\d", 20)
    # jokers LIKE neutralisés : q reste une sous-chaîne littérale
    assert params["q_like"] == r"%a\_b\%c\\d%"


# --- endpoint /observatory/territories/search ---


class FakeCursor:
    def __init__(self, rows):
        self._rows = rows

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def execute(self, sql, params):
        pass

    async def fetchall(self):
        return self._rows


class FakeConn:
    def __init__(self, rows):
        self._rows = rows

    def cursor(self):
        return FakeCursor(self._rows)


def _client(rows):
    app = create_app()

    def override_conn():
        @asynccontextmanager
        async def _acquire():
            yield FakeConn(rows)
        return _acquire

    app.dependency_overrides[get_conn] = override_conn
    app.dependency_overrides[get_redis] = lambda: None
    return TestClient(app, raise_server_exceptions=False)


def test_search_endpoint_returns_gzipped_list():
    rows = [{"id": "75056_com", "territory": "75056", "l_territory": "Paris",
             "type": "com", "year": 2026}]
    r = _client(rows).get("/observatory/territories/search", params={"q": "pari"})
    assert r.status_code == 200
    assert r.headers["content-encoding"] == "gzip"
    assert r.json() == rows


def test_search_blank_query_returns_empty_without_db():
    r = _client([{"id": "x"}]).get("/observatory/territories/search", params={"q": "   "})
    assert r.status_code == 200
    assert r.json() == []


def test_search_query_too_long_is_422():
    r = _client([]).get("/observatory/territories/search", params={"q": "a" * 65})
    assert r.status_code == 422
    assert r.json() == {"detail": "invalid request parameters"}


def test_search_limit_out_of_range_is_422():
    r = _client([]).get("/observatory/territories/search", params={"q": "paris", "limit": 200})
    assert r.status_code == 422
