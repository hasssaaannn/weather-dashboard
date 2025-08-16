# Weather Dashboard

A real-time weather dashboard that fetches and displays weather data for multiple cities using the OpenWeatherMap API. Features a clean, minimal UI with current weather, 3-day forecasts, and location-based functionality.

## Features

✅ **Real-time Weather Data** - Fetches current weather from OpenWeatherMap API  
✅ **Multiple Cities Support** - Save and monitor weather for multiple cities  
✅ **3-Day Forecast** - View upcoming weather predictions  
✅ **Current Location** - Auto-fetch weather for user's current location  
✅ **Search Functionality** - Search for any city worldwide  
✅ **Loading States** - Smooth loading animations and error handling  
✅ **Responsive Design** - Works perfectly on all device sizes  
✅ **Clean Minimal UI** - Modern, intuitive interface with smooth animations  
✅ **Local Storage** - Cities are saved locally for persistent access  
✅ **Weather Icons** - Dynamic weather icons based on conditions  

## Tools & Libraries Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)** - Async/await, classes, and modern JS features
- **OpenWeatherMap API** - Weather data source
- **Fetch API** - Modern HTTP requests (no external dependencies)
- **Font Awesome** - Weather and UI icons
- **Google Fonts** - Inter font family for clean typography

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/)
2. Sign up for a free account
3. Go to your API keys section
4. Copy your API key

### 2. Configure the Dashboard

1. Open `script.js`
2. Replace `'YOUR_OPENWEATHERMAP_API_KEY'` with your actual API key:

```javascript
this.apiKey = 'your_actual_api_key_here';
```

### 3. Run the Project

1. Open `index.html` in your web browser
2. Allow location access when prompted (for current location feature)
3. Start searching for cities or use your current location

## Usage

### Search for a City
- Type a city name in the search bar
- Press Enter or click the search button
- View current weather and 3-day forecast

### Use Current Location
- Click the location button (📍)
- Allow browser location access
- Weather data will automatically load for your area

### Add Multiple Cities
- Click "Add City" button
- Enter city name in the prompt
- City will be saved and displayed in the grid
- Remove cities by clicking the × button

### Keyboard Shortcuts
- `Ctrl + K` - Focus search input

## API Endpoints Used

- **Current Weather**: `/weather` - Current conditions for a city
- **Forecast**: `/forecast` - 5-day forecast data
- **Geolocation**: Coordinates-based weather lookup

## Project Structure

```
Weather Dashboard/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Features in Detail

### Current Weather Display
- Temperature in Celsius
- Weather description
- Feels like temperature
- Humidity percentage
- Wind speed in km/h
- Dynamic weather icons

### 3-Day Forecast
- Daily weather predictions
- Temperature ranges
- Weather conditions
- Clean card-based layout

### Multiple Cities Management
- Add unlimited cities
- Persistent storage using localStorage
- Quick city removal
- Real-time updates for all saved cities

### Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Features

- Efficient API calls with error handling
- Smooth loading states and animations
- Optimized DOM manipulation
- Local storage for offline city access

## Customization

### Changing Colors
Modify the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f6ad55;
}
```

### Adding More Weather Data
Extend the `displayCurrentWeather` method in `script.js` to show additional weather information like:
- Pressure
- UV index
- Sunrise/sunset times
- Air quality

### Temperature Units
The dashboard currently uses Celsius. To add Fahrenheit support, modify the temperature conversion methods in `script.js`.

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your OpenWeatherMap API key is correctly set
2. **Location Not Working**: Check browser permissions and HTTPS requirement
3. **Cities Not Loading**: Verify internet connection and API status
4. **Styling Issues**: Ensure all CSS and font files are properly linked

### API Limits
- Free OpenWeatherMap accounts have 1000 calls/day limit
- Consider upgrading for production use

## Future Enhancements

- [ ] Temperature unit toggle (Celsius/Fahrenheit)
- [ ] Extended 7-day forecast
- [ ] Weather maps integration
- [ ] Push notifications for weather alerts
- [ ] Dark/light theme toggle
- [ ] Weather history charts
- [ ] Export weather data
- [ ] Multi-language support

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this weather dashboard!

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/) 