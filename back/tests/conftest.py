from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine as sa_create_engine
from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

import app.api.deps as deps_module
import app.core.db as db_module
from app.core.config import settings
from app.core.db import init_db
from app.main import app

# Ensure every model is imported so SQLModel.metadata is complete before
# create_all runs against the isolated test database.
from app.models import User  # noqa: F401
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import get_superuser_token_headers

TEST_DB_NAME = f"{settings.POSTGRES_DB}_test"


def _url_for(db_name: str) -> str:
    """Rewrite the configured DSN to point at a different database name."""
    base = str(settings.SQLALCHEMY_DATABASE_URI)
    return base.rsplit("/", 1)[0] + "/" + db_name


@pytest.fixture(scope="session", autouse=True)
def _isolated_test_db() -> Generator[None, None, None]:
    """Create a dedicated `<db>_test` database, point the app at it, drop it after.

    Tests are destructive, so they must never run against the dev/prod database.
    """
    admin_url = _url_for("postgres")

    def _recreate() -> None:
        admin_engine = sa_create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with admin_engine.connect() as conn:
            conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
            conn.execute(text(f'CREATE DATABASE "{TEST_DB_NAME}"'))
        admin_engine.dispose()

    def _drop() -> None:
        admin_engine = sa_create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with admin_engine.connect() as conn:
            conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
        admin_engine.dispose()

    # Rate limiting would block the shared TestClient IP across many requests.
    from app.core.limiter import limiter

    limiter.enabled = False

    _recreate()
    test_engine = create_engine(_url_for(TEST_DB_NAME))
    SQLModel.metadata.create_all(test_engine)

    # Redirect the application's DB access to the isolated test engine.
    original_db_engine = db_module.engine
    original_deps_engine = deps_module.engine
    db_module.engine = test_engine
    deps_module.engine = test_engine
    try:
        yield
    finally:
        db_module.engine = original_db_engine
        deps_module.engine = original_deps_engine
        test_engine.dispose()
        _drop()


@pytest.fixture(scope="session", autouse=True)
def db(_isolated_test_db: None) -> Generator[Session, None, None]:
    with Session(db_module.engine) as session:
        init_db(session)
        yield session


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )
