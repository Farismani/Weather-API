# WeatherNow

A polished, GitHub-ready weather dashboard built with vanilla HTML, CSS, and JavaScript. It searches any city, supports geolocation, shows current conditions, and includes a 7-day forecast.

## Features

- Search any city worldwide
- Use the browser's geolocation for local conditions
- View current temperature, humidity, wind, pressure, UV, and sunrise time
- See a 7-day weather outlook
- Save recent searches in the browser
- Ready to deploy to GitHub Pages

## Run locally

Open [index.html](index.html) in a browser, or serve the folder with a simple local server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

- [index.html](index.html) — app shell and layout
- [styles.css](styles.css) — responsive styling
- [app.js](app.js) — weather API calls and UI rendering
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — GitHub Pages deployment workflow

## API note

This project uses the Open-Meteo API, which does not require an API key.
