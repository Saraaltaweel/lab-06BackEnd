'use strict';


require('dotenv').config();

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/location', handelLocationRequest);
app.get('/weather', handelRestaurantRequest);

function handelLocationRequest(req, res) {

    const searchQuery = req.query;
    console.log(searchQuery);

    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0])
    res.send(location);
}

function handelWeatherRequest(req, res) {
    const weatherRawData = require('./data/weather.json');
    const weatherData = [];

    weatherRawData.nearby_weather.forEach(weather => {
        weatherData.push(new Weather(weather));
    });

    res.send(weatherData);

}


function Location(data) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}


app.use('*', (req, res) => {
    res.send('all good nothing to see here!');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));