const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const useLocationBtn = document.getElementById('useLocationBtn');
const statusMessage = document.getElementById('statusMessage');
const currentLocation = document.getElementById('currentLocation');
const currentDate = document.getElementById('currentDate');
const currentIcon = document.getElementById('currentIcon');
const currentTemp = document.getElementById('currentTemp');
const currentCondition = document.getElementById('currentCondition');
const highlights = {
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  pressure: document.getElementById('pressure'),
  uv: document.getElementById('uv'),
  sunrise: document.getElementById('sunrise')
};
const forecastList = document.getElementById('forecastList');
const recentSearches = document.getElementById('recentSearches');

const RECENT_SEARCHES_KEY = 'weather-recent-searches';
const LAST_CITY_KEY = 'weather-last-city';

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ff8a80' : '#7ee787';
}

function saveRecentSearch(city) {
  const searches = loadRecentSearches();
  const next = [city, ...searches.filter((item) => item !== city)].slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  renderRecentSearches(next);
}

function loadRecentSearches() {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function renderRecentSearches(searches) {
  if (!searches.length) {
    recentSearches.innerHTML = '<li class="empty">No recent cities yet.</li>';
    return;
  }

  recentSearches.innerHTML = searches
    .map((city) => `<li><button type="button" data-city="${city}">${city}</button></li>`)
    .join('');
}

function getWeatherCodeDescription(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail'
  };
  return map[code] || 'Weather conditions';
}

function getWeatherIcon(code, isDay) {
  const day = isDay ? '☀️' : '🌙';
  if (code <= 3) return day;
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 75) return '❄️';
  if (code >= 95) return '⛈️';
  return '☁️';
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function renderCurrentWeather(weather, locationName) {
  currentLocation.textContent = locationName;
  currentDate.textContent = formatDate(new Date());
  currentIcon.textContent = getWeatherIcon(weather.current.weather_code, weather.current.is_day);
  currentTemp.textContent = `${Math.round(weather.current.temperature_2m)}°C`;
  currentCondition.textContent = getWeatherCodeDescription(weather.current.weather_code);

  highlights.feelsLike.textContent = `${Math.round(weather.current.apparent_temperature)}°C`;
  highlights.humidity.textContent = `${weather.current.relative_humidity_2m}%`;
  highlights.wind.textContent = `${Math.round(weather.current.wind_speed_10m)} km/h`;
  highlights.pressure.textContent = `${Math.round(weather.current.pressure_msl)} hPa`;
  highlights.uv.textContent = `${weather.current.uv_index.toFixed(1)}`;
  highlights.sunrise.textContent = formatTime(weather.daily.sunrise[0]);
}

function renderForecast(daily) {
  forecastList.innerHTML = daily.time
    .slice(0, 7)
    .map((day, index) => {
      const code = daily.weather_code[index];
      const min = Math.round(daily.temperature_2m_min[index]);
      const max = Math.round(daily.temperature_2m_max[index]);
      const precip = daily.precipitation_probability_max[index];
      return `
        <article class="forecast-item">
          <strong>${formatDate(day)}</strong>
          <span>${getWeatherCodeDescription(code)}</span>
          <span>${getWeatherIcon(code, 1)}</span>
          <span>${max}° / ${min}° · ${precip}% rain</span>
        </article>
      `;
    })
    .join('');
}

async function fetchWeatherForCoordinates(latitude, longitude, cityName) {
  setStatus('Fetching weather data...');

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,pressure_msl,uv_index');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Weather request failed');
  }

  const data = await response.json();
  renderCurrentWeather(data, cityName);
  renderForecast(data.daily);
  setStatus(`Weather refreshed for ${cityName}.`);
  saveRecentSearch(cityName);
  localStorage.setItem(LAST_CITY_KEY, cityName);
}

async function searchCity(query) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    setStatus('Please enter a city name.', true);
    return;
  }

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', normalizedQuery);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Location lookup failed');
    }

    const data = await response.json();

    if (!data.results?.length) {
      throw new Error('No matching location found');
    }

    const result = data.results[0];
    await fetchWeatherForCoordinates(result.latitude, result.longitude, `${result.name}, ${result.country}`);
  } catch (error) {
    console.error(error);
    setStatus('Could not find that location. Please try another city.', true);
  }
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported in this browser.', true);
    return;
  }

  setStatus('Locating you...');
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await fetchWeatherForCoordinates(position.coords.latitude, position.coords.longitude, 'Your current location');
      } catch (error) {
        console.error(error);
        setStatus('Unable to load weather for your location.', true);
      }
    },
    () => {
      setStatus('Location permission was denied.', true);
    }
  );
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchCity(searchInput.value);
});

recentSearches.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-city]');
  if (button) {
    searchInput.value = button.dataset.city;
    searchCity(button.dataset.city);
  }
});

useLocationBtn.addEventListener('click', useCurrentLocation);

window.addEventListener('DOMContentLoaded', () => {
  renderRecentSearches(loadRecentSearches());
  const savedCity = localStorage.getItem(LAST_CITY_KEY);
  if (savedCity) {
    searchInput.value = savedCity;
    searchCity(savedCity);
  } else {
    setStatus('Enter a city to get started.');
  }
});
