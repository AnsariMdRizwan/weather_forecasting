
const searchbutton = document.querySelector(".search-btn");
const cityinput = document.querySelector(".city-input")
const weathercardsdiv = document.querySelector(".weather-cards")
const currentweatherdiv = document.querySelector(".current-weather")
const locationbutton = document.querySelector(".location-btn")



const API_key = import.meta.env.VITE_API_KEY;

const createWeatherCard = (cityname, weatheritem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityname} (${weatheritem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temp:${(weatheritem.main.temp - 273.15).toFixed(2)}</h4>
                    <h4>wind :${weatheritem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatheritem.main.humidity}%</h4>
                </div>
                <div class="icons">
                    <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="">
                    <h4>${weatheritem.weather[0].description}</h4>
                </div>`
    } else {

        return ` <li class="card">
                    <h3>(${weatheritem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="">
                    <h4>Temp:${(weatheritem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>wind :${weatheritem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatheritem.main.humidity}%</h4>
                </li>`;
    }
}



const getweatherDetails = (cityname, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;
    // const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_key}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueDates = [];

            // Filter the forecast data to include only one forecast per day

            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueDates.includes(forecastDate)) {
                    return uniqueDates.push(forecastDate);
                    // fiveDaysForecast.push(forecast);
                }

            });

            cityinput.value = "";
            weathercardsdiv.innerHTML = "";
            currentweatherdiv.innerHTML = "";


            fiveDaysForecast.forEach((weatheritem, index) => {
                if (index === 0) {
                    currentweatherdiv.insertAdjacentHTML("beforeend", createWeatherCard(cityname, weatheritem, index))
                } else {

                    weathercardsdiv.insertAdjacentHTML("beforeend", createWeatherCard(cityname, weatheritem, index));
                }
            });


        }).catch((error) => {
            alert("an error occurred while fetching the weather foercat" + error);
        });

}
const getcitycoordinates = () => {
    const cityname = cityinput.value.trim();
    if (!cityname) return;
    const GEO_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_key}`;

    fetch(GEO_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No cordinates found for the ${cityname}`);
        const { name, lat, lon } = data[0];
        getweatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured");
    })
}
const getusercordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getweatherDetails(name, latitude, longitude);
            }).catch((error) => {
                alert("An error occured " + error);
            })
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("geolocation permission has been  denied");
            }
        }
    )
}

searchbutton.addEventListener("click", getcitycoordinates);
locationbutton.addEventListener("click", getusercordinates)
cityinput.addEventListener("keyup", e => e.key === "Enter" && getcitycoordinates());
