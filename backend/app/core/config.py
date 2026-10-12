from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = Field(default="sqlite+aiosqlite:///./dev.db", alias="DATABASE_URL")

    # Supabase Auth
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_jwt_secret: str = Field(default="", alias="SUPABASE_JWT_SECRET")

    # Security / Fallback
    secret_key: str = Field(default="change-this-to-a-strong-random-value", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=90, alias="REFRESH_TOKEN_EXPIRE_DAYS")

    # Application
    project_timezone: str = Field(default="Asia/Kolkata", alias="PROJECT_TIMEZONE")
    max_photo_age_hours: int = Field(default=72, alias="MAX_PHOTO_AGE_HOURS")
    overclaim_tolerance_pct: float = Field(default=20.0, alias="OVERCLAIM_TOLERANCE_PCT")
    required_photo_count: int = Field(default=3, alias="REQUIRED_PHOTO_COUNT")

    # Provider configurations
    vlm_provider: str = Field(default="mock", alias="VLM_PROVIDER")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    ocr_provider: str = Field(default="tesseract", alias="OCR_PROVIDER")
    storage_backend: str = Field(default="local", alias="STORAGE_BACKEND")
    local_storage_path: str = Field(default="./uploads", alias="LOCAL_STORAGE_PATH")

    # derived settings
    @property
    def is_production(self) -> bool:
        return "postgres" in self.database_url

    @property
    def is_development(self) -> bool:
        return not self.is_production


settings = Settings()  # type: ignore[var-annotated]


def get_settings() -> Settings:
    return settings