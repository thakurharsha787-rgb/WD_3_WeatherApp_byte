const CONFIG = {
  // 1. Paste your OpenWeather key here (usually 32 letters/numbers)
  OPENWEATHER_API_KEY: "YOUR_OPENWEATHER_API_KEY_HERE",

  // 2. Paste your NASA API key here (from api.nasa.gov)
  NASA_API_KEY: "YOUR_NASA_API_KEY_HERE",

  // Default starting city on Earth
  DEFAULT_CITY: "New Delhi",

  // NASA Mars Endpoints:
  // Primary: Official NASA API using your key (InSight mission)
  NASA_INSIGHT_URL:
    "https://api.nasa.gov/insight_weather/?feedtype=json&ver=1.0",

  // Secondary: NASA Curiosity Rover REMS feed (live Gale Crater telemetry)
  MARS_CURIOSITY_URL:
    "https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json",
  MARS_API_URL:
    "https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json",

  // Backup data in case campus Wi-Fi or API rate limits kick in during your demo
  FALLBACK_MARS: {
    sol: "4135",
    terrestrial_date: "2024-03-24",
    max_temp: "-14",
    min_temp: "-75",
    pressure: "748",
    atmo_opacity: "Sunny / Clear",
    local_uv_irradiance_index: "Very High",
  },
};
