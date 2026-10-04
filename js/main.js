/**
 * Interplanetary Weather App — Main Controller
 * Handles Earth (OpenWeather) & Mars (NASA) telemetry
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. STATE MANAGEMENT
  // =========================================================================
  let currentUnit = "C"; // "C" for Celsius, "F" for Fahrenheit
  let cachedEarthData = null;
  let cachedMarsData = null;

  // =========================================================================
  // 2. DOM ELEMENT SELECTORS
  // =========================================================================
  // Controls & Search
  const searchForm = document.getElementById("search-form");
  const cityInput = document.getElementById("city-input");
  const unitToggleBtn = document.getElementById("unit-toggle-btn");
  const toggleUnitLabel = document.getElementById("toggle-unit-label");
  const quickChips = document.querySelectorAll(".chip-btn");

  // Error Banner
  const errorBanner = document.getElementById("error-banner");
  const errorMessage = document.getElementById("error-message");
  const closeErrorBtn = document.getElementById("close-error-btn");

  // Earth Card Elements
  const earthCity = document.getElementById("earth-city");
  const earthCountry = document.getElementById("earth-country");
  const earthIcon = document.getElementById("earth-icon");
  const earthTemp = document.getElementById("earth-temp");
  const earthCondition = document.getElementById("earth-condition");
  const earthFeelsLike = document.getElementById("earth-feels-like");
  const earthHumidity = document.getElementById("earth-humidity");
  const earthWind = document.getElementById("earth-wind");
  const earthPressure = document.getElementById("earth-pressure");
  const earthVisibility = document.getElementById("earth-visibility");
  const earthTimestamp = document.getElementById("earth-timestamp");
  const earthUnitSpans = document.querySelectorAll("#earth-card .temp-unit");

  // Mars Card Elements
  const marsSol = document.getElementById("mars-sol");
  const marsDate = document.getElementById("mars-terrestrial-date");
  const marsTempHigh = document.getElementById("mars-temp-high");
  const marsTempLow = document.getElementById("mars-temp-low");
  const marsTempMax = document.getElementById("mars-temp-max");
  const marsCondition = document.getElementById("mars-condition");
  const marsPressure = document.getElementById("mars-pressure");
  const marsUv = document.getElementById("mars-uv");
  const marsUnitSpans = document.querySelectorAll("#mars-card .temp-unit");

  // =========================================================================
  // 3. UTILITY FUNCTIONS (Conversions & Formatting)
  // =========================================================================

  // Convert Celsius to Fahrenheit
  const cToF = (c) => Math.round((c * 9) / 5 + 32);

  // Convert Unix epoch timestamp to a readable date & time
  function formatTimestamp(unixSeconds) {
    if (!unixSeconds) return "N/A";
    const date = new Date(unixSeconds * 1000);
    return (
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      ", " +
      date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }

  // Display user feedback error
  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove("hidden");
  }

  // Dismiss error banner
  function hideError() {
    errorBanner.classList.add("hidden");
  }

  // =========================================================================
  // 4. EARTH WEATHER ENGINE (OpenWeatherMap)
  // =========================================================================
  async function fetchEarthWeather(city) {
    if (!city || city.trim() === "") {
      showError("Please enter a valid city name.");
      return;
    }

    // Check if API key is configured
    if (
      !CONFIG.OPENWEATHER_API_KEY ||
      CONFIG.OPENWEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY_HERE"
    ) {
      showError("Please set your OpenWeather API key in js/config.js");
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${CONFIG.OPENWEATHER_API_KEY}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `City "${city}" not found. Please verify the spelling.`,
          );
        } else if (response.status === 401) {
          throw new Error(
            "Invalid API key. Check OPENWEATHER_API_KEY in config.js.",
          );
        } else {
          throw new Error(
            `Weather service error (${response.status}). Try again.`,
          );
        }
      }

      const data = await response.json();
      cachedEarthData = data; // Cache data for instant unit conversion
      renderEarthWeather(data);
      hideError();
    } catch (err) {
      console.error("Earth Fetch Error:", err);
      showError(err.message);
    }
  }

  function renderEarthWeather(data) {
    earthCity.textContent = data.name;
    earthCountry.textContent = data.sys?.country || "";

    // Icon & description
    const weather = data.weather[0];
    earthCondition.textContent = weather.description;
    earthIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
    earthIcon.alt = weather.description;

    // Temperature with current unit
    const rawTemp = Math.round(data.main.temp);
    const rawFeels = Math.round(data.main.feels_like);
    earthTemp.textContent = currentUnit === "C" ? rawTemp : cToF(rawTemp);
    earthFeelsLike.textContent =
      currentUnit === "C" ? rawFeels : cToF(rawFeels);

    // Weather metrics
    earthHumidity.textContent = `${data.main.humidity}%`;
    earthWind.textContent = `${data.wind.speed} m/s`;
    earthPressure.textContent = `${data.main.pressure} hPa`;
    earthVisibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Last updated timestamp
    earthTimestamp.textContent = formatTimestamp(data.dt);
  }

  // =========================================================================
  // 5. MARS WEATHER ENGINE (NASA Curiosity Rover REMS)
  // =========================================================================
  async function fetchMarsWeather() {
    try {
      const response = await fetch(CONFIG.MARS_API_URL);
      if (!response.ok) throw new Error("NASA endpoint unavailable");

      const data = await response.json();

      // Get the latest Sol record
      if (data && data.soles && data.soles.length > 0) {
        cachedMarsData = data.soles[0];
        renderMarsWeather(cachedMarsData);
      } else {
        throw new Error("No telemetry records found");
      }
    } catch (err) {
      console.warn("Using offline NASA telemetry fallback:", err);
      cachedMarsData = CONFIG.FALLBACK_MARS;
      renderMarsWeather(cachedMarsData);
    }
  }

  function renderMarsWeather(solData) {
    marsSol.textContent = solData.sol || "---";
    marsDate.textContent = solData.terrestrial_date || "Unknown";
    marsCondition.textContent = solData.atmo_opacity || "Sunny & Clear";
    marsPressure.textContent = solData.pressure
      ? `${solData.pressure} Pa`
      : "--";
    marsUv.textContent = solData.local_uv_irradiance_index || "Moderate";

    // Handle high & low temperatures
    const minC = parseInt(solData.min_temp, 10);
    const maxC = parseInt(solData.max_temp, 10);

    const displayMin = isNaN(minC)
      ? "--"
      : currentUnit === "C"
        ? `${minC}°C`
        : `${cToF(minC)}°F`;
    const displayMax = isNaN(maxC)
      ? "--"
      : currentUnit === "C"
        ? `${maxC}°C`
        : `${cToF(maxC)}°F`;
    const displayHero = isNaN(maxC)
      ? "--"
      : currentUnit === "C"
        ? maxC
        : cToF(maxC);

    marsTempLow.textContent = displayMin;
    marsTempMax.textContent = displayMax;
    marsTempHigh.textContent = displayHero;
  }

  // =========================================================================
  // 6. UNIT TOGGLE CONTROLLER (°C <-> °F)
  // =========================================================================
  function toggleUnit() {
    currentUnit = currentUnit === "C" ? "F" : "C";

    // Update button text to show the other option
    toggleUnitLabel.textContent = currentUnit === "C" ? "°F" : "°C";

    // Update unit labels on cards
    earthUnitSpans.forEach((span) => (span.textContent = `°${currentUnit}`));
    marsUnitSpans.forEach((span) => (span.textContent = `°${currentUnit}`));

    // Re-render cached data with new units
    if (cachedEarthData) renderEarthWeather(cachedEarthData);
    if (cachedMarsData) renderMarsWeather(cachedMarsData);
  }

  // =========================================================================
  // 7. EVENT LISTENERS
  // =========================================================================

  // Search Form Submit
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value;
    fetchEarthWeather(city);
  });

  // Quick Chips (Delhi, London, Tokyo, etc.)
  quickChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const city = chip.getAttribute("data-city");
      cityInput.value = city;
      fetchEarthWeather(city);
    });
  });

  // Unit Toggle Button
  unitToggleBtn.addEventListener("click", toggleUnit);

  // Error Banner Close Button
  closeErrorBtn.addEventListener("click", hideError);

  // =========================================================================
  // 8. INITIALIZE APPLICATION
  // =========================================================================
  fetchMarsWeather(); // Fetch NASA Mars telemetry
  fetchEarthWeather(CONFIG.DEFAULT_CITY); // Fetch default Earth city
});
