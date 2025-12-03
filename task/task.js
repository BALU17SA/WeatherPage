let searchHistory = [];

// STEP 1 — Fetch coordinates

const getCityCoordinates = async (city) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    const { latitude, longitude, name } = data.results[0];
    
    return { latitude, longitude, name };
};

// STEP 2 — Fetch weather

const getWeather = async (lat, lon) => {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    const response = await fetch(url);
    const data = await response.json();

    return data.current_weather;
};

// STEP 3 — Search Function

const searchWeather = async () => {
    const city = document.getElementById("cityInput").value.trim();
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const resultEl = document.getElementById("weatherResult");

    if (!city) {
        errorEl.textContent = "Please enter a city name";
        return;
    }

    loadingEl.textContent = "Loading...";
    errorEl.textContent = "";
    resultEl.textContent = "";

    try {
        // 1. Coordinates

        const { latitude, longitude, name } = await getCityCoordinates(city);

        // 2. Weather

        const weather = await getWeather(latitude, longitude);
        console.log(weather)

        // 3. Output

        resultEl.innerHTML = `
            <strong>City:</strong> ${name} <br>
            <strong>Temperature:</strong> ${weather.temperature} °C <br>
            <strong>Wind Speed:</strong> ${weather.windspeed} km/h
        `;

        // 4. Search History (NO DUPLICATES)

        searchHistory.unshift(name);   // push to front  
        searchHistory = [...new Set(searchHistory)]; // remove duplicates
        searchHistory = searchHistory.slice(0, 5); // limit 5

        document.getElementById("historyList").innerHTML =
            searchHistory.map(item => `<li>${item}</li>`).join("");

    } catch (err) {
        errorEl.textContent = err.message;
    }

    loadingEl.textContent = "";
};

// STEP 5 — Event Listeners

document.getElementById("searchBtn").addEventListener("click", searchWeather);
document.getElementById("cityInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchWeather();
});
