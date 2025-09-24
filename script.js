const apiKey = "Your new key"; // Your new key

// DOM Elements
const locationEl = document.getElementById('location');
const descriptionEl = document.getElementById('description');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const iconEl = document.getElementById('icon');
const forecastCardsEl = document.getElementById('forecast-cards');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const themeIcon = document.getElementById('theme-icon');
const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');

let hourlyChart;

// Dark/Light mode toggle
themeIcon.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeIcon.classList.toggle('fa-sun');
    themeIcon.classList.toggle('fa-moon');
});

// Fetch weather by city
function fetchWeatherByCity(city){
    // Current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res=>res.json())
    .then(data=>{
        if(data.cod===200) displayCurrentWeather(data);
        else alert("City not found");
    }).catch(err=>alert("Network error"));

    // Forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(res=>res.json())
    .then(data=>{
        if(data.cod==="200") displayForecast(data);
        else alert("Forecast fetch failed: "+data.message);
    }).catch(err=>alert("Network error"));
}

// Fetch weather by coordinates
function fetchWeatherByCoords(lat, lon){
    // Current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res=>res.json())
    .then(data=>{
        if(data.cod===200) displayCurrentWeather(data);
        else alert("Current weather fetch failed");
    }).catch(err=>alert("Network error"));

    // Forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res=>res.json())
    .then(data=>{
        if(data.cod==="200") displayForecast(data);
        else alert("Forecast fetch failed: "+data.message);
    }).catch(err=>alert("Network error"));
}

// Search button
searchBtn.addEventListener('click', ()=>{
    const city = cityInput.value.trim();
    if(city) fetchWeatherByCity(city);
});

// Display current weather
function displayCurrentWeather(data){
    locationEl.textContent = `${data.name}, ${data.sys.country}`;
    descriptionEl.textContent = data.weather[0].description;
    temperatureEl.textContent = Math.round(data.main.temp);
    humidityEl.textContent = data.main.humidity;
    windEl.textContent = data.wind.speed;
    iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

// Display forecast and hourly chart
function displayForecast(data){
    // 5-day forecast
    forecastCardsEl.innerHTML = "";
    for(let i=0;i<data.list.length;i+=8){
        const day = data.list[i];
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML=`
            <p>${new Date(day.dt_txt).toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'})}</p>
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${day.weather[0].main}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" width="50">
        `;
        forecastCardsEl.appendChild(card);
    }

    // Next 12 hours chart
    const next12 = data.list.slice(0,12);
    const labels = next12.map(item=>new Date(item.dt_txt).getHours()+":00");
    const temps = next12.map(item=>Math.round(item.main.temp));

    if(hourlyChart) hourlyChart.destroy();
    hourlyChart = new Chart(hourlyCtx,{
        type:'line',
        data:{
            labels:labels,
            datasets:[{
                label:'Temperature (°C)',
                data:temps,
                backgroundColor:'rgba(30,144,255,0.2)',
                borderColor:'rgba(30,144,255,1)',
                borderWidth:2,
                tension:0.4,
                fill:true
            }]
        },
        options:{
            responsive:true,
            plugins:{ legend:{ labels:{ color: document.body.classList.contains('dark')?'#fff':'#000' } } },
            scales:{
                y:{ ticks:{ color: document.body.classList.contains('dark')?'#fff':'#000' } },
                x:{ ticks:{ color: document.body.classList.contains('dark')?'#fff':'#000' } }
            }
        }
    });
}

// On load, use geolocation
window.onload = ()=>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            pos=>fetchWeatherByCoords(pos.coords.latitude,pos.coords.longitude),
            ()=>fetchWeatherByCity("London")
        );
    } else {
        fetchWeatherByCity("London");
    }
};
