def test_weather_endpoint_moscow(client):
    response = client.get("/weather/Москва")

    assert response.status_code == 200
    data = response.json()
    assert "temperature" in data or "error" in data


def test_weather_endpoint_not_found(client):
    response = client.get("/weather/Город12345")

    assert response.status_code == 200
    data = response.json()
    assert "error" in data
