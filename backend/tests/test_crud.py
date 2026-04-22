def test_create_event_unauthorized(client):
    response = client.post(
        "/events/create",
        json={
            "title": "Тестовое событие",
            "date": "01.01.2028",
            "time": "12:00",
            "place": "Москва",
            "capacity": 100
        }
    )
    
    assert response.status_code == 401

def test_create_event_with_auth(client):
    login_response = client.post(
        "/auth/login",
        data={
            "grant_type": "password",
            "username": "admin",
            "password": "admin"
        }
    )
    token = login_response.json()["access_token"]

    response = client.post(
        "/events/create",
        json={
            "title": "Тестовое событие",
            "date": "01.01.2027",
            "time": "12:00",
            "place": "Москва",
            "capacity": 100
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "Тестовое событие"

def test_create_event_as_user_forbidden(client):
        client.post("/auth/register", json={
            "username": "testuser",
            "password": "testpass"
        })

        login_resp = client.post(
            "/auth/login",
            data={"username": "testuser", "password": "testpass"}
        )
        token = login_resp.json()["access_token"]

        response = client.post(
            "/events/create",
            json={
                "title": "Запрещённое событие",
                "date": "01.01.2026",
                "time": "12:00",
                "place": "Москва",
                "capacity": 50
            },
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 403

