# WeatherNow

WeatherNow is a sleek, modern weather dashboard built with vanilla HTML, CSS, and JavaScript. It lets users search for cities, use their current location, and explore live weather details with a polished, minimal interface.

## Features

- Search for weather by city name
- Use browser geolocation for local conditions
- View current temperature, feels-like temperature, humidity, wind, pressure, UV index, and sunrise time
- Explore a 7-day forecast
- Save recent searches in the browser
- Responsive design for desktop and mobile
- Ready to deploy to GitHub Pages

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Open-Meteo API for weather and geocoding data

## Run Locally

Open [index.html](index.html) in your browser, or serve the project from the folder:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deploy Elsewhere

This project can also be deployed on Netlify or Vercel with the root folder as the publish directory.

## Project Structure

- [index.html](index.html) — main app layout
- [styles.css](styles.css) — visual design and responsive styling
- [app.js](app.js) — weather data fetching and UI rendering
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — GitHub Pages deployment workflow

## API Note

This project uses the Open-Meteo API, which does not require an API key.

## License

This project is open source and available under the MIT License.
