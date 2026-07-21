import requests
import datetime
from core.logger import setup_logger

logger = setup_logger("open_meteo")

def get_seasonal_weather(lat: float, lon: float) -> dict:
    """
    Fetches the last 90 days of weather to approximate the current season.
    # ponytail: naive heuristic. Upgrade path: use actual historical season averages
    """
    end_date = datetime.date.today() - datetime.timedelta(days=6)
    start_date = end_date - datetime.timedelta(days=90)
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily": ["temperature_2m_mean", "relative_humidity_2m_mean", "precipitation_sum"]
    }
    
    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        daily = data.get("daily", {})
        
        # Calculate averages/sums
        temp = sum(daily.get("temperature_2m_mean", [25.0])) / len(daily.get("temperature_2m_mean", [1]))
        hum = sum(daily.get("relative_humidity_2m_mean", [60.0])) / len(daily.get("relative_humidity_2m_mean", [1]))
        rain = sum(daily.get("precipitation_sum", [500.0]))
        
        return {
            "avg_temp": temp,
            "avg_humidity": hum,
            "total_rainfall": rain
        }
    except Exception as e:
        logger.error(f"Open-Meteo fetch failed: {e}. Using fallback values.")
        return {
            "avg_temp": 26.0,
            "avg_humidity": 65.0,
            "total_rainfall": 600.0
        }
