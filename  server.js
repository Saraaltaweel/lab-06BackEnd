'use strict';


require('dotenv').config();

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT ||3001;
const app = express();
app.use(cors());

app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);

function handelLocationRequest(req, res) {

    const searchQuery = req.query.city;
  
    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0])
    res.send(location);
}

function handelWeatherRequest(req, res) {
    const weatherRawData = require('./data/weather.json');
    const weatherData = [];

    weatherRawData.weatherRawData.forEach(weather => {
        weatherData.push(new Weather(weather));
    });

    res.send(weatherData);

}


function Location(data) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}
function Weather(data) {
    this.description = data.description.name;
    this.valid_date = data.valid_date;
    
}
function errorHandler(err, req, res, next) {
    ResizeObserverSize.status(500).send('something is wrong in server');}
  
    app.use(errorHandler);

    app.use('*', notFoundHandler);

    function notFoundHandler(req, res) { 
    res.status(404).send('requested API is Not Found!');}

app.use('*', (req, res) => {
    res.send('all good nothing to see here!');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));