"""Tests for MONGODB_URI validation in Settings.

Run from apps/ai-service/:
    python -m pytest tests/ -v
"""

import pytest
from pydantic import ValidationError

from src.config import Settings


class TestValidMongodbUri:
    def test_localhost_default(self):
        s = Settings(MONGODB_URI="mongodb://localhost:27017", _env_file=None)
        assert s.MONGODB_URI == "mongodb://localhost:27017"

    def test_with_database_path(self):
        s = Settings(MONGODB_URI="mongodb://localhost:27017/tessera", _env_file=None)
        assert s.MONGODB_URI == "mongodb://localhost:27017/tessera"

    def test_with_credentials(self):
        s = Settings(
            MONGODB_URI="mongodb://user:pass@localhost:27017/tessera", _env_file=None
        )
        assert s.MONGODB_URI == "mongodb://user:pass@localhost:27017/tessera"

    def test_replica_set(self):
        s = Settings(
            MONGODB_URI="mongodb://h1:27017,h2:27017/db?replicaSet=rs0", _env_file=None
        )
        assert s.MONGODB_URI.startswith("mongodb://")

    def test_srv_scheme_accepted(self):
        # mongodb+srv:// passes the scheme gate; DNS resolution is deferred to
        # connect time, so any syntactically-plausible SRV URI passes here.
        s = Settings(
            MONGODB_URI="mongodb+srv://user:pass@cluster.example.net/mydb",
            _env_file=None,
        )
        assert s.MONGODB_URI.startswith("mongodb+srv://")


class TestInvalidMongodbUri:
    @pytest.mark.parametrize(
        "bad_uri",
        [
            "postgres://localhost/db",
            "http://localhost:27017",
            "mysql://user:pass@localhost/db",
            "localhost:27017",
            "not-a-uri",
            "",
        ],
    )
    def test_wrong_scheme_raises(self, bad_uri: str) -> None:
        with pytest.raises(ValidationError, match="invalid scheme"):
            Settings(MONGODB_URI=bad_uri, _env_file=None)

    def test_missing_host_raises(self) -> None:
        """mongodb:// with no host raises a specific 'missing a host' error."""
        with pytest.raises(ValidationError, match="missing a host"):
            Settings(MONGODB_URI="mongodb://", _env_file=None)
