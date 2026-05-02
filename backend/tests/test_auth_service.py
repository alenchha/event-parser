import pytest
from unittest.mock import MagicMock, patch
from backend.services.auth_service import AuthService


@pytest.mark.asyncio
async def test_authenticate_user_success():
    mock_user_repo = MagicMock()
    mock_user_repo.get_user_by_username.return_value = MagicMock(
        username="admin",
        password="hashed_password"
    )

    with patch("backend.services.auth_service.verify_password", return_value=True):
        service = AuthService(db=None)
        service.user_repo = mock_user_repo
        user = service.authenticate_user("admin", "123")
        assert user is not None
        assert user.username == "admin"


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password():
    mock_user_repo = MagicMock()
    mock_user_repo.get_user_by_username.return_value = MagicMock(password="hash")

    with patch("backend.services.auth_service.verify_password", return_value=False):
        service = AuthService(db=None)
        service.user_repo = mock_user_repo
        user = service.authenticate_user("admin", "wrong")
        assert user is None
