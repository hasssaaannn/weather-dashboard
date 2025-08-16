// Weather Dashboard JavaScript
class WeatherDashboard {
    constructor() {
        this.apiKey = 'f0a9e6f3fb4149724fafc37aa450e726'; // OpenWeatherMap API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
        this.currentCity = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedCities();
    }

    initializeElements() {
        this.elements = {
            citySearch: document.getElementById('citySearch'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('errorMessage'),
            currentWeather: document.getElementById('currentWeather'),
            forecast: document.getElementById('forecast'),
            multipleCities: document.getElementById('multipleCities'),
            forecastGrid: document.getElementById('forecastGrid'),
            citiesGrid: document.getElementById('citiesGrid'),
            addCityBtn: document.getElementById('addCityBtn'),
            
            // Current weather elements
            cityName: document.getElementById('cityName'),
            weatherDescription: document.getElementById('weatherDescription'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feelsLike'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            mainWeatherIcon: document.getElementById('mainWeatherIcon')
        };
    }

    bindEvents() {
        this.elements.searchBtn.addEventListener('click', () => this.searchCity());
        this.elements.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.elements.citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });
        this.elements.addCityBtn.addEventListener('click', () => this.showAddCityModal());
    }

    async searchCity() {
        const cityName = this.elements.citySearch.value.trim();
        if (!cityName) {
            this.showError('Please enter a city name.');
            return;
        }

        this.showLoading();
        try {
            const weatherData = await this.fetchWeatherData(cityName);
            if (weatherData) {
                this.displayCurrentWeather(weatherData);
                await this.displayForecast(weatherData.coord);
                this.currentCity = weatherData.name;
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('City not found. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getCurrentLocation() {
        this.showLoading();
        this.elements.locationBtn.disabled = true;
        this.elements.locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';

        try {
            // Try IP-based location first (most reliable for city names)
            const ipLocation = await this.getLocationFromIP();
            
            if (ipLocation && ipLocation.city) {
                const weatherData = await this.fetchWeatherData(ipLocation.city);
                
                if (weatherData) {
                    this.displayCurrentWeather(weatherData);
                    await this.displayForecast(weatherData.coord);
                    this.currentCity = weatherData.name;
                    this.elements.citySearch.value = weatherData.name;
                    this.showSuccess('Location weather loaded successfully!');
                    return;
                }
            }
            
            // Fallback to GPS coordinates if IP method fails
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser.');
            }
            
            const position = await new Promise((resolve, reject) => {
                const options = {
                    timeout: 20000,
                    enableHighAccuracy: true,
                    maximumAge: 0
                };
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

            const { latitude, longitude } = position.coords;
            const cityName = await this.getCityNameFromCoordinates(latitude, longitude);
            
            if (cityName) {
                const weatherData = await this.fetchWeatherData(cityName);
                
                if (weatherData) {
                    this.displayCurrentWeather(weatherData);
                    await this.displayForecast(weatherData.coord);
                    this.currentCity = weatherData.name;
                    this.elements.citySearch.value = weatherData.name;
                    this.showSuccess('Location weather loaded successfully!');
                } else {
                    throw new Error('Failed to fetch weather data');
                }
            } else {
                throw new Error('Could not determine your city location from coordinates');
            }
            
        } catch (error) {
            console.error('Location detection error:', error);
            
            let errorMessage = 'Unable to get your location. ';
            
            if (error.code === 1) {
                errorMessage += 'Please allow location access in your browser settings.';
            } else if (error.code === 2) {
                errorMessage += 'Location unavailable. Please try again.';
            } else if (error.code === 3) {
                errorMessage += 'Request timed out. Please try again.';
            } else {
                errorMessage += 'Please search for a city manually using the search box above.';
            }
            
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
            this.elements.locationBtn.disabled = false;
            this.elements.locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Auto-detect Location';
        }
    }

    // Get location from IP address (most reliable for city names)
    async getLocationFromIP() {
        try {
            // Try multiple IP geolocation services for redundancy
            const services = [
                'https://ipapi.co/json/',
                'https://ipinfo.io/json',
                'https://api.ipify.org?format=json'
            ];
            
            for (const service of services) {
                try {
                    const response = await fetch(service, { timeout: 5000 });
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.city || data.city_name) {
                            return {
                                city: data.city || data.city_name,
                                country: data.country || data.country_name,
                                region: data.region || data.region_name
                            };
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
            
            return null;
        } catch (error) {
            console.error('All IP location services failed:', error);
            return null;
        }
    }

    // Get city name from coordinates using multiple reliable services
    async getCityNameFromCoordinates(lat, lon) {
        try {
            // Try OpenStreetMap Nominatim first (most reliable for city names)
            const cityName1 = await this.getCityNameFromNominatim(lat, lon);
            if (cityName1) return cityName1;
            
            // Fallback to OpenWeatherMap reverse geocoding
            const cityName2 = await this.getCityNameFromOpenWeatherMap(lat, lon);
            if (cityName2) return cityName2;
            
            return null;
        } catch (error) {
            console.error('Error getting city name from coordinates:', error);
            return null;
        }
    }

    // Get city name from Nominatim (OpenStreetMap) - most reliable
    async getCityNameFromNominatim(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en&zoom=10`
            );
            
            if (!response.ok) return null;
            
            const data = await response.json();
            
            if (data && data.address) {
                const city = data.address.city || 
                           data.address.town || 
                           data.address.village || 
                           data.address.county ||
                           data.address.state_district;
                
                if (city) {
                    const country = data.address.country;
                    return country ? `${city}, ${country}` : city;
                }
                
                if (data.display_name) {
                    const parts = data.display_name.split(',');
                    return parts[0].trim();
                }
            }
            
            return null;
        } catch (error) {
            console.error('Nominatim error:', error);
            return null;
        }
    }

    // Get city name from OpenWeatherMap reverse geocoding
    async getCityNameFromOpenWeatherMap(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
            );
            
            if (!response.ok) return null;
            
            const data = await response.json();
            if (data && data.length > 0) {
                const city = data[0].name;
                const country = data[0].country;
                return country ? `${city}, ${country}` : city;
            }
            
            return null;
        } catch (error) {
            console.error('OpenWeatherMap geocoding error:', error);
            return null;
        }
    }

    async fetchWeatherData(cityName) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
                } else if (response.status === 404) {
                    throw new Error('City not found');
                } else {
                    throw new Error(`API error: ${response.status}`);
                }
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async fetchForecastData(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Forecast fetch error:', error);
            throw error;
        }
    }

    displayCurrentWeather(data) {
        this.elements.cityName.textContent = data.name;
        this.elements.weatherDescription.textContent = data.weather[0].description;
        this.elements.temperature.textContent = Math.round(data.main.temp);
        this.elements.feelsLike.textContent = Math.round(data.main.feels_like);
        this.elements.humidity.textContent = data.main.humidity;
        this.elements.windSpeed.textContent = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
        
        this.elements.mainWeatherIcon.className = this.getWeatherIcon(data.weather[0].main, data.weather[0].description);
        
        this.elements.currentWeather.classList.remove('hidden');
        this.elements.error.classList.add('hidden');
    }

    async displayForecast(coords) {
        try {
            const forecastData = await this.fetchForecastData(coords.lat, coords.lon);
            const dailyForecasts = this.processForecastData(forecastData.list);
            
            this.elements.forecastGrid.innerHTML = dailyForecasts.map(day => `
                <div class="forecast-card">
                    <div class="forecast-date">${day.date}</div>
                    <div class="forecast-icon">
                        <i class="${this.getWeatherIcon(day.weather, day.description)}"></i>
                    </div>
                    <div class="forecast-temp">${Math.round(day.temp)}°C</div>
                    <div class="forecast-desc">${day.description}</div>
                </div>
            `).join('');
            
            this.elements.forecast.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }

    processForecastData(forecastList) {
        const dailyData = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = {
                    date: dayKey,
                    temp: item.main.temp,
                    weather: item.weather[0].main,
                    description: item.weather[0].description
                };
            }
        });
        
        // Return next 3 days
        return Object.values(dailyData).slice(0, 3);
    }

    getWeatherIcon(weatherMain, description) {
        const weatherIcons = {
            'Clear': 'fas fa-sun',
            'Clouds': 'fas fa-cloud',
            'Rain': 'fas fa-cloud-rain',
            'Drizzle': 'fas fa-cloud-rain',
            'Thunderstorm': 'fas fa-bolt',
            'Snow': 'fas fa-snowflake',
            'Mist': 'fas fa-smog',
            'Smoke': 'fas fa-smog',
            'Haze': 'fas fa-smog',
            'Dust': 'fas fa-smog',
            'Fog': 'fas fa-smog',
            'Sand': 'fas fa-smog',
            'Ash': 'fas fa-smog',
            'Squall': 'fas fa-wind',
            'Tornado': 'fas fa-wind'
        };
        
        return weatherIcons[weatherMain] || 'fas fa-cloud';
    }

    async addCity(cityName) {
        if (this.savedCities.includes(cityName)) {
            this.showError('City is already in your list.');
            return;
        }

        try {
            const weatherData = await this.fetchWeatherData(cityName);
            if (weatherData) {
                this.savedCities.push(cityName);
                localStorage.setItem('savedCities', JSON.stringify(this.savedCities));
                this.loadSavedCities();
                this.hideAddCityModal();
            }
        } catch (error) {
            this.showError('City not found. Please try again.');
        }
    }

    removeCity(cityName) {
        this.savedCities = this.savedCities.filter(city => city !== cityName);
        localStorage.setItem('savedCities', JSON.stringify(this.savedCities));
        this.loadSavedCities();
    }

    async loadSavedCities() {
        if (this.savedCities.length === 0) {
            this.elements.multipleCities.classList.add('hidden');
            return;
        }

        this.elements.multipleCities.classList.remove('hidden');
        this.elements.citiesGrid.innerHTML = '';

        for (const cityName of this.savedCities) {
            try {
                const weatherData = await this.fetchWeatherData(cityName);
                if (weatherData) {
                    this.addCityCard(weatherData);
                }
            } catch (error) {
                console.error(`Error loading weather for ${cityName}:`, error);
            }
        }
    }

    addCityCard(weatherData) {
        const cityCard = document.createElement('div');
        cityCard.className = 'city-card';
        cityCard.innerHTML = `
            <div class="city-header">
                <div class="city-name">${weatherData.name}</div>
                <button class="remove-city" onclick="weatherDashboard.removeCity('${weatherData.name}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="city-weather">
                <div class="city-icon">
                    <i class="${this.getWeatherIcon(weatherData.weather[0].main, weatherData.weather[0].description)}"></i>
                </div>
                <div>
                    <div class="city-temp">${Math.round(weatherData.main.temp)}°C</div>
                    <div class="city-desc">${weatherData.weather[0].description}</div>
                </div>
            </div>
        `;
        
        this.elements.citiesGrid.appendChild(cityCard);
    }

    showAddCityModal() {
        const cityName = prompt('Enter city name:');
        if (cityName && cityName.trim()) {
            this.addCity(cityName.trim());
        }
    }

    hideAddCityModal() {
        // Modal is handled by prompt, no need to hide
    }

    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.error.classList.add('hidden');
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.error.classList.remove('hidden');
        this.elements.loading.classList.add('hidden');
        console.error('Dashboard Error:', message);
    }

    showSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        `;
        
        document.querySelector('.container').insertBefore(successDiv, document.querySelector('.header').nextSibling);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize the dashboard when the page loads
let weatherDashboard;

document.addEventListener('DOMContentLoaded', () => {
    weatherDashboard = new WeatherDashboard();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        weatherDashboard.elements.citySearch.focus();
    }
}); 