def test_get_events_public(client):
    response = client.get("/events/")

    assert response.status_code == 200
    assert "items" in response.json()
    assert "total" in response.json()
    assert "skip" in response.json()
    assert "limit" in response.json()


def test_get_event_not_found(client):
    response = client.get("/events/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


def test_events_filtering(client):
    response = client.get("/events/?search=концерт&age_limit=16")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)


def test_create_event_invalid_date(client):
        login_resp = client.post("/auth/login", data={"username": "admin", "password": "admin"})
        token = login_resp.json()["access_token"]

        response = client.post(
            "/events/create",
            json={
                "title": "Неверная дата",
                "date": "31.12.20266",
                "time": "12:00",
                "place": "Москва",
                "capacity": 100
            },
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 422
        assert "Дата должна быть в формате" in response.text
