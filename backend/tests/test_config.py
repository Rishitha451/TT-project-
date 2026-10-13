import pytest
from pydantic import ValidationError
from app.core.config import Settings

def test_development_config_accepts_defaults():
    settings = Settings(APP_ENV="development")
    assert settings.DEBUG is True
    assert settings.JWT_SECRET == "development_secret_key_change_in_production_32chars_min"
    assert "localhost" in settings.DATABASE_URL

def test_production_config_rejects_default_jwt():
    with pytest.raises(ValueError, match="JWT_SECRET must be configured securely for production."):
        Settings(
            APP_ENV="production",
            DATABASE_URL="postgresql+asyncpg://user:pass@prod-db.com/db",
            JWT_SECRET="development_secret_key_change_in_production_32chars_min"
        )

def test_production_config_rejects_localhost_db():
    with pytest.raises(ValueError, match="Production DATABASE_URL must not point to localhost."):
        Settings(
            APP_ENV="production",
            DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/db",
            JWT_SECRET="super_secret_production_key_32_chars_long"
        )

def test_production_config_forces_debug_false():
    settings = Settings(
        APP_ENV="production",
        DATABASE_URL="postgresql+asyncpg://user:pass@prod-db.com/db",
        JWT_SECRET="super_secret_production_key_32_chars_long",
        DEBUG=True  # Attempt to force True
    )
    assert settings.DEBUG is False

def test_production_config_accepts_valid_settings():
    settings = Settings(
        APP_ENV="production",
        DATABASE_URL="postgresql+asyncpg://user:pass@prod-db.com/db",
        JWT_SECRET="super_secret_production_key_32_chars_long"
    )
    assert settings.APP_ENV == "production"
    assert settings.DEBUG is False
    assert settings.JWT_SECRET == "super_secret_production_key_32_chars_long"
    assert "prod-db.com" in settings.DATABASE_URL
