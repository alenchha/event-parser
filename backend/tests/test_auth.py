def test_login_success(client):
    response = client.post(
        "/auth/login",
        data={
            "grant_type": "password",
            "username": "admin",
            "password": "admin"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    response = client.post(
        "/auth/login",
        data={
            "grant_type": "password",
            "username": "admin",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_protected_route_without_token(client):
    response = client.get("/users/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Token missing"
