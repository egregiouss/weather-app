const cityInput = document.querySelector(".city-input");
const latInput = document.querySelector(".lat-input");
const lonInput = document.querySelector(".lon-input");
const searchCityButton = document.querySelector(".search-city-btn");
const searchCoordinatesButton = document.querySelector(".search-coordinates-btn");
const locationButton = document.querySelector(".location-btn");
const weatherDiv = document.querySelector(".weather-data");


const API_KEY = "2931438045cd03cbd77760fecb7fd68b";
let widgets = []

function renderMap(lat, lon, index) {
    ymaps.ready(function () {
        let myMap = new ymaps.Map(`map-${index}`, {
                center: [lat, lon],
                zoom: 13,
            }, {
                searchControlProvider: 'yandex#search'
            }),

            placemark = new ymaps.Placemark(myMap.getCenter(), {
                hintContent: 'Метка расположения',
            }, {
                iconLayout: 'default#image',
                iconImageHref: 'images/location.svg',
                iconImageSize: [30, 42],
                iconImageOffset: [-5, -38],
            });
        myMap.geoObjects
            .add(placemark);

    });
}

function getWidgetHtmlCode(cityName, weatherItem) {
        const index = widgets.length
        return `<div class="current-weather" id="weather-widget-${index}">
                    <div class="details">
                        <h2>${cityName} (${weatherItem.name.split(" ")[0]})</h2>
                        <h6>Температура: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                        <h6>Ветер: ${weatherItem.wind.speed} M/S</h6>
                        <h6>Влажность: ${weatherItem.main.humidity}%</h6>
                        <button class="close-btn" id="close-${index}" value="${index}" onclick="closeWidget(this.value)">Закрыть</button>
                        <button class="map-btn" value="${index}" onclick="showMap(this.value)">Карта</button>
                    </div>
                    <div id="map-${index}" style="width: 50%; height: 100%"></div>
                    <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                        <h6>${weatherItem.weather[0].description}</h6>
                    </div>
                </div>`;
}

function renderWidget(cityName, latitude, longitude) {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=ru`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(weatherItem => {
        cityInput.value = "";
        latInput.value = ""
        lonInput.value = ""

        const html = getWidgetHtmlCode(cityName, weatherItem);
        widgets.push({
            code: html,
            lat: latitude,
            lon: longitude
        })
        weatherDiv.insertAdjacentHTML("beforeend", html);

    });
}

function getWeatherByCityName () {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`Не найден город ${cityName}`);
        const { lat, lon, name } = data[0];
        renderWidget(name, lat, lon);
    });
}

function getWeatherByCoordinates(){
    const lon = lonInput.value.trim();
    const lat = latInput.value.trim();
    if (lon === "" || lat === "") return;
    renderWidget(name, lat, lon);

}

function getWeatherByGPS (){
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                renderWidget(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

function closeWidget (index){
    console.log(index)
    const widgetToRemove = document.getElementById(`weather-widget-${index}`);
    widgets.splice(index, 1);
    widgetToRemove.remove()
}

function showMap (index){
    console.log(index)
    const weatherData = widgets[index]
    renderMap(weatherData.lat, weatherData.lon, index)
}

locationButton.addEventListener("click", getWeatherByGPS);
searchCityButton.addEventListener("click", getWeatherByCityName);
searchCoordinatesButton.addEventListener("click", getWeatherByCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getWeatherByCityName());